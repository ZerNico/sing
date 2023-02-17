export default function useOfflineFallbackFn<T>(fn: () => T, fallback: (Awaited<T> | T)) {
  const lobbyStore = useLobbyStore()

  return () => {
    if (!lobbyStore.offline) {
      return fn()
    }

    if (typeof fallback === 'function') {
      return (fallback as () => T)()
    }

    return fallback
  }
}
