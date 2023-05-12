import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { authedProcedure } from '../../middlewares/auth'
import { router } from '../../trpc'

export const highscoreRouter = router({
  create: authedProcedure
    .input(
      z.object({
        userId: z.string(),
        hash: z.string(),
        score: z.number().int().min(0).max(10000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lobby = await ctx.prisma.lobby.findUnique({
        where: { id: ctx.user.sub },
        include: {
          users: true,
        },
      })

      if (!lobby) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Lobby not found' })

      // check if user is in lobby
      if (!lobby.users.find((user) => user.id === input.userId)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not in lobby' })
      }

      const currHighscore = await ctx.prisma.highscore.findUnique({
        where: { hash_userId: { hash: input.hash, userId: input.userId } },
      })

      if (currHighscore) {
        if (currHighscore.score > input.score) {
          return { highscore: currHighscore }
        }
        const highscore = await ctx.prisma.highscore.update({
          where: { hash_userId: { hash: input.hash, userId: input.userId } },
          data: { score: input.score },
        })
        return { highscore }
      }

      // create highscore
      const highscore = await ctx.prisma.highscore.create({
        data: { userId: input.userId, hash: input.hash, score: input.score },
      })

      return { highscore }
    }),
  get: authedProcedure.input(z.object({ hash: z.string() })).query(async ({ ctx, input }) => {
    const lobby = await ctx.prisma.lobby.findUnique({
      where: { id: ctx.user.sub },
      include: {
        users: true,
      },
    })

    if (!lobby) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Lobby not found' })

    // find highscores where hash matches and user is one of the users in lobby
    const highscores = await ctx.prisma.highscore.findMany({
      where: {
        hash: input.hash,
        userId: {
          in: lobby.users.map((user) => user.id),
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        score: 'desc',
      },
    })

    return { highscores }
  }),
})
