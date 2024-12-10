import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  password: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }),
  email: varchar({ length: 255 }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  token: varchar({ length: 255 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});
