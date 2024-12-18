import type { ExtractTablesWithRelations } from "drizzle-orm";
import { type PostgresJsTransaction, drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "../config";
import * as schema from "./schema";

const sql = postgres(config.POSTGRES_URI, { max: 1 });

export const db = drizzle(sql, { schema });

await migrate(db, { migrationsFolder: "drizzle" });

export type Transaction = PostgresJsTransaction<typeof schema, ExtractTablesWithRelations<typeof schema>>;

