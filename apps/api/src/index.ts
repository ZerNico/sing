import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { env } from './config/env.js'
import { errorHandler } from './error/index.js'
import { authApp } from './routes/auth.js'
import { lobbyApp } from './routes/lobby.js'

export { HonoClientError } from './error/index.js'

const app = new Hono()
  .basePath('/api/v1')
  .use('*', cors({ origin: '*' }))
  .get('/', (c) => c.text('Hello Hono!'))
  .route('/auth', authApp)
  .route('/lobby', lobbyApp)
  .onError(errorHandler)

serve({ fetch: app.fetch, port: env.API_PORT }, (info) => {
  console.log(`Server is running on port ${info.port}`)
})

export type AppType = typeof app
