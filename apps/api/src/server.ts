import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'
import sensible from '@fastify/sensible'
import { createContext } from './trpc/context'
import { env } from './config/env'
import { appRouter } from './trpc/routes'
import { startCron } from './cron'

startCron()

const server = fastify({
  maxParamLength: 5000,
})

server.register(cors, {
  origin: '*',
  credentials: true,
})
server.register(helmet)
server.register(sensible)

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
})

server.listen({ host: '0.0.0.0', port: env.PORT }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening on ${env.PORT}`)
})
