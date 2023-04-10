interface SettingsState {
  volume: {
    master: number
    game: number
    preview: number
    menu: number
  }
  microphones: Microphone[]
}

export interface Microphone {
  name: string
  color: string
  channel: number
  gain: number
  delay: number
  threshold: number
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    volume: {
      master: 50,
      game: 100,
      preview: 50,
      menu: 50,
    },
    microphones: [],
  }),
  actions: {
    deleteMicrophone(index: number) {
      this.microphones.splice(index, 1)
    },
    saveMicrophone(index: number, Microphone: Microphone) {
      this.microphones[index] = Microphone
    },
  },
  getters: {
    getMenuVolume: (state) => {
      return state.volume.menu * (state.volume.master / 100)
    },
    getPreviewVolume: (state) => {
      return state.volume.preview * (state.volume.master / 100)
    },
    getGameVolume: (state) => {
      return state.volume.game * (state.volume.master / 100)
    },
  },
  persist: true,
})

if (import.meta.hot) {
  // @ts-ignore Typings are wrong because of persisted-state
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
