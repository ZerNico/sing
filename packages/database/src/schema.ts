import { relations } from 'drizzle-orm'
import { bigint, boolean, pgTable, varchar } from 'drizzle-orm/pg-core'

export const tables = {
  user: 'auth_user',
  session: 'auth_session',
  key: 'auth_key',
} as const

export const user = pgTable(tables.user, {
  id: varchar('id', { length: 15 }).primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  disabled: boolean('disabled').notNull().default(false),
})

export const usersRelations = relations(user, ({ many }) => ({
  session: many(session),
  key: many(key),
}))

export const session = pgTable(tables.session, {
  id: varchar('id', { length: 128 }).primaryKey(),
  userId: varchar('user_id', { length: 15 })
    .notNull()
    .references(() => user.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
  activeExpires: bigint('active_expires', { mode: 'number' }).notNull(),
  idleExpires: bigint('idle_expires', { mode: 'number' }).notNull(),
})

export const sessionsRelations = relations(session, ({ one }) => ({
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

export const keysRelations = relations(key, ({ one }) => ({
  user: one(user, {
    fields: [key.userId],
    references: [user.id],
  }),
}))
