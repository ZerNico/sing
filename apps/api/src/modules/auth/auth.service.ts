import { renderResetPassword, renderVerifyEmail } from "@tuneperfect/email";
import { and, eq, sql } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";
import postgres from "postgres";
import { joinURL } from "ufo";
import * as v from "valibot";
import { config } from "../../config";
import { db } from "../../db/connection";
import { passwordResetTokens, refreshTokens, verificationTokens } from "../../db/schema";
import { randomReadableCode } from "../../utils/random";
import type { User } from "../users/users.models";
import { usersService } from "../users/users.service";
import { accessTokenSchema, refreshTokenSchema } from "./auth.models";

class AuthService {
  private jwtSecret = new TextEncoder().encode(config.JWT_SECRET);
  private transporter = nodemailer.createTransport(config.EMAIL_SMTP_URI);

  async register({ password, email }: { password: string; email: string }) {
    try {
      const user = await usersService.create({ email, password });

      return user;
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "23505") {
        return;
      }

      throw error;
    }
  }

  async login({ login, password }: { login: string; password: string }) {
    const user = (await usersService.getByUsername(login)) ?? (await usersService.getByEmail(login));

    if (!user || !user.password) {
      return null;
    }

    const isValid = await Bun.password.verify(password, user.password);
    return isValid ? user : null;
  }

  async verifyEmail(userId: number, code: string) {
    const [verificationToken] = await db
      .select()
      .from(verificationTokens)
      .where(and(eq(verificationTokens.userId, userId), eq(verificationTokens.token, code), sql`expires_at > now()`));

    if (!verificationToken) {
      return;
    }

    const user = await db.transaction(async (tx) => {
      await tx.delete(verificationTokens).where(eq(verificationTokens.userId, userId)).execute();
      return await usersService.update(userId, { emailVerified: true }, { tx });
    });

    return user;
  }

  async createTokens(user: User) {
    const accessExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const accessToken = await this.createToken(user, { expiresAt: accessExpiresAt, type: "access" });
    const refreshToken = await this.createToken(user, { expiresAt: refreshExpiresAt, type: "refresh" });

    await db
      .insert(refreshTokens)
      .values({ token: refreshToken.token, userId: user.id, expiresAt: refreshToken.expiresAt })
      .execute();

    return { accessToken, refreshToken };
  }

  async rotateTokens(refreshToken: string) {
    const accessExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) {
      return;
    }

    const oldRefreshToken = (
      await db
        .select()
        .from(refreshTokens)
        .where(
          and(eq(refreshTokens.token, refreshToken), eq(refreshTokens.userId, payload.sub), sql`expires_at > now()`),
        )
    )[0];
    if (!oldRefreshToken) {
      return;
    }

    const user = await usersService.getById(payload.sub);
    if (!user) {
      return;
    }

    const [newRefreshToken, newAccessToken] = await Promise.all([
      this.createToken(user, { expiresAt: refreshExpiresAt, type: "refresh" }),
      this.createToken(user, { expiresAt: accessExpiresAt, type: "access" }),
    ]);

    await db
      .update(refreshTokens)
      .set({ token: newRefreshToken.token, expiresAt: newRefreshToken.expiresAt })
      .where(eq(refreshTokens.token, refreshToken))
      .execute();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  public async removeRefreshToken(token: string, userId: number) {
    await db
      .delete(refreshTokens)
      .where(and(eq(refreshTokens.token, token), eq(refreshTokens.userId, userId)))
      .execute();
  }

  private async createToken(user: User, { expiresAt, type }: { expiresAt: Date; type: "access" | "refresh" }) {
    return {
      token: await new SignJWT({ type, emailVerified: user.emailVerified })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("api")
        .setAudience("api")
        .setExpirationTime(expiresAt)
        .setSubject(user.id.toString())
        .sign(this.jwtSecret),
      expiresAt,
    };
  }

  async verifyAccessToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret, { issuer: "api", audience: "api" });
      const schema = accessTokenSchema;
      return v.parse(schema, payload);
    } catch (error) {
      return;
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret, { issuer: "api", audience: "api" });
      return v.parse(refreshTokenSchema, payload);
    } catch (error) {
      return;
    }
  }

  async sendVerificationEmail(user: User) {
    const [existingToken] = await db.select().from(verificationTokens).where(eq(verificationTokens.userId, user.id));

    if (existingToken) {
      const timeSinceLastToken = Date.now() - existingToken.createdAt.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceLastToken < fiveMinutes) {
        const expiresAt = new Date(existingToken.createdAt.getTime() + fiveMinutes);
        return { rateLimited: true, expiresAt };
      }
    }

    const code = randomReadableCode(8);
    const verificationData = {
      token: code,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    await db
      .insert(verificationTokens)
      .values(verificationData)
      .onConflictDoUpdate({
        target: verificationTokens.userId,
        set: { ...verificationData, createdAt: sql`now()` },
      })
      .execute();

    const props = {
      code: code,
      url: config.LANDING_URL,
      supportUrl: `mailto:${config.SUPPORT_EMAIL}`,
    };

    const emailHtml = await renderVerifyEmail(props);
    const emailText = await renderVerifyEmail(props, { plainText: true });

    await this.transporter.sendMail({
      from: config.EMAIL_FROM_MAIL,
      to: user.email,
      subject: "Verify your E-Mail",
      html: emailHtml,
      text: emailText,
    });
  }

  async sendPasswordResetEmail(email: string) {
    const user = await usersService.getByEmail(email);
    if (!user) {
      return { notFound: true };
    }

    const [existingToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

    if (existingToken) {
      const timeSinceLastToken = Date.now() - existingToken.createdAt.getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (timeSinceLastToken < fiveMinutes) {
        const expiresAt = new Date(existingToken.createdAt.getTime() + fiveMinutes);
        return { rateLimited: true, expiresAt };
      }
    }

    const code = randomReadableCode(8);
    const resetData = {
      token: code,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    };

    await db
      .insert(passwordResetTokens)
      .values(resetData)
      .onConflictDoUpdate({
        target: passwordResetTokens.userId,
        set: { ...resetData, createdAt: sql`now()` },
      })
      .execute();

    const props = {
      code: code,
      url: joinURL(config.APP_URL, "/reset-password"),
      supportUrl: `mailto:${config.SUPPORT_EMAIL}`,
    };

    const emailHtml = await renderResetPassword(props);
    const emailText = await renderResetPassword(props, { plainText: true });

    await this.transporter.sendMail({
      from: config.EMAIL_FROM_MAIL,
      to: user.email,
      subject: "Reset your Password",
      html: emailHtml,
      text: emailText,
    });

    return { success: true };
  }

  async resetPassword(code: string, newPassword: string) {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.token, code), sql`expires_at > now()`));

    if (!resetToken) {
      return { invalidCode: true };
    }

    const user = await db.transaction(async (tx) => {
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, resetToken.userId)).execute();
      return await usersService.update(resetToken.userId, { password: newPassword }, { tx });
    });

    if (!user) {
      return { userNotFound: true };
    }

    return { success: true };
  }
}

export const authService = new AuthService();
