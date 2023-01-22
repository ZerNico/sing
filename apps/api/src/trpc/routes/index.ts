import { router } from '../trpc'
import { exampleRouter } from './example'
import { healthRouter } from './health'

export const appRouter = router({
  health: healthRouter,
  example: exampleRouter,
})

export type AppRouter = typeof appRouter
