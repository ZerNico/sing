import type { User } from '../types'

export interface Matchup {
  player1: User
  player2: User
}

// rotate the values in players so the last player is first and everyone else is shifted one down
const shuffle = (players: User[]) => {
  const shuffled = players.slice(-1)
  shuffled.push(...players.slice(0, -1))
  return shuffled
}

// pair up the values in players, round robin style
const pairUpPlayers = (players: User[], shuffledPlayers: User[]) => {
  const pairs: Matchup[] = []
  const indexLeftPlayers = Math.floor(shuffledPlayers.length / 2)
  for (let i = 0; i < indexLeftPlayers; i++) {
    const p1 = shuffledPlayers.at(i)!
    const p2 = shuffledPlayers.at(-i - 1 - shuffledPlayers.length % 2)!
    pairs.push({ player1: p1, player2: p2 })
  }

  // if even number of players, pair up the last shuffled player with the last player in players
  if (players.length % 2 === 0) {
    const p1 = shuffledPlayers.at(-1)!
    const p2 = players.at(-1)!
    pairs.push({ player1: p1, player2: p2 })
  }

  return pairs
}

export const createMatchups = (players: User[]) => {
  const playerCount = players.length
  const rounds = playerCount - 1 + (playerCount % 2)

  const result: Matchup[][] = []

  let shuffledPlayers: User[]
  //  we shuffle all or all but the last player depending if num_players is even or odd
  if (playerCount % 2 === 0) { // even, shuffle all players except for the last one, which is static
    shuffledPlayers = players.slice(0, -1)
  } else {
    shuffledPlayers = players
  }

  for (let i = 0; i < rounds; i++) {
    const pair = pairUpPlayers(players, shuffledPlayers)
    result.push(pair)
    shuffledPlayers = shuffle(shuffledPlayers)
  }

  return result.flat()
}
