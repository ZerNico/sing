import { FileEntry, readDir } from '@tauri-apps/api/fs'

import { parseLocalTree } from '~/lib/song/parser/local-song'
import { Song } from '~/lib/song/song'

type SongStorage = Map<string, { needsUpdate: boolean; songs: Song[] }>

export const useSongsStore = defineStore(
  'songs',
  () => {
    const localPaths = ref([])
    const localSongStorage = ref<SongStorage>(new Map([]))

    for (const path of localPaths.value) {
      localSongStorage.value.set(path, { needsUpdate: true, songs: [] })
    }

    const needsUpdate = computed(() => [...localSongStorage.value.values()].some((storage) => storage.needsUpdate))

    const updateLocal = async () => {
      // loop through all paths and update songs
      for (const [path, storage] of localSongStorage.value.entries()) {
        if (!storage.needsUpdate) continue
        try {
          const entries = await readDir(path, { recursive: true })
          const root: FileEntry = { path, children: entries }
          const songs = await parseLocalTree(root)
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

    return { localPaths, updateLocal, needsUpdate, songs }
  },
  {
    persist: {
      paths: ['localPaths'],
    },
  }
)
