import { drizzle, migrate, PostgresJsDatabase, schema } from 'database'
import postgres from 'postgres'

import { env } from '../config/env.js'

export const connection = postgres(env.API_DB_URL)

export const db: PostgresJsDatabase<typeof schema> = drizzle(connection, { schema })

await migrate(db, { migrationsFolder: '../../packages/database/drizzle' })

export { type InferModel, schema } from 'database'
