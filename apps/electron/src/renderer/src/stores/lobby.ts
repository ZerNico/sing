import type { ClientRouterOutput } from '@renderer/composables/useTRPC'

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
