import { dialog } from 'electron'
import { publicProcedure, router } from '../trpc'

export const songsRouter = router({
  pickFolder: publicProcedure.query(async () => {
    const dir = await dialog.showOpenDialog({ properties: ['openDirectory'] })

    if (dir.filePaths.length < 1) return null
    return dir.filePaths[0]
  }),
})
