import type { InferSelectModel } from "drizzle-orm";
import * as v from "valibot";
import type { users } from "../../db/schema";

export type User = InferSelectModel<typeof users>;

export const patchMeSchema = v.object({
  username: v.optional(v.pipe(v.string(), v.minLength(3), v.maxLength(20))),
  password: v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(128))),
});
