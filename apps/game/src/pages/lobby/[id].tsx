import { Navigate, useNavigate, useParams } from "@solidjs/router";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Match, Switch } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import Menu, { type MenuItem } from "~/components/menu";
import TitleBar from "~/components/title-bar";
import { v1 } from "~/lib/api";
import { lobbyQueryOptions } from "~/lib/queries";

export default function LobbyUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const onBack = () => navigate("/lobby");
  const queryClient = useQueryClient();

  const lobbyQuery = createQuery(() => lobbyQueryOptions());
  const user = () => lobbyQuery.data?.users.find((user) => user.id === Number.parseInt(id));

  const kickUserMutation = createMutation(() => ({
    mutationFn: async () => {
      const u = user();

      if (!u) {
        return;
      }
      await v1.lobbies.current.kick[":userId"].post({
        params: { userId: u.id.toString() },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(lobbyQueryOptions());
      navigate("/lobby");
    },
  }));

  const menuItems: MenuItem[] = [
    {
      type: "button",
      label: "Kick",
      action: () => kickUserMutation.mutate(),
    },
  ];

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Lobby" description={user()?.username || "?"} onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <Switch>
        <Match when={user()}>
          <Menu items={menuItems} onBack={onBack} gradient="gradient-lobby" />
        </Match>
        <Match when={!lobbyQuery.isPending && !user()}>
          <Navigate href="/lobby" />
        </Match>
      </Switch>
    </Layout>
  );
}
