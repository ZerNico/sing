// check env with zod

import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  API_PORT: z.coerce.number().default(4000),
  API_DB_URL: z.string(),
  API_JWT_SECRET: z.string(),
  API_ORIGIN: z.string(),
})

export type Env = z.infer<typeof envSchema>
export const env = envSchema.parse(process.env)
