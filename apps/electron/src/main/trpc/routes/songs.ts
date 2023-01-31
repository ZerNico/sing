import { dialog } from 'electron'
import { z } from 'zod'
import dirTree from 'directory-tree'
import { publicProcedure, router } from '../trpc'

export const songsRouter = router({
  pickFolder: publicProcedure.query(async () => {
    const dir = await dialog.showOpenDialog({ properties: ['openDirectory'] })

    if (dir.filePaths.length < 1) return null
    return dir.filePaths[0]
  }),
  getTree: publicProcedure.input(z.object({ path: z.string() })).query(async ({ input }) => {
    const tree = await dirTree(input.path, { attributes: ['type', 'extension'] })
    return tree
  }),
})
