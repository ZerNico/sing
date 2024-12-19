import { query, redirect } from "@solidjs/router";
import type { JSX } from "solid-js";
import Header from "~/components/header";
import { getMe, requireNoAuth } from "~/lib/auth";

const checkNoAuth = query(async () => {
  const response = await getMe();

  if (response.ok) {
    if (!response.data.username) {
      throw redirect("/complete-profile");
    }

    throw redirect("/");
  }

  if (response.status === 403) {
    if (response.data.code === "EMAIL_NOT_VERIFIED") {
      throw redirect("/verify-email");
    }
  }
}, "check-no-auth");

export const route = {
  preload: checkNoAuth,
};

interface NoAuthLayoutProps {
  children: JSX.Element;
}

export default function NoAuthLayout(props: NoAuthLayoutProps) {
  return (
    <>
      <Header />
      <main class="flex flex-grow flex-col">{props.children}</main>
    </>
  );
}
