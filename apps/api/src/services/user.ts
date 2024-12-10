import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { db } from "./db";

class UserService {
  async getById(id: number) {
    const user = await db.select().from(users).where(eq(users.id, id));

    return user[0];
  }
}

export const userService = new UserService();
