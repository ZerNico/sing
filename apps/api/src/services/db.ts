import * as schema from "database";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { config } from "../config";

const sql = postgres(config.API_POSTGRES_URI, { max: 1 });

export const db = drizzle(sql, { schema });

await migrate(db, { migrationsFolder: "node_modules/database/drizzle" });
