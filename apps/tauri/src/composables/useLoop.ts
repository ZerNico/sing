import type { MaybeRef } from '@vueuse/core'

import { loop } from '~/logic/utils/math.utils'

export default function useLoop(max: MaybeRef<number>, options?: { initial?: number }) {
  const maxNumber = ref(max)
  const position = ref(options?.initial ?? 0)

  const increment = () => {
    position.value = loop(position.value + 1, 0, maxNumber.value)
  }
  const decrement = () => {
    position.value = loop(position.value - 1, 0, maxNumber.value)
  }

  const incrementBy = (value: number) => {
    position.value = loop(position.value + value, 0, maxNumber.value)
  }

  watch(maxNumber, () => {
    if (position.value > maxNumber.value) {
      position.value = maxNumber.value
    }
  })

  return {
    position,
    increment,
    decrement,
    incrementBy,
  }
}
