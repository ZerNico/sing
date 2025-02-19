import { Navigate, useLocation, useNavigate } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { type JSX, Match, Switch, createRenderEffect, on } from "solid-js";
import { withQuery } from "ufo";
import { profileQueryOptions } from "~/lib/queries";

// Common type for all layout components
type LayoutProps = {
  children?: JSX.Element;
  mode?: "default" | "requireLobby" | "requireNoLobby";
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
                const user = profile();

                if (!user) {
                  return;
                }

                if (!user.emailVerified) {
                  if (!pathname.startsWith("/verify-email")) {
                    navigate(redirectTo("/verify-email"));
                  }
                  return;
                }

                if (!user.username) {
                  if (!pathname.startsWith("/complete-profile")) {
                    navigate(redirectTo("/complete-profile"));
                  }
                  return;
                }

                if (props.mode === "requireLobby" && !user.lobbyId) {
                  navigate("/join");
                }

                if (props.mode === "requireNoLobby" && user.lobbyId) {
                  navigate("/");
                }
              }
            )
          );

          return (
            <>
              {props.children}
            </>
          );
        }}
      </Match>
    </Switch>
  );
}
