import type { AppRouter } from 'api/src/types'
import type { CreateTRPCProxyClient } from '@trpc/client'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { ipcLink } from 'electron-trpc/renderer'

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import SuperJSON from 'superjson'
import type { IPCRouter } from 'src/main/types'

export const useTRPC = (): { client: CreateTRPCProxyClient<AppRouter>; ipc: CreateTRPCProxyClient<IPCRouter> } => {
  const lobbyStore = useLobbyStore()

  const client: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
    transformer: SuperJSON,
    links: [
      httpBatchLink({
        url: import.meta.env.RENDERER_VITE_API_URL,
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

  const ipc = createTRPCProxyClient<IPCRouter>({
    links: [ipcLink()],
  })

  return { client, ipc }
}

export type ClientRouterInput = inferRouterInputs<AppRouter>
export type ClientRouterOutput = inferRouterOutputs<AppRouter>
export type IPCRouterInput = inferRouterInputs<IPCRouter>
export type IPCRouterOutput = inferRouterOutputs<IPCRouter>
