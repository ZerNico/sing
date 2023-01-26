import ZitadelProvider from 'next-auth/providers/zitadel'
import { NuxtAuthHandler } from '#auth'
export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    ZitadelProvider.default({
      issuer: useRuntimeConfig().zitadelIssuer,
      clientId: useRuntimeConfig().zitadelClientId,
      clientSecret: useRuntimeConfig().zitadelClientSecret,
      authorization: {
        params: {
          scope: `openid email profile urn:zitadel:iam:org:domain:primary:${useRuntimeConfig().zitadelOrgDomain}`,
        },
      },
    }),
  ],
})
