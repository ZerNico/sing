import { MaybeRef } from 'nuxt/dist/app/compat/capi'
import { AnyFn } from '~/lib/types'

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
  const startTime = ref<Date | null>(null)
  const remainingTime = ref(0)

  let timer: ReturnType<typeof setTimeout> | null = null

  function clear() {
    if (timer) {
      clearTimeout(timer)
      timer = null
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
    remainingTime.value -= Date.now() - startTime.value!.getTime()
  }

  function resume(...args: Parameters<CallbackFn> | []) {
    if (timer) return

    startTime.value = new Date()
    timeout(remainingTime.value, ...args)
  }

  const timeout = (interval: number, ...args: Parameters<CallbackFn> | []) => {
    timer = setTimeout(() => {
      isPending.value = false
      timer = null
      startTime.value = null
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
