import { TRPCError } from '@trpc/server'
import { middleware, publicProcedure } from '../trpc'
import { verifyLobbyJwt } from '../../lobby/jwt'

const isLobbyAuthed = middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.split(' ')[1]

  if (!token) throw new TRPCError({ code: 'UNAUTHORIZED' })

  const payload = await verifyLobbyJwt(token).catch(() => {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  })
  if (!payload.sub) throw new TRPCError({ code: 'UNAUTHORIZED' })

  return next({ ctx: { ...ctx, lobby: payload } })
})

export const lobbyAuthedProcedure = publicProcedure.use(isLobbyAuthed)
