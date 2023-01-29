import { initTRPC } from '@trpc/server'
import SuperJSON from 'superjson'
import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware
