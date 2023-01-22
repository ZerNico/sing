import { publicProcedure, router } from '../trpc'

export const exampleRouter = router({
  example: publicProcedure.query(({ input }) => {
    return input
  }),
})
