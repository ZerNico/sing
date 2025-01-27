import type { InferSelectModel } from "drizzle-orm";
import * as v from "valibot";
import type { users } from "../../db/schema";

export type User = InferSelectModel<typeof users>;

export const patchMeSchema = v.object({
  username: v.optional(v.pipe(v.string(), v.minLength(3), v.maxLength(20))),
  password: v.optional(v.pipe(v.string(), v.minLength(6), v.maxLength(128))),
  picture: v.optional(
    v.pipe(
      v.file(),
      v.mimeType(["image/png", "image/jpeg", "image/jpg", "image/webp"]),
      v.maxSize(1024 * 1024 * 5), // 5MB
    ),
  ),
});
