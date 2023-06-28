import z from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().int().default(4000),
  NODE_ENV: z.string().default('production'),
  JWT_SECRET: z.string().default('secret'),
  API_ORIGIN: z.string(),
  DATABASE_URL: z.string(),
})

export const env = envSchema.parse(process.env)
