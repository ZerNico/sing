import { type InferInsertModel, eq } from "drizzle-orm";
import type { PostgresJsTransaction } from "drizzle-orm/postgres-js";
import { type Transaction, db } from "../../db/connection";
import { users } from "../../db/schema";
import { lower } from "../../utils/db";
import type { User } from "./users.models";

class UsersService {
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

  async update(id: number, user: Partial<User>, { tx }: { tx?: Transaction } = {}) {
    const connection = tx ?? db;
    const { id: _, ...userWithoutId } = user;

    const [updatedUser] = await connection.update(users).set(userWithoutId).where(eq(users.id, id)).returning();

    return updatedUser;
  }

  async create(user: InferInsertModel<typeof users>) {
    const [newUser] = await db.insert(users).values(user).returning();

    return newUser;
  }
}

export const usersService = new UsersService();


