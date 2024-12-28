import type { JSX } from "solid-js";

interface LayoutProps {
  children?: JSX.Element;
}

export default function GameLayout(props: LayoutProps) {
  return (
    <div>
      <div
        class="flex h-screen w-screen items-center justify-center bg-secondary"
      >
        <div class="layout flex">
          <div class="@container relative flex flex-grow">
            <div class="relative z-1 grid flex-grow grid-rows-[1fr]">
              <div class="flex flex-col">{props.children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
