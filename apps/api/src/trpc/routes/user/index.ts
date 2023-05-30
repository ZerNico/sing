import { randomUUID } from 'crypto'
import { z } from 'zod'
import { joinURL, withQuery } from 'ufo'
import { TRPCError } from '@trpc/server'
import { logtoAuthedProcedure } from '../../middlewares/logto'
import { router } from '../../trpc'
import { atob } from '../../../utils/byte'
import { env } from '../../../config/env'
import { LogtoError } from '../../../logto/error'
import { hasAnyKey } from '../../../utils/object'

export const userRouter = router({
  update: logtoAuthedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(1, { message: 'error.username_too_short' })
          .max(64, { message: 'error.username_too_long' })
          .optional(),
        avatar: z
          .object({
            file: z.string().max(5000000, { message: 'error.avatar_too_large' }),
            mime: z.string(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let avatarUrl: string | undefined
      if (input.avatar) {
        const avatarBytes = atob(input.avatar.file)

        await ctx.prisma.avatar.upsert({
          where: {
            userId: ctx.user.id,
          },
          create: {
            userId: ctx.user.id,
            file: avatarBytes,
            mime: input.avatar.mime,
          },
          update: {
            file: avatarBytes,
            mime: input.avatar.mime,
          },
        })

        // add a random query string to the avatar url to prevent caching
        avatarUrl = withQuery(joinURL(env.API_ORIGIN, 'api/avatar', ctx.user.id), { id: randomUUID() })
      }

      const body = { username: input.username, avatar: avatarUrl }

      // check if body has at least one key
      if (!hasAnyKey(body)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'error.invalid_input' })
      }

      const response = await ctx.mm.patchUser(ctx.user.id, body).catch((err) => {
        if (err instanceof LogtoError) {
          if (err.code === 'user.username_already_taken') {
            throw new TRPCError({ code: 'CONFLICT', message: err.code })
          }
        }

        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'error.unknown_error', cause: err })
      })

      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          picture: response.avatar,
          username: response.username,
        },
      })

      return {
        user,
      }
    }),

  updatePassword: logtoAuthedProcedure
    .input(
      z
        .object({
          currentPassword: z.string(),
          newPassword: z
            .string()
            .min(9, { message: 'error.password_too_short' })
            .max(8196, { message: 'error.password_too_long' }),
          newPasswordConfirm: z.string(),
        })
        .refine((data) => data.newPassword === data.newPasswordConfirm, {
          message: 'error.passwords_do_not_match',
          path: ['confirmPassword'],
        })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.mm.verifyPassword(ctx.user.id, input.currentPassword)
        await ctx.mm.updatePassword(ctx.user.id, input.newPassword)
      } catch (err) {
        if (err instanceof LogtoError && err.code === 'session.invalid_credentials') {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'error.password_incorrect' })
        }
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'error.unknown_error', cause: err })
      }

      return {
        success: true,
      }
    }),
})
