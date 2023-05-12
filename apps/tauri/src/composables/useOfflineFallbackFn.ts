type InferArgs<T> = T extends (...t: [...infer Arg]) => any ? Arg : never
type InferReturn<T> = T extends () => infer Res ? Res : never

export default function useOfflineFallbackFn<TFunc extends (...args: any[]) => any>(
  fn: TFunc,
  fallbackFn: TFunc
): (...args: InferArgs<TFunc>) => InferReturn<TFunc> {
  const lobbyStore = useLobbyStore()

  return (...args: InferArgs<TFunc>) => {
    if (!lobbyStore.offline) {
      return fn(...args)
    }

    return fallbackFn(...args)
  }
}
