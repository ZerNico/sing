export const useSettingsStore = defineStore(
  'settings',
  () => {
    const general = ref({
      forceOffline: false,
    })

    return { general }
  },
  { persist: true }
)
