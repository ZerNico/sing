import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const server = req.server

  return {
    fastify: server,
    prisma,
    req,
    res,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
