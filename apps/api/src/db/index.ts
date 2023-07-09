import { drizzle, migrate } from 'database'
import postgres from 'postgres'

import { env } from '../config/env.ts'

export const connection = postgres(env.API_DB_URL)

export const db = drizzle(connection)

await migrate(db, { migrationsFolder: '../../packages/database/drizzle' })
