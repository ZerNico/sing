import { Navigate, useLocation, useNavigate } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { type JSX, Match, Switch, createRenderEffect, on } from "solid-js";
import { withQuery } from "ufo";
import { profileQueryOptions } from "~/lib/queries";

// Common type for all layout components
type LayoutProps = {
  children?: JSX.Element;
  mode?: 'default' | 'requireLobby' | 'requireNoLobby';
};

function useProfileQuery() {
  return createQuery(() => profileQueryOptions());
}

export default function AuthGuard(props: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const profileQuery = useProfileQuery();
  const profile = () => profileQuery.data;

  const redirectTo = (path: string) => withQuery(path, { redirect: location.pathname });

  return (
    <Switch>
      <Match when={!profile() && !profileQuery.isPending}>
        <Navigate href={redirectTo("/sign-in")} />
      </Match>

      <Match when={profile()}>
        {(profile) => {
          createRenderEffect(
            on(
              () => location.pathname,
              (pathname) => {
                console.log("pathname", pathname);
                

                if (!profile()?.emailVerified) {
                  if (!pathname.startsWith("/verify-email")) {
                    navigate(redirectTo("/verify-email"));
                  }
                  return;
                }

                if (!profile()?.username) {
                  if (!pathname.startsWith("/complete-profile")) {
                    navigate(redirectTo("/complete-profile"));
                  }
                  return;
                }

                if (props.mode === 'requireLobby' && !profile()?.lobbyId) {
                  navigate("/join");
                } else if (props.mode === 'requireNoLobby' && profile()?.lobbyId) {
                  navigate("/");
                }
              }
            )
          );

          return <>{props.children}</>;
        }}
      </Match>
    </Switch>
  );
}
