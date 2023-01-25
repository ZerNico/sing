import type { Lobby } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { signJwt } from '../../../jwt/jwt'
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
