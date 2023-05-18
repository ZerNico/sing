import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'
import sensible from '@fastify/sensible'
import { createContext } from './trpc/context'
import { env } from './config/env'
import { appRouter } from './trpc/routes'
import { startCron } from './cron'
import { registerAvatarRoutes } from './fastify/avatar'

startCron()

const server = fastify({
  maxParamLength: 5000,
  bodyLimit: 10 * 1024 * 1024, // 10MB
})

server.register(cors, {
  origin: '*',
  credentials: true,
})
server.register(helmet, { crossOriginResourcePolicy: false })
server.register(sensible)

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
})

registerAvatarRoutes(server)

server.listen({ host: '::', port: env.PORT }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening on ${env.PORT}`)
})
