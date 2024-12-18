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
    createdAt: timestamp("created_at").notNull().defaultNow(),
    picture: varchar({ length: 255 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
  },
  (table) => [uniqueIndex("email_unique_index").on(lower(table.email))],
);

export const usersRelations = relations(users, ({ one }) => ({
  verificationTokens: one(verificationTokens),
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
