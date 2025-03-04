import { Navigate, useNavigate, useParams } from "@solidjs/router";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { Match, Switch, createSignal } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Button from "~/components/ui/button";
import { useNavigation } from "~/hooks/navigation";
import { v1 } from "~/lib/api";
import { lobbyQueryOptions } from "~/lib/queries";

export default function LobbyUserPage() {
  const { id } = useParams<{ id: string }>();
  const [pressed, setPressed] = createSignal(false);
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

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "back") {
        onBack();
      } else if (event.action === "confirm") {
        setPressed(true);
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        setPressed(false);
        kickUserMutation.mutate();
      }
    },
  }));

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Lobby" description={user()?.username || "?"} onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <Switch>
        <Match when={user()}>
          <div class="flex w-full flex-grow flex-col justify-center">
            <Button
              selected
              gradient="gradient-lobby"
              onClick={() => kickUserMutation.mutate()}
              loading={kickUserMutation.isPending}
              active={pressed()}
            >
              Kick
            </Button>
          </div>
        </Match>
        <Match when={!lobbyQuery.isPending && !user()}>
          <Navigate href="/lobby" />
        </Match>
      </Switch>
    </Layout>
  );
}
