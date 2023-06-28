import { router } from '../trpc'
import { lobbyRouter } from './lobby'

export const appRouter = router({
  lobby: lobbyRouter,
})

export type AppRouter = typeof appRouter
