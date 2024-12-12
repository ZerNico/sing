import type { JSX } from "solid-js";
import Header from "~/components/header";
import { requireAuth } from "~/lib/auth";

export const route = {
  preload: requireAuth,
};

interface AuthLayoutProps {
  children: JSX.Element;
}

export default function AuthLayout(props: AuthLayoutProps) {
  return (
    <>
      <Header />
      <main class="mx-auto max-w-6xl px-4">{props.children}</main>
    </>
  );
}
