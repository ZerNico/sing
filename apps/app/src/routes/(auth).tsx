import { query, redirect } from "@solidjs/router";
import type { JSX } from "solid-js";
import Header from "~/components/header";
import { getMe } from "~/lib/auth";

const checkAuth = query(async () => {
  const response = await getMe();

  if (response.ok) {
    if (!response.data.username) {
      throw redirect("/complete-profile");
    }

    return;
  }

  if (response.status === 403) {
    if (response.data.code === "EMAIL_NOT_VERIFIED") {
      throw redirect("/verify-email");
    }
  }

  throw redirect("/sign-in");
}, "check-auth");

export const route = {
  preload: checkAuth,
};

interface AuthLayoutProps {
  children: JSX.Element;
}

export default function AuthLayout(props: AuthLayoutProps) {
  return (
    <>
      <Header />
      <main class="flex flex-grow flex-col">{props.children}</main>
    </>
  );
}
