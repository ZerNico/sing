import { makeEventListener } from "@solid-primitives/event-listener";
import { ReactiveMap } from "@solid-primitives/map";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import mitt from "mitt";
import { createEffect, createMemo, on, onCleanup } from "solid-js";
import { type GamepadButton, createGamepad } from "./gamepad";

interface UseNavigationOptions {
  layer: number;
  enabled?: boolean;
  onKeydown?: (event: NavigationEvent) => void;
  onKeyup?: (event: NavigationEvent) => void;
  onHold?: (event: NavigationEvent) => void;
}

type NavigationEvent = {
  origin: "gamepad" | "keyboard";
  originalKey: string;
  action: "left" | "right" | "up" | "down" | "back" | "confirm";
};

const KEY_MAPPINGS = new Map<string, NavigationEvent["action"]>([
  ["ArrowLeft", "left"],
  ["ArrowRight", "right"],
  ["ArrowUp", "up"],
  ["ArrowDown", "down"],
  ["Escape", "back"],
  ["Enter", "confirm"],
  ["a", "left"],
  ["d", "right"],
  ["w", "up"],
  ["s", "down"],
  [" ", "confirm"],
]);

const GAMEPAD_MAPPINGS = new Map<GamepadButton, NavigationEvent["action"]>([
  ["DPAD_LEFT", "left"],
  ["DPAD_RIGHT", "right"],
  ["DPAD_UP", "up"],
  ["DPAD_DOWN", "down"],
  ["B", "back"],
  ["A", "confirm"],
]);

const getAxisAction = (button: GamepadButton, direction: number): NavigationEvent["action"] | undefined => {
  switch (button) {
    case "L_AXIS_X":
      return direction > 0 ? "right" : "left";
    case "L_AXIS_Y":
      return direction > 0 ? "down" : "up";
    default:
      return undefined;
  }
};

type Events = {
  keydown: NavigationEvent;
  keyup: NavigationEvent;
  hold: NavigationEvent;
};

const emitter = mitt<Events>();
const pressedKeys = new Map<string, number>();
const pressedGamepadButtons = new Map<string, number>();
const HOLD_DELAY = 500;

makeEventListener(window, "keydown", (event) => {
  if (event.repeat) return;

  const action = KEY_MAPPINGS.get(event.key);
  if (action) {
    event.preventDefault();
    emitter.emit("keydown", {
      origin: "keyboard",
      originalKey: event.key,
      action: action,
    });

    const timeout = window.setTimeout(() => {
      emitter.emit("hold", {
        origin: "keyboard",
        originalKey: event.key,
        action: action,
      });
    }, HOLD_DELAY);
    pressedKeys.set(event.key, timeout);
  }
});

makeEventListener(window, "keyup", (event) => {
  if (event.repeat) return;

  const action = KEY_MAPPINGS.get(event.key);
  if (action) {
    event.preventDefault();
    const timeout = pressedKeys.get(event.key);
    if (timeout) {
      clearTimeout(timeout);
      pressedKeys.delete(event.key);
    }

    emitter.emit("keyup", {
      origin: "keyboard",
      originalKey: event.key,
      action: action,
    });
  }
});

createGamepad({
  onButtonDown: (event) => {
    const action = GAMEPAD_MAPPINGS.get(event.button);
    if (action) {
      emitter.emit("keydown", {
        origin: "gamepad",
        originalKey: event.button,
        action,
      });

      const timeout = window.setTimeout(() => {
        emitter.emit("hold", {
          origin: "gamepad",
          originalKey: event.button,
          action,
        });
      }, HOLD_DELAY);
      pressedGamepadButtons.set(event.button, timeout);
      return;
    }

    if (!event.direction) return;

    const axisAction = getAxisAction(event.button, event.direction);
    if (axisAction) {
      emitter.emit("keydown", {
        origin: "gamepad",
        originalKey: event.button,
        action: axisAction,
      });

      const timeout = window.setTimeout(() => {
        emitter.emit("hold", {
          origin: "gamepad",
          originalKey: event.button,
          action: axisAction,
        });
      }, HOLD_DELAY);
      pressedGamepadButtons.set(event.button, timeout);
    }
  },
  onButtonUp: (event) => {
    const timeout = pressedGamepadButtons.get(event.button);
    if (timeout) {
      clearTimeout(timeout);
      pressedGamepadButtons.delete(event.button);
    }

    const action = GAMEPAD_MAPPINGS.get(event.button);
    if (action) {
      emitter.emit("keyup", {
        origin: "gamepad",
        originalKey: event.button,
        action,
      });
      return;
    }


    const axisAction = getAxisAction(event.button, event.direction ?? 0);
    if (axisAction) {
      emitter.emit("keyup", {
        origin: "gamepad",
        originalKey: event.button,
        action: axisAction,
      });
    }
  },
});

const layerInstances = new ReactiveMap<number, number>();

export function useNavigation(options: MaybeAccessor<UseNavigationOptions>) {
  createEffect(
    on(
      () => access(options),
      (options) => {
        layerInstances.set(options.layer, (layerInstances.get(options.layer) ?? 0) + 1);

        onCleanup(() => {
          const current = layerInstances.get(options.layer) || 0;
          if (current <= 1) {
            layerInstances.delete(options.layer);
          } else {
            layerInstances.set(options.layer, current - 1);
          }
        });
      },
    ),
  );

  const isActive = createMemo(() => {
    const opts = access(options);
    const highestLayer = Math.max(...layerInstances.keys());
    return (opts?.enabled ?? true) && opts?.layer === highestLayer;
  });

  createEffect(() => {
    if (!isActive()) return;

    const opts = access(options);
    if (opts?.enabled === false) return;

    const handleKeydown = (e: NavigationEvent) => opts?.onKeydown?.(e);
    const handleKeyup = (e: NavigationEvent) => opts?.onKeyup?.(e);
    const handleHold = (e: NavigationEvent) => opts?.onHold?.(e);

    emitter.on("keydown", handleKeydown);
    emitter.on("keyup", handleKeyup);
    emitter.on("hold", handleHold);

    onCleanup(() => {
      emitter.off("keydown", handleKeydown);
      emitter.off("keyup", handleKeyup);
      emitter.off("hold", handleHold);
    });
  });

  return { isActive };
}
