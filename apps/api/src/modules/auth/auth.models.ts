import * as v from "valibot";

const baseTokenSchema = v.object({
  sub: v.pipe(v.string(), v.transform(Number), v.number()),
  iat: v.number(),
  exp: v.number(),
  iss: v.literal("api"),
  aud: v.literal("api"),
  emailVerified: v.boolean(),
});

export const accessTokenSchema = v.object({
  ...baseTokenSchema.entries,
  type: v.literal("access"),
});

export const refreshTokenSchema = v.object({
  ...baseTokenSchema.entries,
  type: v.literal("refresh"),
});


export const loginSchema = v.object({
  login: v.pipe(v.string(), v.maxLength(128)),
  password: v.pipe(v.string(), v.maxLength(128)),
});

export const registerSchema = v.object({
  password: v.pipe(v.string(), v.minLength(6), v.maxLength(128)),
  email: v.pipe(v.string(), v.email(), v.maxLength(128)),
});
