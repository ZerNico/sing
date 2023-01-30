interface SongsState {
  paths: string[]
  needsUpdate: boolean
}

export const useSongsStore = defineStore('songs', {
  state: (): SongsState => ({
    paths: [],
    needsUpdate: true,
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
  },
  persist: {
    key: 'paths',
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSongsStore, import.meta.hot))
}
