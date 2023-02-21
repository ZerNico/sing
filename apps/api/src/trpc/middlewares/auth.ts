import { TRPCError } from '@trpc/server'

import { verifyJwt } from '../../jwt/jwt'
import { middleware, publicProcedure } from '../trpc'

const isOAuthed = middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.split(' ')[1]

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  const payload = verifyJwt(token)
  return next({ ctx: { ...ctx, user: payload } })
})

export const authedProcedure = publicProcedure.use(isOAuthed)
