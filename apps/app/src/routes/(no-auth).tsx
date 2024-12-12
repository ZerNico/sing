import { query, redirect } from "@solidjs/router";
import type { JSX } from "solid-js";
import Header from "~/components/header";
import { requireNoAuth } from "~/lib/auth";

export const route = {
  preload: requireNoAuth,
};

interface NoAuthLayoutProps {
  children: JSX.Element;
}

export default function NoAuthLayout(props: NoAuthLayoutProps) {
  return (
    <>
      <Header />
      <main class="mx-auto max-w-6xl px-4">{props.children}</main>
    </>
  );
}
