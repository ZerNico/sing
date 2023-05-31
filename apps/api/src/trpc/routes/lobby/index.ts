import { Lobby, Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import semver from 'semver'
import { publicProcedure, router } from '../../trpc'
import { randomReadableString } from '../../../utils/random'
import { generateLobbyJwt } from '../../../lobby/jwt'
import { logtoAuthedProcedure } from '../../middlewares/logto'
import { lobbyAuthedProcedure } from '../../middlewares/lobby'

const MININUM_VERSION = '0.0.2'

export const lobbyRouter = router({
  /* Functions for game client */
  create: publicProcedure.input(z.object({ version: z.string() })).mutation(async ({ ctx, input }) => {
    if (!semver.satisfies(input.version, `>=${MININUM_VERSION}`)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'error.version_too_old',
      })
    }

    // generate a new lobby code until it is unique
    // after 10 tries, increase the length of the code
    let tries = 0
    let length = 5
    let lobby: Lobby | undefined

    do {
      const code = randomReadableString(length)
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
          throw e
        }
      }
    } while (!lobby)

    const token = await generateLobbyJwt(lobby.id, lobby.code)

    return {
      jwt: token,
      lobby,
    }
  }),

  status: lobbyAuthedProcedure.query(async ({ ctx }) => {
    const lobby = await ctx.prisma.lobby.findUnique({
      where: {
        id: ctx.lobby.sub,
      },
      include: {
        users: true,
      },
    })

    if (!lobby) throw new TRPCError({ code: 'NOT_FOUND', message: 'error.lobby_not_found' })

    return { lobby }
  }),

  kick: lobbyAuthedProcedure.input(z.object({ userId: z.string() })).mutation(async ({ ctx, input }) => {
    await ctx.prisma.lobby.update({
      where: { id: ctx.lobby.sub },
      data: {
        users: {
          disconnect: {
            id: input.userId,
          },
        },
      },
    })
  }),

  delete: lobbyAuthedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.lobby.delete({
      where: { id: ctx.lobby.sub },
    })
  }),

  /* Functions for web app */
  // join a lobby with a code
  join: logtoAuthedProcedure
    .input(z.object({ code: z.string().transform((val) => val.toUpperCase()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.lobby.update({
          where: {
            code: input.code,
          },
          data: {
            users: {
              connect: {
                id: ctx.user.id,
              },
            },
          },
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'error.lobby_not_found',
          })
        }
        throw e
      }
    }),
  // leave the current lobby
  leave: logtoAuthedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.user.id },
      data: {
        lobby: {
          disconnect: true,
        },
      },
    })
  }),
  // get current lobby the user is in
  current: logtoAuthedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      include: {
        lobby: {
          include: {
            users: true,
          },
        },
      },
    })

    return { lobby: user?.lobby || null }
  }),
})
