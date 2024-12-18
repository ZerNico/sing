
import type { InferSelectModel } from "drizzle-orm";
import type { users } from "./db/schema";



export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };