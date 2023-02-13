import type { AppRouter } from 'api/src/types'
import type { CreateTRPCProxyClient, TRPCLink } from '@trpc/client'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { observable } from '@trpc/server/observable'
import SuperJSON from 'superjson'

export const useTRPC = (): { client: CreateTRPCProxyClient<AppRouter> } => {
  const auth = useAuth()

  const customLink: TRPCLink<AppRouter> = () => {
    return ({ next, op }) => {
      return observable((observer) => {
        const unsubscribe = next(op).subscribe({
          next(value) {
            observer.next(value)
          },
          error(err) {
            observer.error(err)
          },
          complete() {
            observer.complete()
          },
        })
        return unsubscribe
      })
    }
  }

  const client: CreateTRPCProxyClient<AppRouter> = createTRPCProxyClient<AppRouter>({
    transformer: SuperJSON,
    links: [
      customLink,
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
