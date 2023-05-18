import z from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().int().default(4000),
  NODE_ENV: z.string().default('development'),
  LOGTO_URL: z.string().url(),
  LOGTO_AUDIENCE: z.string(),
  LOGTO_M2M_APP_ID: z.string(),
  LOGTO_M2M_APP_SECRET: z.string(),
  LOGTO_M2M_RESOURCE: z.string(),
  API_ORIGIN: z.string().url(),
  JWT_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)
