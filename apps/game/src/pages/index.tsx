import { useNavigate } from "@solidjs/router";
import { createMutation, useQueryClient } from "@tanstack/solid-query";
import { Match, Switch, onMount } from "solid-js";
import { withQuery } from "ufo";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import Menu, { type MenuItem } from "~/components/menu";
import { v1 } from "~/lib/api";
import { lobbyQueryOptions } from "~/lib/queries";
import { lobbyStore } from "~/stores/lobby";
import IconLoaderCircle from "~icons/lucide/loader-circle";

export default function Index() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createLobbyMutation = createMutation(() => ({
    mutationKey: ["createLobby"],
    mutationFn: async () => {
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

  onMount(async () => {
    if (lobbyStore.lobby()) {
      try {
        await queryClient.fetchQuery(lobbyQueryOptions());
        goToLoading();
      } catch (error) {
        lobbyStore.clearLobby();
        createLobbyMutation.mutate();
      }
    } else {
      createLobbyMutation.mutate();
    }
  });

  const menuItems: MenuItem[] = [
    {
      type: "button",
      label: "Retry",
      action: () => createLobbyMutation.mutate(),
    },
    {
      type: "button",
      label: "Play Offline",
      action: goToLoading,
    },
  ];

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
            <Menu items={menuItems} gradient="gradient-settings" class="h-min grow-0" />
          </div>
        </Match>
      </Switch>
    </Layout>
  );
}
