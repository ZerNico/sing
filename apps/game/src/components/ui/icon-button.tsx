import type { Component } from "solid-js";
import { Dynamic, Show } from "solid-js/web";
import IconLoaderCircle from "~icons/lucide/loader-circle";

interface IconButtonProps {
  selected?: boolean;
  active?: boolean;
  label: string;
  gradient: string;
  loading?: boolean;
  icon: Component<{ class?: string }>;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

export default function IconButton(props: IconButtonProps) {
  return (
    <button
      class="flex h-44 w-32 flex-col gap-1 transition-all ease-in-out active:scale-95"
      classList={{
        "opacity-50": !props.selected,
        "scale-95": props.active,
      }}
      type="button"
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
    >
      <div class="max-w-full truncate text-ellipsis font-semibold text-sm uppercase">{props.label}</div>
      <div
        class="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-b"
        classList={{
          [props.gradient || ""]: true,
        }}
      >
        <Show when={!props.loading} fallback={<Dynamic class="animate-spin text-6xl" component={IconLoaderCircle} />}>
          <Dynamic class="text-6xl" component={props.icon} />
        </Show>
      </div>
    </button>
  );
}
