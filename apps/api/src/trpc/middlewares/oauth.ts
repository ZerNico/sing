import { TRPCError } from '@trpc/server'
import { FetchError, ofetch } from 'ofetch'
import { z } from 'zod'
import { env } from '../../config/env'
import { middleware, publicProcedure } from '../trpc'

export interface UserInfoResponse {
  email: string
  email_verified: boolean
  family_name: string
  given_name: string
  locale: string
  name: string
  picture: string
  preferred_username: string
  sub: string
  updated_at: number
  'urn:zitadel:iam:org:domain:primary': string
}

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  picture: z.string().optional(),
  orgDomain: z.string(),
})

const isOAuthed = middleware(async ({ ctx, next }) => {
  const token = ctx.req.headers.authorization?.split(' ')[1]

  if (!token) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  try {
    // Check if token is valid and get user info
    const response = await ofetch<UserInfoResponse>(`${env.ZITADEL_URL}/oidc/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch((e) => {
      throw new TRPCError({ code: 'UNAUTHORIZED', cause: e })
    })

    // remove org domain from username
    const orgDomain = response['urn:zitadel:iam:org:domain:primary']
    const username = response.preferred_username.replace(`@${orgDomain}`, '')

    // validate user info
    const parsedUser = userSchema.parse({
      id: response.sub,
      username,
      picture: response.picture,
      orgDomain,
    })

    // create or update user
    const user = await ctx.prisma.user.upsert({
      where: { id: parsedUser.id },
      update: { ...parsedUser },
      create: { ...parsedUser },
    })

    return next({ ctx: { ...ctx, user } })
  } catch (e) {
    if (e instanceof FetchError) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Could not verify access token', cause: e })
    }
    if (e instanceof TRPCError) {
      throw e
    }

    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: e })
  }
})

export const oAuthedProcedure = publicProcedure.use(isOAuthed)
