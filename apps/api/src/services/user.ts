import { type InferInsertModel, eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { User } from "../types";
import { lower } from "../utils/db";
import { db } from "./db";

class UserService {
  async getById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));

    return user;
  }

  async getByUsername(username: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(lower(users.username), username.toLowerCase()));

    return user;
  }

  async getByGoogleId(googleId: string) {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));

    return user;
  }

  async getByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(lower(users.email), email.toLowerCase()));

    return user;
  }

  async update(id: number, user: Partial<User>) {
    const { id: _, ...userWithoutId } = user;

    const [updatedUser] = await db.update(users).set(userWithoutId).where(eq(users.id, id)).returning();

    return updatedUser;
  }

  async create(user: InferInsertModel<typeof users>) {
    const [newUser] = await db.insert(users).values(user).returning();

    return newUser;
  }
}

export const userService = new UserService();
