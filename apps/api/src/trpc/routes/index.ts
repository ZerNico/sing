import { router } from '../trpc'
import { highscoreRouter } from './highscore'
import { lobbyRouter } from './lobby'
import { userRouter } from './user'

export const appRouter = router({
  user: userRouter,
  lobby: lobbyRouter,
  highscore: highscoreRouter,
})

export type AppRouter = typeof appRouter
