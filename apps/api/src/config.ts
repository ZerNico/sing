import * as v from "valibot";

const ConfigSchema = v.object({
  POSTGRES_URI: v.string(),
  JWT_SECRET: v.string(),
  BASE_DOMAIN: v.string(),
  GOOGLE_CLIENT_ID: v.string(),
  GOOGLE_CLIENT_SECRET: v.string(),
  GOOGLE_REDIRECT_URI: v.string(),
  EMAIL_SMTP_URI: v.string(),
  EMAIL_FROM_MAIL: v.string(),
  SUPPORT_EMAIL: v.string(),
  DISCORD_CLIENT_ID: v.string(),
  DISCORD_CLIENT_SECRET: v.string(),
  DISCORD_REDIRECT_URI: v.string(),
});

export const config = v.parse(ConfigSchema, process.env);
