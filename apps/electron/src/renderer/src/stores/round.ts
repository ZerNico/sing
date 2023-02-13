import type { LocalSong } from '@renderer/logic/song/song'
import type { User } from '@renderer/logic/types'

interface RoundState {
  song?: LocalSong
  player1?: User
  player2?: User
}

export const useRoundStore = defineStore('round', {
  state: (): RoundState => ({}),
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRoundStore, import.meta.hot))
}
