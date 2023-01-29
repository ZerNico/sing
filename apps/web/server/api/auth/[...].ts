import ZitadelProvider from 'next-auth/providers/zitadel'
import { NuxtAuthHandler } from '#auth'
import type { User } from '~~/types'

interface Account {
  provider: string
  type: string
  access_token: string
  token_type: string
  id_token: string
}

interface Token {
  accessToken?: string
  user?: User
}

interface Session {
  accessToken?: string
  user?: User
}

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    ZitadelProvider.default({
      issuer: useRuntimeConfig().public.zitadelIssuer,
      clientId: useRuntimeConfig().zitadelClientId,
      clientSecret: useRuntimeConfig().zitadelClientSecret,
      authorization: {
        params: {
          scope: `openid email profile urn:zitadel:iam:user:metadata urn:zitadel:iam:org:domain:primary:${useRuntimeConfig().zitadelOrgDomain}`,
        },
      },
      async profile(profile: any): Promise<User> {
        // remove org domain from username
        const orgDomain = profile['urn:zitadel:iam:org:domain:primary']
        const username = profile.preferred_username.replace(`@${orgDomain}`, '')

        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          username,
          image: profile.picture,
          orgDomain: profile['urn:zitadel:iam:org:domain:primary'],
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, account, user }: { token: Token; account?: Account; user?: User }) {
      // Persist the OAuth access_token and user in token
      if (account && user) {
        token.accessToken = account.access_token
        token.user = user
      }

      return token
    },
    async session({ session, token }: { session: Session; token: Token }) {
      // Send access_token and user to client
      session.accessToken = token.accessToken
      session.user = token.user

      return session
    },
  },
})
