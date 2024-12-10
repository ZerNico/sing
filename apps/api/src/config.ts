import * as v from "valibot";

const ConfigSchema = v.object({
  POSTGRES_URI: v.string(),
  JWT_SECRET: v.string(),
  BASE_DOMAIN: v.string(),
});

export const config = v.parse(ConfigSchema, process.env);
