import { MaybeRef } from '@vueuse/core'

import { AnyFn } from '~/lib/utils/type'

export interface UsePausableTimeoutFnOptions {
  immediate?: boolean
}

export const usePausableTimeoutFn = <CallbackFn extends AnyFn>(
  cb: CallbackFn,
  interval: MaybeRef<number>,
  options?: UsePausableTimeoutFnOptions
) => {
  const { immediate = true } = options || {}
  const intervalRef = toRef(interval)

  const isPending = ref(false)
  const startTime = ref<Date | undefined>()
  const remainingTime = ref(0)

  let timer: ReturnType<typeof setTimeout> | undefined

  function clear() {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  function stop() {
    isPending.value = false
    clear()
  }

  function start(...args: Parameters<CallbackFn> | []) {
    clear()
    isPending.value = true
    startTime.value = new Date()
    remainingTime.value = intervalRef.value

    timeout(intervalRef.value, ...args)
  }

  function pause() {
    clear()
    if (!startTime.value) return
    remainingTime.value -= Date.now() - startTime.value.getTime()
  }

  function resume(...args: Parameters<CallbackFn> | []) {
    if (timer) return

    startTime.value = new Date()
    timeout(remainingTime.value, ...args)
  }

  const timeout = (interval: number, ...args: Parameters<CallbackFn> | []) => {
    timer = setTimeout(() => {
      isPending.value = false
      timer = undefined
      startTime.value = undefined
      remainingTime.value = 0

      cb(...args)
    }, interval)
  }

  if (immediate) {
    isPending.value = true
    if (typeof window !== 'undefined') start()
  }

  onScopeDispose(stop)

  return {
    start,
    pause,
    resume,
    stop,
    clear,
    isPending,
  }
}
