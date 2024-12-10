import { type InferSelectModel, eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import * as v from "valibot";
import { config } from "../config";
import { refreshTokens, users } from "../db/schema";
import { db } from "./db";

type TokenType = "access" | "refresh";

class AuthService {
  private secret = new TextEncoder().encode(config.JWT_SECRET);

  async register({ username, password }: { username: string; password: string }) {
    try {
      const hashedPassword = await Bun.password.hash(password);
      const [user] = await db.insert(users).values({ username, password: hashedPassword }).returning();

      if (!user) {
        throw new Error("Failed to register user");
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  async login({ username, password }: { username: string; password: string }) {
    const user = (await db.select().from(users).where(eq(users.username, username)))[0];

    if (!user) {
      return null;
    }

    const isValid = await Bun.password.verify(password, user.password);

    if (!isValid) {
      return null;
    }

    return user;
  }
  async createAccessToken(user: InferSelectModel<typeof users>) {
    return this.createToken(user, "access");
  }

  async createRefreshToken(user: InferSelectModel<typeof users>) {
    const refreshToken = await this.createToken(user, "refresh");
    await this.storeRefreshToken(user, refreshToken.token, refreshToken.expiresAt);

    return refreshToken;
  }

  async storeRefreshToken(user: InferSelectModel<typeof users>, refreshToken: string, expiresAt: Date) {
    await db.insert(refreshTokens).values({ token: refreshToken, userId: user.id, expiresAt }).execute();
  }

  async findRefreshToken(token: string) {
    const refreshToken = (await db.select().from(refreshTokens).where(eq(refreshTokens.token, token)))[0];

    return refreshToken;
  }

  async updateRefreshToken(oldToken: string, newToken: string, expiresAt: Date) {
    await db
      .update(refreshTokens)
      .set({ token: newToken, expiresAt })
      .where(eq(refreshTokens.token, oldToken))
      .execute();
  }

  async verifyAccessToken(jwt: string) {
    try {
      const { payload } = await jwtVerify(jwt, this.secret, { issuer: "api", audience: "api" });

      return v.parse(accessTokenSchema, payload);
    } catch (error) {
      return null;
    }
  }

  async verifyRefreshToken(jwt: string) {
    try {
      const { payload } = await jwtVerify(jwt, this.secret, { issuer: "api", audience: "api" });

      return v.parse(refreshTokenSchema, payload);
    } catch (error) {
      return null;
    }
  }

  private async createToken(user: InferSelectModel<typeof users>, type: TokenType) {
    const expirationSeconds =
      type === "access"
        ? 60 * 60 // 1 hour
        : 30 * 24 * 60 * 60; // 30 days
    const expiresAt = new Date(Date.now() + expirationSeconds * 1000);

    return {
      token: await new SignJWT({ type })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("api")
        .setAudience("api")
        .setExpirationTime(expiresAt)
        .setSubject(user.id.toString())
        .sign(this.secret),
      expiresAt,
    };
  }
}

const baseJwtSchema = v.object({
  sub: v.pipe(v.string(), v.transform(Number), v.number()),
  iat: v.number(),
  exp: v.number(),
  iss: v.literal("api"),
  aud: v.literal("api"),
});

const accessTokenSchema = v.object({
  ...baseJwtSchema.entries,
  type: v.literal("access"),
});

const refreshTokenSchema = v.object({
  ...baseJwtSchema.entries,
  type: v.literal("refresh"),
});

export const authService = new AuthService();
