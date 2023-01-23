export type GamepadButton = 'A' | 'B' | 'X' | 'Y' | 'LB' | 'RB' | 'LT' | 'RT' | 'BACK' | 'START' | 'LS' | 'RS' | 'DPAD_UP' | 'DPAD_DOWN' | 'DPAD_LEFT' | 'DPAD_RIGHT' | 'XBOX' | 'L_AXIS_X' | 'L_AXIS_Y' | 'R_AXIS_X' | 'R_AXIS_Y' | 'UNKNOWN'

export interface GamepadButtonEvent {
  button: GamepadButton
  repeat: boolean
  gamepadId: number
  direction: number
}

export const useGamepad = (callback: (e: GamepadButtonEvent) => void, options = { repeatTimeout: 500, axisThreshold: 0.5 }) => {
  const { repeatTimeout, axisThreshold } = options

  const buttonHistories = new Map<number, Map<number, number>>()
  const axesHistories = new Map<number, Map<number, number>>()

  let looping = false
  let isInitialPress = true

  useEventListener('gamepadconnected', (e: GamepadEvent) => {
    buttonHistories.set(e.gamepad.index, new Map())
    axesHistories.set(e.gamepad.index, new Map())
  })

  useEventListener('gamepaddisconnected', (e: GamepadEvent) => {
    buttonHistories.delete(e.gamepad.index)
    axesHistories.delete(e.gamepad.index)
  })

  onMounted(() => {
    const gamepads = navigator.getGamepads()

    for (const gamepad of gamepads) {
      if (gamepad) {
        buttonHistories.set(gamepad.index, new Map())
        axesHistories.set(gamepad.index, new Map())
      }
    }
  })

  const update = () => {
    const gamepads = navigator.getGamepads()
    const currentTime = new Date().getTime()

    // loop through all gamepads
    for (const gamepad of gamepads) {
      if (!gamepad)
        continue
      const buttonHistory = buttonHistories.get(gamepad.index)
      const axesHistory = axesHistories.get(gamepad.index)
      if (!buttonHistory || !axesHistory)
        continue
      let pressed = false

      for (const [index, button] of gamepad.buttons.entries()) {
        // Sets repeat to true if button is held for longer than repeatTimeout
        // This continously sends the button event until the button is released with repeat true to mimic a keydown event
        if (button.pressed) {
          pressed = true
          // Check if the button is pressed on first loop to prevent events on new windows when holding the button a bit too long
          if (isInitialPress)
            continue
          const lastPress = buttonHistory.get(index)
          if (!lastPress) {
            buttonHistory?.set(index, currentTime)
            sendButtonEvent(gamepad.index, index, false)
          } else if (currentTime - lastPress > repeatTimeout) {
            sendButtonEvent(gamepad.index, index, true)
          }
        } else {
          buttonHistory?.delete(index)
        }
      }
      if (!pressed)
        isInitialPress = false

      // Same as above but for axes
      for (const [index, axis] of gamepad.axes.entries()) {
        if (Math.abs(axis) > axisThreshold) {
          const lastPress = axesHistory.get(index)
          if (!lastPress) {
            axesHistory?.set(index, currentTime)
            sendAxisEvent(gamepad.index, index, false, axis)
          } else if (currentTime - lastPress > repeatTimeout) {
            sendAxisEvent(gamepad.index, index, true, axis)
          }
        } else {
          axesHistory?.delete(index)
        }
      }
    }
  }

  const loop = () => {
    if (!looping)
      return
    update()
    requestAnimationFrame(loop)
  }

  const sendButtonEvent = (
    gamepadId: number,
    buttonCode: number,
    isRepeat: boolean,
  ) => {
    const event: GamepadButtonEvent = {
      repeat: isRepeat,
      button: gamepadButtons.get(buttonCode) || 'UNKNOWN',
      gamepadId,
      direction: 0,
    }

    callback(event)
  }

  const sendAxisEvent = (
    gamepadId: number,
    axisCode: number,
    isRepeat: boolean,
    direction: number,
  ) => {
    const event: GamepadButtonEvent = {
      repeat: isRepeat,
      button: gamepadAxes.get(axisCode) || 'UNKNOWN',
      gamepadId,
      direction,
    }

    callback(event)
  }

  const startLoop = () => {
    looping = true
    loop()
  }

  const stopLoop = () => {
    looping = false
  }

  return { startLoop, stopLoop, update }
}

const gamepadButtons = new Map<number, GamepadButton>([
  [0, 'A'],
  [1, 'B'],
  [2, 'X'],
  [3, 'Y'],
  [4, 'LB'],
  [5, 'RB'],
  [6, 'LT'],
  [7, 'RT'],
  [8, 'BACK'],
  [9, 'START'],
  [10, 'LS'],
  [11, 'RS'],
  [12, 'DPAD_UP'],
  [13, 'DPAD_DOWN'],
  [14, 'DPAD_LEFT'],
  [15, 'DPAD_RIGHT'],
  [16, 'XBOX'],
])

const gamepadAxes = new Map<number, GamepadButton>([
  [0, 'L_AXIS_X'],
  [1, 'L_AXIS_Y'],
  [2, 'R_AXIS_X'],
  [3, 'R_AXIS_Y'],
])
