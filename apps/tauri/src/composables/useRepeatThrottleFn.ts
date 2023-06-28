import type { MaybeRef } from '@vueuse/core'

interface HasRepeat {
  repeat: boolean
}

export default function useRepeatThrottleFn<T extends HasRepeat>(
  callback: MaybeRef<(e: T) => void>,
  delay: MaybeRef<number>
) {
  const callbackRef = ref(callback)
  const delayRef = ref(delay)

  const disabled = ref(false)

  const throttleFn = (e: T) => {
    if (!e.repeat) {
      callbackRef.value(e)
    } else if (!disabled.value) {
      disabled.value = true
      callbackRef.value(e)
      setTimeout(() => {
        disabled.value = false
      }, delayRef.value)
    }
  }

  return throttleFn
}
