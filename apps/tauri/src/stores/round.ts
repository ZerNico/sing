import type { Note } from '~/logic/song/note'
import type { LocalSong } from '~/logic/song/song'
import type { User } from '~/logic/types'

export interface Score {
  goldenScore: number
  score: number
  bonusScore: number
}

interface RoundState {
  type: 'sing' | 'versus'
  song?: LocalSong
  player1?: User
  player2?: User
  score1: Score
  score2: Score
}

export const useRoundStore = defineStore('round', {
  state: (): RoundState => ({
    type: 'sing',
    score1: {
      goldenScore: 0,
      score: 0,
      bonusScore: 0,
    },
    score2: {
      goldenScore: 0,
      score: 0,
      bonusScore: 0,
    },
  }),
  actions: {
    addScore(player: 1 | 2, note: Note) {
      const score = this[`score${player}`]
      score.score += note.getPoints()
      if (note.type === 'Golden') {
        score.goldenScore += note.getPoints()
      }
    },
    addBonus(player: 1 | 2, bonus: number) {
      this[`score${player}`].bonusScore += bonus
    },
    resetScore() {
      this.score1 = {
        goldenScore: 0,
        score: 0,
        bonusScore: 0,
      }
      this.score2 = {
        goldenScore: 0,
        score: 0,
        bonusScore: 0,
      }
    },
  },
  getters: {
    totalScore1: (state) => {
      return (maxScore: number) => Math.round((state.score1.score + state.score1.bonusScore) / maxScore * 10000)
    },
    totalScore2: (state) => {
      return (maxScore: number) => Math.round((state.score2.score + state.score2.bonusScore) / maxScore * 10000)
    },
  },
})

if (import.meta.hot) {
  // @ts-ignore Typings are wrong because of persisted-state
  import.meta.hot.accept(acceptHMRUpdate(useRoundStore, import.meta.hot))
}
