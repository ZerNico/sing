export default function useOfflineFallbackFn<T>(fn: () => T, fallbackFn: () => T) {
  const lobbyStore = useLobbyStore()

  return () => {
    if (!lobbyStore.offline) {
      return fn()
    }

    return fallbackFn()
  }
}
