import { relations } from 'drizzle-orm'
import { bigint, boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const tables = {
  user: 'auth_user',
  session: 'auth_session',
  key: 'auth_key',
} as const

export const user = pgTable(tables.user, {
  id: varchar('id', { length: 15 }).primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  disabled: boolean('disabled').notNull().default(false),
  lobbyCode: varchar('lobby_code').references(() => lobby.code, { onUpdate: 'cascade', onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const userRelations = relations(user, ({ many, one }) => ({
  session: many(session),
  key: many(key),
  lobby: one(lobby, {
    fields: [user.lobbyCode],
    references: [lobby.code],
  }),
}))

export const session = pgTable(tables.session, {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 15 })
    .notNull()
    .references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  activeExpires: bigint('active_expires', { mode: 'number' }).notNull(),
  idleExpires: bigint('idle_expires', { mode: 'number' }).notNull(),
})

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const key = pgTable(tables.key, {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 15 })
    .notNull()
    .references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  hashedPassword: varchar('hashed_password', { length: 255 }),
})

export const keyRelations = relations(key, ({ one }) => ({
  user: one(user, {
    fields: [key.userId],
    references: [user.id],
  }),
}))

export const lobby = pgTable('game_lobby', {
  id: uuid('id').defaultRandom().notNull(),
  code: varchar('code', { length: 32 }).primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const lobbyRelations = relations(lobby, ({ many }) => ({
  users: many(user),
}))
