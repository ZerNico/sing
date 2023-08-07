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

    watch(volume, () => {
      console.log('volume changed', volume.value)
    })

    const relativeVolume = computed(() => {
      return {
        master: volume.value.master,
        game: volume.value.game * (volume.value.master / 100),
        preview: volume.value.preview * (volume.value.master / 100),
        menu: volume.value.menu * (volume.value.master / 100),
      }
    })

    return { general, volume, relativeVolume }
  },
  {
    persist: {
      paths: ['general', 'volume'],
    },
  }
)
