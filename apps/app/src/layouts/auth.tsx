import { Navigate, useLocation } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { type JSX, Match, Switch } from "solid-js";
import { withQuery } from "ufo";
import Footer from "~/components/footer";
import Header from "~/components/header";
import { profileQueryOptions } from "~/lib/queries";

interface AuthLayoutProps {
  children?: JSX.Element;
}

export default function AuthLayout(props: AuthLayoutProps) {
  const location = useLocation();
  const profileQuery = createQuery(() => profileQueryOptions());
  const profile = () => profileQuery.data;

  const redirectTo = (path: string) => withQuery(path, { redirect: location.pathname });

  return (
    <Switch>
      <Match when={!profile() && !profileQuery.isPending}>
        <Navigate href={redirectTo("/sign-in")} />
      </Match>

      <Match when={profile()}>
        <Switch>
          <Match when={!profile()?.username && location.pathname !== "/complete-profile"}>
            <Navigate href={redirectTo("/complete-profile")} />
          </Match>

          <Match when={profile()?.username && !profile()?.emailVerified && location.pathname !== "/verify-email"}>
            <Navigate href={redirectTo("/verify-email")} />
          </Match>

          <Match
            when={
              profile()?.username &&
              profile()?.emailVerified &&
              !profile()?.lobbyId &&
              location.pathname !== "/join" &&
              !location.pathname.startsWith("/edit-profile")
            }
          >
            <Navigate href="/join" />
          </Match>

          <Match
            when={
              (location.pathname === "/complete-profile" && profile()?.username) ||
              (location.pathname === "/verify-email" && profile()?.emailVerified) ||
              (location.pathname === "/join" && profile()?.lobbyId)
            }
          >
            <Navigate href="/" />
          </Match>

          <Match when>
            <Header />
            {props.children}
            <Footer />
          </Match>
        </Switch>
      </Match>
    </Switch>
  );
}
