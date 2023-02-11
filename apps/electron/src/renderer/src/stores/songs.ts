import type { LocalSong } from '@renderer/logic/song/song'

interface SongsState {
  paths: string[]
  needsUpdate: boolean
  songs: Map<string, LocalSong>
}

export const useSongsStore = defineStore('songs', {
  state: (): SongsState => ({
    paths: [],
    needsUpdate: true,
    songs: new Map(),
  }),
  actions: {
    addPath(path: string) {
      if (this.paths.includes(path)) return
      this.paths.push(path)
      this.needsUpdate = true
    },
    removePath(path: string) {
      this.paths = this.paths.filter(p => p !== path)
      this.needsUpdate = true
    },
    addSongs(songs: LocalSong[]) {
      songs.forEach(song => this.songs.set(song.meta.hash, song))
    },
    clearSongs() {
      this.songs.clear()
    },
  },
  getters: {
    getSongs: (state) => {
      return Array.from(state.songs.values())
    },
  },
  persist: {
    paths: ['paths'],
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSongsStore, import.meta.hot))
}
