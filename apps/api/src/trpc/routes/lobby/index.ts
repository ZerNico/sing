import type { Lobby } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { signJwt } from '../../../jwt/jwt'
import { authedProcedure } from '../../middlewares/auth'
import { oAuthedProcedure } from '../../middlewares/oauth'
import { publicProcedure, router } from '../../trpc'

export const lobbyRouter = router({
  create: publicProcedure.mutation(async ({ ctx }) => {
    // generate a new lobby code until it is unique
    // after 10 tries, increase the length of the code
    let tries = 0
    let length = 5
    let lobby: Lobby | undefined

    do {
      const code = generateLobbyCode(length)
      try {
        lobby = await ctx.prisma.lobby.create({
          data: {
            code,
          },
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          tries++
          if (tries > 10) {
            length++
            tries = 0
          }
        } else {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create lobby',
            cause: e,
          })
        }
      }
    } while (!lobby)

    const token = signJwt({ sub: lobby.id, code: lobby.code })

    return {
      jwt: token,
      lobby,
    }
  }),
  join: oAuthedProcedure
    .input(z.object({ code: z.string().transform((val) => val.toUpperCase()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.lobby.update({
          where: { code: input.code },
          data: {
            users: {
              connect: {
                id: ctx.user.id,
              },
            },
          },
        })
        return
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Lobby not found',
            cause: e,
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to join lobby',
          cause: e,
        })
      }
    }),
  leave: oAuthedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        lobby: {
          disconnect: true,
        },
      },
    })
  }),
  joined: oAuthedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        lobby: true,
      },
    })

    return { lobby: user?.lobby }
  }),
  status: authedProcedure.query(async ({ ctx }) => {
    const lobby = await ctx.prisma.lobby.findUnique({
      where: { id: ctx.user.sub },
      include: {
        users: true,
      },
    })

    if (!lobby) throw new TRPCError({ code: 'NOT_FOUND', message: 'Lobby not found' })

    return { lobby }
  }),
  users: oAuthedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        lobby: {
          include: {
            users: true,
          },
        },
      },
    })

    if (!user?.lobby) throw new TRPCError({ code: 'NOT_FOUND', message: 'Lobby not found' })

    return { users: user.lobby.users }
  }),
  kick: authedProcedure.input(z.object({ userId: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.lobby.update({
      where: { id: ctx.user.sub },
      data: {
        users: {
          disconnect: {
            id: input.userId,
          },
        },
      },
    })
  }),
  delete: authedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.lobby.delete({
      where: { id: ctx.user.sub },
    })
  }),
})

const generateLobbyCode = (length: number) => {
  // generate random string with all characters and numbers except 0, O, I, l, 1
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
