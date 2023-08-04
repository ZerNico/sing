import { InferModel, schema } from 'api/db'

export const useLobbyStore = defineStore('lobby', () => {
  const mode = ref<'online' | 'offline'>()
  const token = ref<string>()
  const lobby = ref<InferModel<typeof schema.lobby>>()

  return { mode, token, lobby }
})
