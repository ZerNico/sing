import type { JSX } from "solid-js";

interface ButtonProps {
  selected?: boolean;
  active?: boolean;
  gradient?: string;
  children?: JSX.Element;
  class?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
}

export default function Button(props: ButtonProps) {
  return (
    <button
      class="grid h-6.5cqh items-center overflow-hidden rounded-lg transition-all ease-in-out active:scale-95"
      classList={{
        [props.class || ""]: true,
        "scale-95": props.active,
      }}
      type="button"
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
    >
      <div class="z-2 col-start-1 row-start-1 text-center font-bold text-xl">{props.children}</div>
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
