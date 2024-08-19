import * as v from "valibot";

const EnvSchema = v.object({
  API_POSTGRES_URI: v.string(),
});

export const env = v.parse(EnvSchema, process.env);
