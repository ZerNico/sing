import { TRPCError } from '@trpc/server'
import { middleware, publicProcedure } from '../trpc'
import { verifyLogtoJwt } from '../../logto/jwt'

const isLogtoAuthed = middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.split(' ')[1]

  if (!token) throw new TRPCError({ code: 'UNAUTHORIZED' })

  const payload = await verifyLogtoJwt(token).catch(() => {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  })
  if (!payload.sub) throw new TRPCError({ code: 'UNAUTHORIZED' })

  const user = await ctx.prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
  })
  if (user) return next({ ctx: { ...ctx, user } })

  const logtoUser = await ctx.mm.getUser(payload.sub)
  const newUser = await ctx.prisma.user.create({
    data: {
      id: payload.sub,
      username: logtoUser.username,
      picture: logtoUser.avatar,
    },
  })
  return next({ ctx: { ...ctx, user: newUser } })
})

export const logtoAuthedProcedure = publicProcedure.use(isLogtoAuthed)
