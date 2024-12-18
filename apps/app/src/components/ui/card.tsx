import type { JSX } from "solid-js";

interface CardProps {
  children: JSX.Element;
  class?: string;
}

export default function Card(props: CardProps) {
  return (
    <div
      class="rounded-lg bg-white p-8 text-slate-800 shadow-md"
      classList={{
        [props.class || ""]: true,
      }}
    >
      {props.children}
    </div>
  );
}
