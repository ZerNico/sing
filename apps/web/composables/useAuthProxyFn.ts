import { TRPCClientError } from '@trpc/client'

type InferArgs<T> = T extends (...t: [...infer Arg]) => any ? Arg : never
type InferReturn<T> = T extends (...t: [...infer Arg]) => infer Res ? Res : never

export default function useAuthProxyFn<TFunc extends (...args: any[]) => any>(fn: TFunc): (...args: InferArgs<TFunc>) => InferReturn<TFunc> {
  const { logIn } = useAuth()
  return (...args: InferArgs<TFunc>) => {
    const val = fn(...args)
    if (val instanceof Promise) {
      return val.catch(async (e) => {
        if (e instanceof TRPCClientError && e.data.code === 'UNAUTHORIZED') {
          await logIn()
        }
        throw e
      })
    }
    return val
  }
}
