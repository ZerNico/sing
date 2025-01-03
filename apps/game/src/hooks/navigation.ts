import { makeEventListener } from "@solid-primitives/event-listener";
import { ReactiveMap } from "@solid-primitives/map";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import mitt from "mitt";
import { createEffect, createMemo, on, onCleanup } from "solid-js";

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

const KEY_MAPPINGS: Record<string, NavigationEvent["action"]> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  Escape: "back",
  Enter: "confirm",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
  " ": "confirm",
};

type Events = {
  keydown: NavigationEvent;
  keyup: NavigationEvent;
  hold: NavigationEvent;
};

const emitter = mitt<Events>();
const pressedKeys = new Map<string, number>();
const HOLD_DELAY = 500;

makeEventListener(window, "keydown", (event) => {
  if (event.repeat) {
    return;
  }

  const action = KEY_MAPPINGS[event.key];
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
  if (event.repeat) {
    return;
  }

  const action = KEY_MAPPINGS[event.key];
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
