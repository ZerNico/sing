import type { JSX } from "solid-js";

interface LayoutProps {
  children?: JSX.Element;
  intent?: "primary" | "secondary";
  header?: JSX.Element;
  footer?: JSX.Element;
  background?: JSX.Element;
}

export default function Layout(props: LayoutProps) {
  const backgroundClass = () => (props.intent === "secondary" ? "gradient-bg-secondary" : "gradient-bg-primary");

  return (
    <div>
      <div
        class="flex h-screen w-screen items-center justify-center"
        classList={{
          [backgroundClass()]: true,
        }}
      >
        <div class="layout flex">
          <div class="@container relative flex flex-grow overflow-hidden">
            <div class="absolute inset-0 h-full w-full">{props.background}</div>
            <div class="relative z-1 grid flex-grow grid-rows-[min-content_1fr_min-content] gap-6 p-16">
              <div>{props.header}</div>
              <div class="flex flex-col">{props.children}</div>
              <div>{props.footer}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
