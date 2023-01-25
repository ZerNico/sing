import type { AppRouter } from 'api/src/types'
import type { CreateTRPCProxyClient } from '@trpc/client'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import SuperJSON from 'superjson'

const client: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: import.meta.env.RENDERER_VITE_API_URL,
    }),
  ],
})

export const useTRPC = (): { client: CreateTRPCProxyClient<AppRouter> } => {
  return { client }
}

export type ClientRouterInput = inferRouterInputs<AppRouter>
export type ClientRouterOutput = inferRouterOutputs<AppRouter>
