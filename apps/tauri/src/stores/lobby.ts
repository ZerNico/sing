import { Lobby } from 'api'

export const useLobbyStore = defineStore('lobby', () => {
  const mode = ref<'online' | 'offline'>()
  const jwt = ref<string>()
  const lobby = ref<Lobby>()

  return { mode, jwt, lobby }
})
