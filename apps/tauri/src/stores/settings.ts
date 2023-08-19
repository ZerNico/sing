export interface Microphone {
  name: string
  color: string
  channel: number
  gain: number
  delay: number
  threshold: number
  sampleRate: number
}

export const useSettingsStore = defineStore(
  'settings',
  () => {
    const general = ref({
      forceOffline: false,
    })

    const volume = ref({
      master: 50,
      game: 100,
      preview: 50,
      menu: 50,
    })

    const relativeVolume = computed(() => {
      return {
        master: volume.value.master,
        game: volume.value.game * (volume.value.master / 100),
        preview: volume.value.preview * (volume.value.master / 100),
        menu: volume.value.menu * (volume.value.master / 100),
      }
    })

    const microphones = ref<Microphone[]>([])

    return { general, volume, relativeVolume, microphones }
  },
  {
    persist: {
      paths: ['general', 'volume'],
    },
  }
)
