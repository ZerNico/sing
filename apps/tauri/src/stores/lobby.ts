import type { ClientRouterOutput } from '~/composables/useTRPC'

interface LobbyState {
  jwt?: string
  offline: boolean
  lobby?: ClientRouterOutput['lobby']['create']['lobby']
}

export const useLobbyStore = defineStore('lobby', {
  state: (): LobbyState => ({
    jwt: undefined,
    offline: false,
    lobby: undefined,
  }),
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useLobbyStore, import.meta.hot))
}
