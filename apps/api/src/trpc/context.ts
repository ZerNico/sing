import type { inferAsyncReturnType } from '@trpc/server'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { prisma } from '../prisma'
import { ManagementApiClient } from '../logto/management-api'

const mm = new ManagementApiClient()

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const server = req.server

  return {
    fastify: server,
    prisma,
    mm,
    req,
    res,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
