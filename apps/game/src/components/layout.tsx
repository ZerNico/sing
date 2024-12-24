import type { JSX } from "solid-js";

interface LayoutProps {
  children?: JSX.Element;
  intent?: "primary" | "secondary";
  header?: JSX.Element;
  footer?: JSX.Element;
}

export default function Layout(props: LayoutProps) {
  const backgroundClass = () => (props.intent === "secondary" ? "bg-secondary" : "bg-primary");

  return (
    <div>
      <div
        class="flex h-screen w-screen items-center justify-center"
        classList={{
          [backgroundClass()]: true,
        }}
      >
        <div class="layout flex">
          <div class="@container flex flex-grow">
            <div class="grid flex-grow grid-rows-[min-content_1fr_min-content] p-4cqw">
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
