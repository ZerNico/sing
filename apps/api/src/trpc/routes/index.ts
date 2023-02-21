import { router } from '../trpc'
import { healthRouter } from './health'
import { highscoreRouter } from './highscore'
import { lobbyRouter } from './lobby'

export const appRouter = router({
  health: healthRouter,
  lobby: lobbyRouter,
  highscore: highscoreRouter,
})

export type AppRouter = typeof appRouter
