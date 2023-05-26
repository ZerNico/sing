import { sleep } from '~/logic/utils/promise.utils'

interface PageAnimationOptions {
  duration?: number
  immediate?: boolean
}

export const usePageAnimation = (options?: PageAnimationOptions) => {
  const { duration = 500, immediate = true } = options || {}

  const animated = ref(true)
  const status = ref<'entering' | 'entered' | 'exiting' | 'exited'>('entering')

  const enter = async () => {
    status.value = 'entering'
    animated.value = false
    await sleep(duration)
    status.value = 'entered'
  }

  const exit = async () => {
    status.value = 'exiting'
    animated.value = true
    await sleep(duration)
    status.value = 'exited'
  }

  if (immediate) {
    setTimeout(() => {
      enter()
    }, 10)
  }

  return {
    animated,
    status,
    enter,
    exit,
  }
}
