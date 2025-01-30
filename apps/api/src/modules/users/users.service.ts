import crypto from "node:crypto";
import path from "node:path";
import { type InferInsertModel, eq } from "drizzle-orm";
import type { PostgresJsTransaction } from "drizzle-orm/postgres-js";
import sharp from "sharp";
import { config } from "../../config";
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

  async getByDiscordId(discordId: string) {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));

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

    const userToUpdate = { ...userWithoutId };
    if (userToUpdate.password) {
      userToUpdate.password = await Bun.password.hash(userToUpdate.password);
    }

    const [updatedUser] = await connection.update(users).set(userToUpdate).where(eq(users.id, id)).returning();

    return updatedUser;
  }

  async create(user: InferInsertModel<typeof users>) {
    const userToCreate = { ...user };
    if (userToCreate.password) {
      userToCreate.password = await Bun.password.hash(userToCreate.password);
    }

    const [newUser] = await db.insert(users).values(userToCreate).returning();
    return newUser;
  }

  async uploadPicture(userId: number, file: File) {
    const picturesPath = path.join(config.UPLOADS_PATH, "pictures");
    const pictureName = `${userId}.webp`;
    const filePath = path.join(picturesPath, pictureName);
    await Bun.write(filePath, await this.compressPicture(file));

    const hash = crypto.randomBytes(16).toString("hex");
    await this.update(userId, { picture: `/v1.0/users/pictures/${pictureName}?${hash}` });
  }

  async compressPicture(file: File) {
    const buffer = await file.arrayBuffer();
    const compressedFile = await sharp(buffer).resize(512, 512, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
    return compressedFile;
  }

  async getPicture(picturePath: string) {
    const filename = path.basename(picturePath);
    const filePath = path.join(config.UPLOADS_PATH, "pictures", filename);
    return Bun.file(filePath);
  }
}

export const usersService = new UsersService();
