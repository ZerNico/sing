import type { JSX } from "solid-js";
import IconLoaderCircle from "~icons/lucide/loader-circle";

interface ButtonProps {
  selected?: boolean;
  active?: boolean;
  gradient?: string;
  children?: JSX.Element;
  class?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  loading?: boolean;
}

export default function Button(props: ButtonProps) {
  return (
    <button
      class="grid h-16 items-center overflow-hidden rounded-lg transition-all ease-in-out active:scale-95"
      classList={{
        [props.class || ""]: true,
        "scale-95": props.active,
      }}
      type="button"
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      disabled={props.loading}
    >
      <div
        class="z-2 col-start-1 row-start-1 text-center font-bold text-xl transition-opacity"
        classList={{
          "pointer-events-none opacity-0": props.loading,
        }}
      >
        {props.children}
      </div>

      <div
        class="z-2 col-start-1 row-start-1 flex items-center justify-center transition-opacity"
        classList={{
          "pointer-events-none opacity-0": !props.loading,
        }}
      >
        <IconLoaderCircle class="animate-spin text-2xl" />
      </div>

      <div
        class="col-start-1 row-start-1 h-full w-full bg-gradient-to-r transition-all"
        classList={{
          [props.gradient || ""]: true,
          "opacity-0": !props.selected,
        }}
      />
    </button>
  );
}
