import { SignJWT, jwtVerify } from "jose";
import * as v from "valibot";
import { config } from "../config";
import type { User } from "../types";

export type TokenType = "access" | "refresh";

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

export class JWTService {
  private secret = new TextEncoder().encode(config.JWT_SECRET);

  async createToken(user: User, type: TokenType) {
    const expirationSeconds = type === "access" ? 60 * 60 : 30 * 24 * 60 * 60;
    const expiresAt = new Date(Date.now() + expirationSeconds * 1000);

    return {
      token: await new SignJWT({ type, emailVerified: user.emailVerified })
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

  async verifyToken(jwt: string, type: TokenType) {
    try {
      const { payload } = await jwtVerify(jwt, this.secret, { issuer: "api", audience: "api" });
      const schema = type === "access" ? accessTokenSchema : refreshTokenSchema;
      return v.parse(schema, payload);
    } catch (error) {
      return null;
    }
  }
}

export const jwtService = new JWTService();
