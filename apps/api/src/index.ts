import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { env } from './config/env.js'
import { HonoError } from './error/index.js'
import { authApp } from './routes/auth.js'
import { lobbyApp } from './routes/lobby.js'

const app = new Hono()
  .get('/', (c) => c.text('Hello Hono!'))
  .route('/auth', authApp)
  .route('/lobby', lobbyApp)
  .onError((error, c) => {
    if (error instanceof HonoError) {
      return c.json(
        { error: error.message, validationErrors: error.validationErrors, cause: error.cause?.stack },
        error.status || 500
      )
    }

    return c.json({ error: 'UNKNOWN_ERROR', cause: error.message }, 500)
  })

serve({ fetch: app.fetch, port: env.API_PORT }, (info) => {
  console.log(`Server is running on port ${info.port}`)
})

export type AppType = typeof app
