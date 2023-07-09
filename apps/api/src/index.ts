import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { env } from './config/env.ts'
import { HonoError } from './error/index.ts'
import { authApp } from './routes/auth.ts'

const app = new Hono()
  .get('/', (c) => c.text('Hello Hono!'))
  .route('/auth', authApp)
  .onError((error, c) => {
    if (error instanceof HonoError) {
      return c.json(
        { error: error.message, validationErrors: error.validationErrors, cause: error.cause?.stack },
        error.status || 500
      )
    }

    return c.json({ error: 'UNKNOWN_ERROR', cause: error.message }, 500)
  })

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Server is running on port ${info.port}`)
})

export type AppType = typeof app
