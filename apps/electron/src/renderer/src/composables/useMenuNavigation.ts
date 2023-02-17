import type { MaybeRef } from '@vueuse/core'

import { keyMode } from '@renderer/logic/ui/keys'
import type { GamepadButtonEvent } from './useGamepad'

export interface MenuNavigationEvent {
  repeat: boolean
  origin: 'gamepad' | 'keyboard'
  originalKey: string
  action:
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'back'
  | 'confirm'
  | 'sortleft'
  | 'sortright'
  | 'search'
  | 'random'
  | 'menu'
}

export default function useMenuNavigation(
  callback: MaybeRef<(event: MenuNavigationEvent) => void>,
  // options with immediate that defaults to true
  options: { immediate?: boolean } = { immediate: true },
) {
  const refCallback = ref(callback)

  const onButtonDown = (event: GamepadButtonEvent) => {
    keyMode.value = 'gamepad'
    const callback = (action: MenuNavigationEvent['action']) => {
      refCallback.value({
        action,
        repeat: event.repeat,
        origin: 'gamepad',
        originalKey: event.button,
      })
    }
    if (
      event.button === 'DPAD_LEFT'
      || (event.button === 'L_AXIS_X' && event.direction < -0.5)
    ) {
      callback('left')
    }
    if (
      event.button === 'DPAD_RIGHT'
      || (event.button === 'L_AXIS_X' && event.direction > 0.5)
    ) {
      callback('right')
    }
    if (
      event.button === 'DPAD_UP'
      || (event.button === 'L_AXIS_Y' && event.direction < -0.5)
    ) {
      callback('up')
    }
    if (
      event.button === 'DPAD_DOWN'
      || (event.button === 'L_AXIS_Y' && event.direction > 0.5)
    ) {
      callback('down')
    }

    if (event.button === 'B') {
      callback('back')
    }
    if (event.button === 'A') {
      callback('confirm')
    }
    if (event.button === 'RB') {
      callback('sortright')
    }
    if (event.button === 'LB') {
      callback('sortleft')
    }
    if (event.button === 'START') {
      callback('search')
      callback('menu')
    }
    if (event.button === 'Y') {
      callback('random')
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    keyMode.value = 'keyboard'

    const callback = (action: MenuNavigationEvent['action']) => {
      refCallback.value({
        action,
        repeat: event.repeat,
        origin: 'keyboard',
        originalKey: event.key,
      })
    }

    if (event.key === 'ArrowLeft') {
      callback('left')
    }
    if (event.key === 'ArrowRight') {
      callback('right')
    }
    if (event.key === 'ArrowUp') {
      callback('up')
    }
    if (event.key === 'ArrowDown') {
      callback('down')
    }
    if (['Escape', 'Backspace'].includes(event.key)) {
      callback('back')
    }
    if (['Enter', ' '].includes(event.key)) {
      callback('confirm')
    }
    if (event.key === 'PageUp') {
      callback('sortleft')
    }
    if (event.key === 'PageDown') {
      callback('sortright')
    }
    if (event.key === 'F3') {
      event.preventDefault()
      callback('search')
    }
    if (event.key === 'F4') {
      event.preventDefault()
      callback('random')
    }
  }

  useEventListener('keydown', onKeyDown)

  const { startLoop, stopLoop, update } = useGamepad(onButtonDown)

  onMounted(() => {
    if (options.immediate) startLoop()
  })

  onUnmounted(() => {
    stopLoop()
  })

  return { update }
}
