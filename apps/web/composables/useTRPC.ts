import type { AppRouter } from 'api/src/types'
import type { CreateTRPCProxyClient } from '@trpc/client'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import SuperJSON from 'superjson'

export const useTRPC = (): { client: CreateTRPCProxyClient<AppRouter> } => {
  const auth = useAuth()

  const client: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
    transformer: SuperJSON,
    links: [
      httpBatchLink({
        url: useRuntimeConfig().public.apiUrl,
        async headers() {
          if (!auth.accessToken.value) {
            return {}
          }

          return {
            Authorization: `Bearer ${auth.accessToken.value}`,
          }
        },
      }),
    ],
  })

  return { client }
}

export type ClientRouterInput = inferRouterInputs<AppRouter>
export type ClientRouterOutput = inferRouterOutputs<AppRouter>
