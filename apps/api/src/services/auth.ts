import { users } from "database";
import postgres from "postgres";
import { db } from "./db";

class AuthService {
  async register({ username, password }: { username: string; password: string }) {
    try {
      const hashedPassword = await Bun.password.hash(password);
      const [user] = await db.insert(users).values({ username, password: hashedPassword }).returning();

      if (!user) {
        throw new Error("Failed to register user");
      }
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "23505") {
        throw new Error("Username already exists");
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
