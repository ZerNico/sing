import type { MaybeRef } from '@vueuse/core'

interface HasRepeat {
  repeat: boolean
}

export default function useRepeatThrottleFn<T extends HasRepeat>(callback: (e: T) => void, delay: MaybeRef<number>) {
  const delayRef = ref(delay)

  const disabled = ref(false)

  const throttleFn = (e: T) => {
    if (!e.repeat) {
      callback(e)
    } else if (!disabled.value) {
      disabled.value = true
      callback(e)
      setTimeout(() => {
        disabled.value = false
      }, delayRef.value)
    }
  }

  return throttleFn
}
