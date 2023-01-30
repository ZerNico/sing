import { router } from '../trpc'
import { songsRouter } from './songs'

export const ipcRouter = router({
  songs: songsRouter,
})

export type IPCRouter = typeof ipcRouter
