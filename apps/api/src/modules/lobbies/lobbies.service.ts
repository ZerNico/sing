import { SignJWT } from "jose";
import { config } from "../../config";
import { db } from "../../db/connection";
import { lobbies } from "../../db/schema";

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
}

export const lobbiesService = new LobbiesService();
