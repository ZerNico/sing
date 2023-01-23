import { router } from '../trpc'
import { healthRouter } from './health'
import { lobbyRouter } from './lobby'

export const appRouter = router({
  health: healthRouter,
  lobby: lobbyRouter,
})

export type AppRouter = typeof appRouter
