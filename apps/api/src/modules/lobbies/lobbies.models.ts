import * as v from "valibot";

const baseTokenSchema = v.object({
  sub: v.string(),
  iat: v.number(),
  exp: v.number(),
  iss: v.literal("api"),
  aud: v.literal("api"),
});

export const lobbyTokenSchema = v.object({
  ...baseTokenSchema.entries,
  type: v.literal("lobby"),
}); 