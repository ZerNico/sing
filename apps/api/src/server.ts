export type { AppRouter } from '~/trpc/routes'

import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import { fastify } from 'fastify'
import { renderTrpcPanel } from 'trpc-panel'

import { env } from '~/config/env'
import { appRouter } from '~/trpc/routes'

import { createContext } from './trpc/context'

export const server = fastify({
  maxParamLength: 5000,
  bodyLimit: 10 * 1024 * 1024, // 10MB
})

server.register(cors, {
  origin: '*',
  credentials: true,
})
server.register(helmet, {
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      'script-src': env.NODE_ENV === 'development' ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"] : ["'self'"],
    },
  },
})
server.register(sensible)

server.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
})

if (env.NODE_ENV === 'development') {
  server.get('/panel', async (req, reply) => {
    reply
      .code(200)
      .header('Content-Type', 'text/html; charset=utf-8')
      .send(renderTrpcPanel(appRouter, { url: 'http://localhost:4000/trpc', transformer: 'superjson' }))
  })
}
