import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { PrismaClient } from 'database'

import { JwtService } from '../services/jwt'

const prisma = new PrismaClient()
const jwt = new JwtService()

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const server = req.server

  return {
    fastify: server,
    prisma,
    services: {
      jwt,
    },
    req,
    res,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
