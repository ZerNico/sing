import { eq } from "drizzle-orm";
import { refreshTokens, users } from "../db/schema";
import type { User } from "../types";
import { db } from "./db";
import { jwtService } from "./jwt";
import { userService } from "./user";

class AuthService {
  async register({ username, password }: { username: string; password: string }) {
    try {
      const hashedPassword = await Bun.password.hash(password);
      const [user] = await db.insert(users).values({ username, password: hashedPassword }).returning();

      return user ?? null;
    } catch (error) {
      return null;
    }
  }

  async login({ username, password }: { username: string; password: string }) {
    const user = (await db.select().from(users).where(eq(users.username, username)))[0];
    if (!user) return null;

    const isValid = await Bun.password.verify(password, user.password);
    return isValid ? user : null;
  }

  async createAccessToken(user: User) {
    return jwtService.createToken(user.id, "access");
  }

  async createRefreshToken(user: User) {
    const refreshToken = await jwtService.createToken(user.id, "refresh");
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
    if (!payload) return null;

    const oldRefreshToken = (await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken)))[0];
    if (!oldRefreshToken) return null;

    const user = await userService.getById(payload.sub);
    if (!user) return null;

    const [accessToken, newRefreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);

    await this.updateRefreshToken(oldRefreshToken.token, newRefreshToken.token, newRefreshToken.expiresAt);

    return { accessToken, refreshToken: newRefreshToken, user };
  }
}

export const authService = new AuthService();
