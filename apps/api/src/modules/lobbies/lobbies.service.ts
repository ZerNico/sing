import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import * as v from "valibot";
import { config } from "../../config";
import { db } from "../../db/connection";
import { lobbies, users } from "../../db/schema";
import { lobbyTokenSchema } from "./lobbies.models";

class LobbiesService {
  private jwtSecret = new TextEncoder().encode(config.JWT_SECRET);

  async createLobby() {
    const [lobby] = await db
      .insert(lobbies)
      .values({ id: this.generateLobbyCode(6) })
      .returning();

    return lobby;
  }

  private generateLobbyCode(length: number) {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < length; i++) {
      code += characters[Math.floor(Math.random() * characters.length)];
    }

    return code;
  }

  async createLobbyToken(lobbyId: string) {
    const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 1000); // 24 hours

    return {
      token: await new SignJWT({ type: "lobby" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setIssuer("api")
        .setAudience("api")
        .setSubject(lobbyId)
        .setExpirationTime(expiresAt)
        .sign(this.jwtSecret),
      expiresAt,
    };
  }

  async verifyLobbyToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret, { issuer: "api", audience: "api" });
      return v.parse(lobbyTokenSchema, payload);
    } catch (error) {
      return;
    }
  }

  async getById(id: string) {
    const [lobby] = await db.select().from(lobbies).where(eq(lobbies.id, id));

    return lobby;
  }

  async getByIdWithUsers(id: string) {
    const result = await db.query.lobbies.findFirst({
      where: (lobby, { eq }) => eq(lobby.id, id),
      with: {
        users: {
          columns: {
            password: false,
            googleId: false,
            discordId: false,
          },
        },
      },
    });

    return result;
  }

  async getByUserIdWithUsers(userId: number) {
    const result = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, userId),
      with: {
        lobby: {
          with: {
            users: {
              columns: {
                password: false,
                googleId: false,
                discordId: false,
              },
            },
          },
        },
      },
    });

    return result?.lobby;
  }

  async joinLobby(lobbyId: string, userId: number) {
    await db.update(users).set({ lobbyId }).where(eq(users.id, userId));
  }

  async leaveLobby(userId: number) {
    await db.update(users).set({ lobbyId: null }).where(eq(users.id, userId));
  }
}

export const lobbiesService = new LobbiesService();
