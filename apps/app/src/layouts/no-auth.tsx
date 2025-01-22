import { Navigate } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { type JSX, Match, Switch } from "solid-js";
import { profileQueryOptions } from "~/lib/queries";

interface NoAuthLayoutProps {
  children?: JSX.Element;
}

export default function NoAuthLayout(props: NoAuthLayoutProps) {
  const profileQuery = createQuery(() => profileQueryOptions());

  return (
    <Switch>
      <Match when={profileQuery.data}>
        <Navigate href={"/"} />
      </Match>
      <Match when={!profileQuery.data}>{props.children}</Match>
    </Switch>
  );
}
