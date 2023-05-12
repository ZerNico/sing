import { useSound } from '@vueuse/sound'
import type { MaybeRef } from '@vueuse/core'
import selectSfx from '~/assets/sounds/select.mp3'
import confirmSfx from '~/assets/sounds/confirm.mp3'

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
    return (settingsStore.getMenuVolume / 100) * 2
  })

  const s = useSound(sfx, { volume })
  const play = () => {
    s.play()
  }
  return { play }
}
