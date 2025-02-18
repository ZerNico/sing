import { Navigate, useLocation, useNavigate, useSearchParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { type JSX, Match, Show, Switch, createEffect } from "solid-js";
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
  const navigate = useNavigate();
  const profileQuery = createQuery(() => profileQueryOptions());
  const [searchParams] = useSearchParams<{ redirect?: string }>();
  const profile = () => profileQuery.data;

  const redirectTo = (path: string) => withQuery(path, { 
    redirect: searchParams.redirect || location.pathname 
  });

  const handleRedirects = (path: string) => {
    if (!profile()?.emailVerified) {
      if (!path.startsWith("/verify-email")) {
        navigate(redirectTo("/verify-email"));
      }

      return;
    }

    if (!profile()?.username) {
      if (!path.startsWith("/complete-profile")) {
        navigate(redirectTo("/complete-profile"));
      }

      return;
    }
  };

  createEffect(() => {
    handleRedirects(location.pathname);
  });

  handleRedirects(location.pathname);

  return <>{props.children}</>;
}
