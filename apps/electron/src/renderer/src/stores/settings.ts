interface SettingsState {
  volume: {
    master: number
    game: number
    preview: number
  }
  microphones: Microphone[]
}

export interface Microphone {
  label: string
  id: string
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
  persist: true,
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
