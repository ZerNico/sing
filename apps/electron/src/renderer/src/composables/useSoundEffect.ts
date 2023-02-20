import selectSfx from '@renderer/assets/sounds/select.mp3'
import confirmSfx from '@renderer/assets/sounds/confirm.mp3'

import { useSound } from '@vueuse/sound'
import type { MaybeRef } from '@vueuse/core'

type Sound = 'select' | 'confirm'

export const useSoundEffect = (sound: MaybeRef<Sound>) => {
  const soundRef = ref(sound)
  const settingsStore = useSettingsStore()

  const sfx = computed(() => {
    switch (soundRef.value) {
      case 'select':
        return selectSfx
      case 'confirm':
        return confirmSfx
    }
  })

  const volume = computed(() => {
    return settingsStore.getMenuVolume / 100
  })

  const s = useSound(sfx, { volume })
  const play = () => {
    s.play()
  }
  return { play }
}
