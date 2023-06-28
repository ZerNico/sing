import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from '@trpc/client'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from 'api'
import SuperJSON from 'superjson'
import { joinURL } from 'ufo'

export const useTRPC = () => {
  const client = createTRPCProxyClient<AppRouter>({
    transformer: SuperJSON,
    links: [
      httpBatchLink({
        url: joinURL(import.meta.env.VITE_API_URL, 'trpc'),
      }),
    ],
  })

  return { client }
}

export function isTRPCClientError(error: unknown): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError
}

export type ClientRouterInput = inferRouterInputs<AppRouter>
export type ClientRouterOutput = inferRouterOutputs<AppRouter>
