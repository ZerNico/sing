import type { Note } from '@renderer/logic/song/note'
import type { LocalSong } from '@renderer/logic/song/song'
import type { User } from '@renderer/logic/types'

export interface Score {
  goldenScore: number
  score: number
  bonusScore: number
}

interface RoundState {
  song?: LocalSong
  player1?: User
  player2?: User
  score1: Score
  score2: Score
}

export const useRoundStore = defineStore('round', {
  state: (): RoundState => ({
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
  import.meta.hot.accept(acceptHMRUpdate(useRoundStore, import.meta.hot))
}
