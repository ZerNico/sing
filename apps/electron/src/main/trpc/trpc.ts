import { initTRPC } from '@trpc/server'

const t = initTRPC.context().create({ isServer: true })

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware
