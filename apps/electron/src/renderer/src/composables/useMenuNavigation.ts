import type { MaybeRef } from '@vueuse/core'

import { keyMode } from '@renderer/logic/ui/keys'
import type { GamepadButtonEvent } from './useGamepad'

export interface MenuNavigationEvent {
  repeat: boolean
  action:
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'back'
  | 'confirm'
  | 'pageup'
  | 'pagedown'
  | 'search'
  | 'random'
}

export default function useMenuNavigation(
  callback: MaybeRef<(event: MenuNavigationEvent) => void>,
) {
  const refCallback = ref(callback)

  const onButtonDown = (event: GamepadButtonEvent) => {
    keyMode.value = 'gamepad'
    if (
      event.button === 'DPAD_LEFT'
      || (event.button === 'L_AXIS_X' && event.direction < -0.5)
    ) {
      refCallback.value({ action: 'left', repeat: event.repeat })
    }
    if (
      event.button === 'DPAD_RIGHT'
      || (event.button === 'L_AXIS_X' && event.direction > 0.5)
    ) {
      refCallback.value({ action: 'right', repeat: event.repeat })
    }
    if (
      event.button === 'DPAD_UP'
      || (event.button === 'L_AXIS_Y' && event.direction < -0.5)
    ) {
      refCallback.value({ action: 'up', repeat: event.repeat })
    }
    if (
      event.button === 'DPAD_DOWN'
      || (event.button === 'L_AXIS_Y' && event.direction > 0.5)
    ) {
      refCallback.value({ action: 'down', repeat: event.repeat })
    }

    if (event.button === 'B') {
      refCallback.value({ action: 'back', repeat: event.repeat })
    }
    if (event.button === 'A') {
      refCallback.value({ action: 'confirm', repeat: event.repeat })
    }
    if (event.button === 'RB') {
      refCallback.value({ action: 'pagedown', repeat: event.repeat })
    }
    if (event.button === 'LB') {
      refCallback.value({ action: 'pageup', repeat: event.repeat })
    }
    if (event.button === 'START') {
      refCallback.value({ action: 'search', repeat: event.repeat })
    }
    if (event.button === 'Y') {
      refCallback.value({ action: 'random', repeat: event.repeat })
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    keyMode.value = 'keyboard'
    if (event.key === 'ArrowLeft') {
      refCallback.value({ action: 'left', repeat: event.repeat })
    }
    if (event.key === 'ArrowRight') {
      refCallback.value({ action: 'right', repeat: event.repeat })
    }
    if (event.key === 'ArrowUp') {
      refCallback.value({ action: 'up', repeat: event.repeat })
    }
    if (event.key === 'ArrowDown') {
      refCallback.value({ action: 'down', repeat: event.repeat })
    }
    if (['Escape', 'Backspace'].includes(event.key)) {
      refCallback.value({ action: 'back', repeat: event.repeat })
    }
    if (['Enter', 'Space'].includes(event.key)) {
      refCallback.value({ action: 'confirm', repeat: event.repeat })
    }
    if (event.key === 'PageUp') {
      refCallback.value({ action: 'pageup', repeat: event.repeat })
    }
    if (event.key === 'PageDown') {
      refCallback.value({ action: 'pagedown', repeat: event.repeat })
    }
    if (event.key === 'F3') {
      event.preventDefault()
      refCallback.value({ action: 'search', repeat: event.repeat })
    }
    if (event.key === 'F4') {
      event.preventDefault()
      refCallback.value({ action: 'random', repeat: event.repeat })
    }
  }

  useEventListener('keydown', onKeyDown)

  const { startLoop, stopLoop } = useGamepad(onButtonDown)

  onMounted(() => {
    startLoop()
  })

  onUnmounted(() => {
    stopLoop()
  })
}
