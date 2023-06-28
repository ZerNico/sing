import { TRPCError } from '@trpc/server'
import { Lobby, Prisma } from 'database'
import { satisfies } from 'semver'
import { z } from 'zod'

import { MININUM_VERSION } from '../../constants'
import { LobbyJwtPayload } from '../../services/jwt/types'
import { randomReadableString } from '../../utils/random'
import { publicProcedure, router } from '../trpc'

export const lobbyRouter = router({
  create: publicProcedure.input(z.object({ version: z.string() })).mutation(async ({ ctx, input }) => {
    if (!satisfies(input.version, `>=${MININUM_VERSION}`)) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'error.outdated_version' })
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
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          tries++
          if (tries > 10) {
            length++
            tries = 0
          }
        } else {
          throw error
        }
      }
    } while (!lobby)

    const jwt = await ctx.services.jwt.signJwt<LobbyJwtPayload>({ sub: lobby.id, code: lobby.code })

    return { jwt, lobby }
  }),
})
