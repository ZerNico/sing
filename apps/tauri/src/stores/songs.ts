import { FileEntry, readDir } from '@tauri-apps/api/fs'

import { parseLocalTree } from '~/lib/song/parser/local-song'
import { Song } from '~/lib/song/song'

type SongStorage = Map<string, { needsUpdate: boolean; songs: Song[] }>

export const useSongsStore = defineStore(
  'songs',
  () => {
    const { client } = useRSPC()
    const localPaths = ref<string[]>([])
    const localSongStorage = ref<SongStorage>(new Map([]))

    watch(localPaths, (value) => {
      // add new paths to storage
      for (const path of value) {
        if (!localSongStorage.value.has(path)) {
          localSongStorage.value.set(path, { needsUpdate: true, songs: [] })
        }
      }
      // remove old paths from storage
      for (const path of localSongStorage.value.keys()) {
        if (!value.includes(path)) {
          localSongStorage.value.delete(path)
        }
      }
    })

    const needsUpdate = computed(() => [...localSongStorage.value.values()].some((storage) => storage.needsUpdate))

    const updateLocal = async () => {
      // loop through all paths and update songs
      for (const [path, storage] of localSongStorage.value.entries()) {
        if (!storage.needsUpdate) continue
        try {
          const entries = await readDir(path, { recursive: true })
          const root: FileEntry = { path, children: entries }
          const songs = await parseLocalTree(root, client)
          localSongStorage.value.set(path, { needsUpdate: false, songs })
        } catch (error) {
          console.error(error)
          localSongStorage.value.set(path, { needsUpdate: false, songs: [] })
        }
      }
    }

    const songs = computed(() => {
      // return all songs unique by hash
      const songs = new Map<string, Song>()
      for (const storage of localSongStorage.value.values()) {
        for (const song of storage.songs) {
          songs.set(song.getMeta().hash, song)
        }
      }
      return [...songs.values()]
    })

    const addLocalPath = (path: string) => {
      localPaths.value.push(path)
    }

    const removeLocalPath = (path: string) => {
      const index = localPaths.value.indexOf(path)
      if (index !== -1) {
        localPaths.value.splice(index, 1)
      }
    }

    return { localPaths, updateLocal, needsUpdate, songs, addLocalPath, removeLocalPath }
  },
  {
    persist: {
      paths: ['localPaths'],
    },
  }
)
