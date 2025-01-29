import { Navigate, useLocation } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { type JSX, Match, Show, Switch } from "solid-js";
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
        <AuthRedirects>
          <Header />
          {props.children}
          <Footer />
        </AuthRedirects>
      </Match>
    </Switch>
  );
}

interface LobbyLayoutProps {
  children?: JSX.Element;
}

export function LobbyLayout(props: LobbyLayoutProps) {
  const profileQuery = createQuery(() => profileQueryOptions());

  return (
    <Show when={profileQuery.data && !profileQuery.data.lobbyId} fallback={props.children}>
      <Navigate href="/join" />
    </Show>
  );
}

interface NoLobbyLayoutProps {
  children?: JSX.Element;
}

export function NoLobbyLayout(props: NoLobbyLayoutProps) {
  const profileQuery = createQuery(() => profileQueryOptions());

  return (
    <Show when={profileQuery.data && !!profileQuery.data.lobbyId} fallback={props.children}>
      <Navigate href="/" />
    </Show>
  );
}

interface AuthRedirectsProps {
  children?: JSX.Element;
}

function AuthRedirects(props: AuthRedirectsProps) {
  const location = useLocation();
  const profileQuery = createQuery(() => profileQueryOptions());
  const profile = () => profileQuery.data;

  const redirectTo = (path: string) => withQuery(path, { redirect: location.pathname });

  return (
    <Switch>
      <Match when={!profile()?.emailVerified}>
        <Show when={location.pathname !== "/verify-email"} fallback={props.children}>
          <Navigate href={redirectTo("/verify-email")} />
        </Show>
      </Match>

      <Match when={!profile()?.username}>
        <Show when={location.pathname !== "/complete-profile"} fallback={props.children}>
          <Navigate href={redirectTo("/complete-profile")} />
        </Show>
      </Match>

      <Match when>{props.children}</Match>
    </Switch>
  );
}
