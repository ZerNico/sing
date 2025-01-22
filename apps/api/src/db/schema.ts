import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { lower } from "../utils/db";

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    password: varchar({ length: 255 }),
    username: varchar({ length: 255 }).unique(),
    email: varchar({ length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    picture: varchar({ length: 255 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
    discordId: varchar("discord_id", { length: 255 }).unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lobbyId: varchar("lobby_id", { length: 8 }).references(() => lobbies.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
  },
  (table) => [
    uniqueIndex("email_unique_index").on(lower(table.email)),
    uniqueIndex("username_unique_index").on(lower(table.username)),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  lobby: one(lobbies, {
    fields: [users.lobbyId],
    references: [lobbies.id],
  }),
  verificationTokens: one(verificationTokens, {
    fields: [users.id],
    references: [verificationTokens.userId],
  }),
  refreshTokens: one(refreshTokens, {
    fields: [users.id],
    references: [refreshTokens.userId],
  }),
}));

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

export const verificationTokens = pgTable("verification_tokens", {
  token: varchar({ length: 255 }).notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .unique()
    .primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id],
  }),
}));

export const lobbies = pgTable("lobbies", {
  id: varchar({ length: 8 }).primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lobbiesRelations = relations(lobbies, ({ many }) => ({
  users: many(users),
}));
