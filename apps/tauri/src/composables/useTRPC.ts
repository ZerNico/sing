import type { AppRouter } from 'api/src/types'
import type { CreateTRPCProxyClient } from '@trpc/client'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import SuperJSON from 'superjson'

export const useTRPC = (): { client: CreateTRPCProxyClient<AppRouter> } => {
  const lobbyStore = useLobbyStore()

  const client: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
    transformer: SuperJSON,
    links: [
      httpBatchLink({
        url: import.meta.env.VITE_API_URL,
        async headers() {
          if (!lobbyStore.jwt) {
            return {}
          }

          return {
            Authorization: `Bearer ${lobbyStore.jwt}`,
          }
        },
      }),
    ],
  })

  return { client }
}

export type ClientRouterInput = inferRouterInputs<AppRouter>
export type ClientRouterOutput = inferRouterOutputs<AppRouter>
