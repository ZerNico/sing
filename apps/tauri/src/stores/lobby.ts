import { InferModel, schema } from 'api/db'

export const useLobbyStore = defineStore('lobby', () => {
  const mode = ref<'online' | 'offline'>()
  const jwt = ref<string>()
  const lobby = ref<InferModel<typeof schema.lobby>>()

  return { mode, jwt, lobby }
})
