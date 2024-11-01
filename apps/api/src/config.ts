import * as v from "valibot";

const ConfigSchema = v.object({
  API_POSTGRES_URI: v.string(),
  API_JWT_SECRET: v.string(),
});

export const config = v.parse(ConfigSchema, process.env);
