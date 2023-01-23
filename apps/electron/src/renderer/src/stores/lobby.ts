interface LobbyState {
  jwt?: string
  offline: boolean
}

export const useLobbyStore = defineStore('lobby', {
  state: (): LobbyState => ({
    jwt: undefined,
    offline: false,
  }),
})
