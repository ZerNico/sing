import type { AppRouter } from 'api/src/types'
import { CreateTRPCProxyClient, createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import SuperJSON from 'superjson'
import { joinURL } from 'ufo'

export const useTRPC = (): { client: CreateTRPCProxyClient<AppRouter> } => {
  const { accessToken } = useLogto()

  const client = createTRPCProxyClient<AppRouter>({
    transformer: SuperJSON,
    links: [
      httpBatchLink({
        url: joinURL(useRuntimeConfig().public.apiUrl, 'trpc'),
        async headers() {
          return {
            authorization: `Bearer ${accessToken.value}`,
          }
        },
      }),
    ],
  })

  return { client }
}

export type ClientRouterInput = inferRouterInputs<AppRouter>
export type ClientRouterOutput = inferRouterOutputs<AppRouter>
