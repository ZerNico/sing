import type { User } from 'api/src/types'
import type { Matchup } from '~/logic/utils/matchup.utils'

export interface Score {
  player: User
  score: number
  rounds: number
  wins: number
}

interface VersusState {
  playing: boolean
  settings: {
    jokers: number
  }
  players: User[]
  matchups: Matchup[]
  scores: Score[]
}

export const useVersusStore = defineStore('versus', {
  state: (): VersusState => ({
    playing: false,
    settings: {
      jokers: 5,
    },
    players: [],
    matchups: [],
    scores: [],
  }),
  getters: {
    getScores: (state) => {
      const sortedScores = state.scores.sort((a, b) => {
        if (a.wins === b.wins) {
          return b.score - a.score
        }
        return b.wins - a.wins
      })

      let position = 0
      let previousScore = -1
      let previousWins = -1

      const scores = sortedScores.map((score) => {
        if (!(score.score === previousScore && score.wins === previousWins)) {
          position++
        }

        previousScore = score.score
        previousWins = score.wins
        return { ...score, position }
      })
      return scores
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVersusStore, import.meta.hot))
}
