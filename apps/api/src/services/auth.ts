import { eq } from "drizzle-orm";
import postgres from "postgres";
import { refreshTokens, users, verificationTokens } from "../db/schema";
import type { User } from "../types";
import { db } from "./db";
import { emailService } from "./email";
import { jwtService } from "./jwt";
import { userService } from "./user";

class AuthService {
  async register({ username, password, email }: { username: string; password: string; email: string }) {
    try {
      const hashedPassword = await Bun.password.hash(password);

      const user = await userService.create({ username, email, password: hashedPassword });

      return user;
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "23505") {
        return;
      }

      throw error;
    }
  }

  async login({ username, password }: { username: string; password: string }) {
    const user = (await db.select().from(users).where(eq(users.username, username)))[0];

    if (!user || !user.password) return null;

    const isValid = await Bun.password.verify(password, user.password);
    return isValid ? user : null;
  }

  async sendVerifyEmail(user: User) {
    const code = Math.floor(100000 + Math.random() * 900000);
    await db
      .insert(verificationTokens)
      .values({
        token: code,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      })
      .onConflictDoUpdate({
        target: verificationTokens.userId,
        set: {
          token: code,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
        },
      })
      .execute();

    await emailService.sendVerifyEmail(user.email, code);
  }

  async createAccessToken(user: User) {
    return jwtService.createToken(user, "access");
  }

  async createRefreshToken(user: User) {
    const refreshToken = await jwtService.createToken(user, "refresh");
    await db
      .insert(refreshTokens)
      .values({ token: refreshToken.token, userId: user.id, expiresAt: refreshToken.expiresAt })
      .execute();
    return refreshToken;
  }

  async verifyAccessToken(jwt: string) {
    return jwtService.verifyToken(jwt, "access");
  }

  async verifyRefreshToken(jwt: string) {
    return jwtService.verifyToken(jwt, "refresh");
  }

  async updateRefreshToken(oldToken: string, newToken: string, expiresAt: Date) {
    await db
      .update(refreshTokens)
      .set({ token: newToken, expiresAt })
      .where(eq(refreshTokens.token, oldToken))
      .execute();
  }

  async rotateTokens(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    if (!payload) return;

    const oldRefreshToken = (await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken)))[0];
    if (!oldRefreshToken) return;

    const user = await userService.getById(payload.sub);
    if (!user) return;

    const [accessToken, newRefreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);

    await this.updateRefreshToken(oldRefreshToken.token, newRefreshToken.token, newRefreshToken.expiresAt);

    return { accessToken, refreshToken: newRefreshToken, user };
  }
}

export const authService = new AuthService();
