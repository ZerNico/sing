import { makeEventListener } from "@solid-primitives/event-listener";
import { ReactiveMap } from "@solid-primitives/map";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import mitt from "mitt";
import { createEffect, createMemo, on, onCleanup } from "solid-js";

interface UseNavigationOptions {
  layer: number;
  onKeydown?: (event: NavigationEvent) => void;
  onKeyup?: (event: NavigationEvent) => void;
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
};

const emitter = mitt<Events>();

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
  }
});

makeEventListener(window, "keyup", (event) => {
  if (event.repeat) {
    return;
  }

  const action = KEY_MAPPINGS[event.key];
  if (action) {
    event.preventDefault();
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
    const highestLayer = Math.max(...layerInstances.keys());
    return access(options)?.layer === highestLayer;
  });

  createEffect(() => {
    if (!isActive()) return;

    const opts = access(options);
    const handleKeydown = (e: NavigationEvent) => opts?.onKeydown?.(e);
    const handleKeyup = (e: NavigationEvent) => opts?.onKeyup?.(e);

    emitter.on("keydown", handleKeydown);
    emitter.on("keyup", handleKeyup);

    onCleanup(() => {
      emitter.off("keydown", handleKeydown);
      emitter.off("keyup", handleKeyup);
    });
  });

  return { isActive };
}
