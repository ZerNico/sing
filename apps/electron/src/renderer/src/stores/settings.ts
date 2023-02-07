interface SettingsState {
  volume: {
    master: number
    game: number
    preview: number
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    volume: {
      master: 50,
      game: 100,
      preview: 50,
    },
  }),
  persist: true,
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
