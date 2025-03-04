import { useNavigate } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For, createSignal } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Avatar from "~/components/ui/avatar";
import Button from "~/components/ui/button";
import { createLoop } from "~/hooks/loop";
import { useNavigation } from "~/hooks/navigation";
import { lobbyQueryOptions } from "~/lib/queries";

export default function LobbyPage() {
  const [pressed, setPressed] = createSignal(false);

  const navigate = useNavigate();
  const onBack = () => navigate("/home");

  const lobbyQuery = createQuery(() => lobbyQueryOptions());

  const { position, increment, decrement, set } = createLoop(() => lobbyQuery.data?.users.length ?? 0);

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "up") {
        decrement();
      } else if (event.action === "down") {
        increment();
      } else if (event.action === "confirm") {
        setPressed(true);
      } else if (event.action === "back") {
        onBack();
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        setPressed(false);
        const user = lobbyQuery.data?.users[position()];
        if (user) {
          navigate(`/lobby/${user.id}`);
        }
      }
    },
  }));

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Lobby" onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <div class="flex w-full flex-grow flex-col justify-center">
        <For each={lobbyQuery.data?.users}>
          {(user, index) => (
            <Button
              gradient="gradient-lobby"
              selected={position() === index()}
              active={pressed() && position() === index()}
              onClick={() => navigate(`/lobby/${user.id}`)}
              onMouseEnter={() => set(index())}
            >
              <Avatar user={user} />
              <span>{user.username}</span>
            </Button>
          )}
        </For>
      </div>
    </Layout>
  );
}
