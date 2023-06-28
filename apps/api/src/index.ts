export type { AppRouter } from './trpc/routes'
export type { Lobby, User } from 'database'

import { env } from './config/env'
import { server } from './server'

server.listen({ host: '::', port: env.PORT }, (error) => {
  if (error) {
    throw error
  }
  console.log(`Server listening on ${env.PORT}`)
})
