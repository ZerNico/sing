import { useNavigate } from "@solidjs/router";
import { createMutation } from "@tanstack/solid-query";
import { For, Match, Switch, createSignal, onMount } from "solid-js";
import { withQuery } from "ufo";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import Button from "~/components/ui/button";
import { createLoop } from "~/hooks/loop";
import { useNavigation } from "~/hooks/navigation";
import { v1 } from "~/lib/api";
import { useLobbyStore } from "~/stores/lobby";
import IconLoaderCircle from "~icons/lucide/loader-circle";

export default function Index() {
  const navigate = useNavigate();
  const lobbyStore = useLobbyStore();

  const createLobbyMutation = createMutation(() => ({
    mutationKey: ["createLobby"],
    mutationFn: async () => {
      await sleep(1000);

      const response = await v1.lobbies.post();

      if (response.ok) {
        return response.data;
      }

      throw new Error("Failed to create lobby");
    },
    onSuccess: (data) => {
      lobbyStore.setLobby({ token: data.token, lobby: { id: data.lobby.id } });
      goToLoading();
    },
  }));

  const goToLoading = () => navigate(withQuery("/loading", { redirect: "/home" }));

  onMount(() => {
    createLobbyMutation.mutate();
  });

  const [pressed, setPressed] = createSignal(false);

  const onBack = () => navigate("/home");
  const buttons = [
    {
      label: "Retry",
      action: () => createLobbyMutation.mutate(),
    },
    {
      label: "Play Offline",
      action: goToLoading,
    },
  ];

  const { position, increment, decrement, set } = createLoop(buttons.length);

  useNavigation(() => ({
    layer: 0,
    onKeydown(event) {
      if (event.action === "back") {
        onBack();
      } else if (event.action === "up") {
        decrement();
      } else if (event.action === "down") {
        increment();
      } else if (event.action === "confirm") {
        setPressed(true);
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        setPressed(false);
        buttons[position()]?.action();
      }
    },
  }));

  return (
    <Layout intent="primary" footer={<KeyHints hints={["navigate", "confirm"]} />}>
      <Switch>
        <Match when={createLobbyMutation.isPending}>
          <div class="flex flex-grow items-center justify-center">
            <IconLoaderCircle class="animate-spin text-6xl" />
          </div>
        </Match>
        <Match when={createLobbyMutation.isError}>
          <div class="flex w-full flex-grow flex-col justify-center">
            <h1 class="mb-[10cqh] text-center font-bold text-4xl">Failed to create lobby</h1>
            <For each={buttons}>
              {(button, index) => (
                <Button
                  gradient="gradient-settings"
                  selected={position() === index()}
                  active={pressed() && position() === index()}
                  onClick={button.action}
                  onMouseEnter={() => set(index())}
                >
                  {button.label}
                </Button>
              )}
            </For>
          </div>
        </Match>
      </Switch>
    </Layout>
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
