import type { JSX } from "solid-js";

interface ButtonProps {
  children?: JSX.Element;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  class?: string;
}

export function Button(props: ButtonProps) {
  return (
    <button
      type={props.type || "button"}
      onClick={props.onClick}
      class={`relative inline-flex h-10 items-center rounded-md bg-gray-800 px-3 py-2 text-sm text-white ${props.class || ""}`}
      disabled={props.disabled || props.loading}
    >
      <span classList={{ invisible: props.loading }}>{props.children}</span>
      {props.loading && (
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="i-lucide-loader-circle animate-spin text-white" />
        </div>
      )}
    </button>
  );
}
