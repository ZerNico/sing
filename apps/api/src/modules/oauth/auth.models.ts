import * as v from "valibot";

export const googleProfileSchema = v.object({
  email: v.string(),
  sub: v.string(),
  picture: v.string(),
  email_verified: v.boolean(),
});

export type GoogleProfile = v.InferOutput<typeof googleProfileSchema>;