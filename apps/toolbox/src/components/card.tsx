import type { JSX } from "solid-js";

interface CardProps {
  children: JSX.Element;
  class?: string;
}

export function Card(props: CardProps) {
  return <div class={`rounded-lg border border-gray-300 bg-white p-4 shadow-sm ${props.class || ""}`}>{props.children}</div>;
}
