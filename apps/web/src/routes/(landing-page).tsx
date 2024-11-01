import type { JSX } from "solid-js";
import Header from "~/components/header";

interface AppLayoutProps {
  children: JSX.Element;
}

export default function AppLayout(props: AppLayoutProps) {
  return (
    <>
      <div class="min-h-screen bg-#101024 text-white">
        <Header />
        <main class="mx-auto max-w-5xl px-4">{props.children}</main>
      </div>
    </>
  );
}
