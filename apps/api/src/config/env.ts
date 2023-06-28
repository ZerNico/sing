import z from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().int().default(4000),
  NODE_ENV: z.string().default('production'),
})

export const env = envSchema.parse(process.env)
