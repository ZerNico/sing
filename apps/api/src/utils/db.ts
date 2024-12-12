import { type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}