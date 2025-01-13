import { createEventListener } from "@solid-primitives/event-listener";
import createRAF, { targetFPS } from "@solid-primitives/raf";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import { onMount } from "solid-js";

export type GamepadButton =
  | "A"
  | "B"
  | "X"
  | "Y"
  | "LB"
  | "RB"
  | "LT"
  | "RT"
  | "BACK"
  | "START"
  | "LS"
  | "RS"
  | "DPAD_UP"
  | "DPAD_DOWN"
  | "DPAD_LEFT"
  | "DPAD_RIGHT"
  | "XBOX"
  | "L_AXIS_X"
  | "L_AXIS_Y"
  | "R_AXIS_X"
  | "R_AXIS_Y"
  | "UNKNOWN";

interface GamepadButtonEvent {
  button: GamepadButton;
  repeat: boolean;
  gamepadId: number;
  direction: number;
}

interface CreateGamepadOptions {
  onButtonDown?: (event: GamepadButtonEvent) => void;
  onButtonUp?: (event: GamepadButtonEvent) => void;
}

const AXIS_THRESHOLD = 0.5;

export const createGamepad = (options: MaybeAccessor<CreateGamepadOptions>) => {
  const buttonHistories = new Map<number, Map<number, number>>();
  const axesHistories = new Map<number, Map<number, number>>();

  createEventListener(window, "gamepadconnected", (event) => {
    buttonHistories.set(event.gamepad.index, new Map());
    axesHistories.set(event.gamepad.index, new Map());
  });

  createEventListener(window, "gamepaddisconnected", (event) => {
    buttonHistories.delete(event.gamepad.index);
    axesHistories.delete(event.gamepad.index);
  });

  const [_running, start, _stop] = createRAF(
    targetFPS(() => {
      const gamepads = navigator.getGamepads();
      const opts = access(options);

      for (const gamepad of gamepads) {
        if (!gamepad) continue;

        const buttonHistory = buttonHistories.get(gamepad.index);
        const axesHistory = axesHistories.get(gamepad.index);
        if (!buttonHistory || !axesHistory) continue;

        for (const [index, button] of gamepad.buttons.entries()) {
          const isPressed = button.pressed || button.value > 0.5;
          const wasPressed = buttonHistory.get(index) || 0;

          if (isPressed && !wasPressed) {
            buttonHistory.set(index, 1);
            opts?.onButtonDown?.({
              button: BUTTON_MAPPINGS.get(index) || "UNKNOWN",
              repeat: false,
              gamepadId: gamepad.index,
              direction: button.value,
            });
          } else if (!isPressed && wasPressed) {
            buttonHistory.set(index, 0);
            opts?.onButtonUp?.({
              button: BUTTON_MAPPINGS.get(index) || "UNKNOWN",
              repeat: false,
              gamepadId: gamepad.index,
              direction: 0,
            });
          }
        }

        for (const [index, axis] of gamepad.axes.entries()) {
          const prevValue = axesHistory.get(index) || 0;
          const isActive = Math.abs(axis) > AXIS_THRESHOLD;
          const wasActive = Math.abs(prevValue) > AXIS_THRESHOLD;

          if (isActive !== wasActive) {
            axesHistory.set(index, axis);
            const axisButton = AXIS_MAPPINGS.get(index) || "UNKNOWN";

            if (isActive) {
              opts?.onButtonDown?.({
                button: axisButton,
                repeat: false,
                gamepadId: gamepad.index,
                direction: axis,
              });
            } else {
              opts?.onButtonUp?.({
                button: axisButton,
                repeat: false,
                gamepadId: gamepad.index,
                direction: 0,
              });
            }
          }
        }
      }
    }, 60),
  );

  onMount(() => {
    const gamepads = navigator.getGamepads();

    for (const gamepad of gamepads) {
      if (gamepad) {
        buttonHistories.set(gamepad.index, new Map());
        axesHistories.set(gamepad.index, new Map());
      }
    }

    start();
  });
};

const BUTTON_MAPPINGS = new Map<number, GamepadButton>([
  [0, "A"],
  [1, "B"],
  [2, "X"],
  [3, "Y"],
  [4, "LB"],
  [5, "RB"],
  [6, "LT"],
  [7, "RT"],
  [8, "BACK"],
  [9, "START"],
  [10, "LS"],
  [11, "RS"],
  [12, "DPAD_UP"],
  [13, "DPAD_DOWN"],
  [14, "DPAD_LEFT"],
  [15, "DPAD_RIGHT"],
  [16, "XBOX"],
]);

const AXIS_MAPPINGS = new Map<number, GamepadButton>([
  [0, "L_AXIS_X"],
  [1, "L_AXIS_Y"],
  [2, "R_AXIS_X"],
  [3, "R_AXIS_Y"],
]);
