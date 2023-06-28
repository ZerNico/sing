import { TRPCError } from '@trpc/server'
import { satisfies } from 'semver'
import { publicProcedure, router } from 'trpc/trpc'
import { z } from 'zod'

import { MININUM_VERSION } from '~/constants'

export const lobbyRouter = router({
  create: publicProcedure.input(z.object({ version: z.string() })).mutation(async ({ input }) => {
    if (!satisfies(input.version, `>=${MININUM_VERSION}`)) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'error.outdated_version' })
    }

    return { success: true }
  }),
})
