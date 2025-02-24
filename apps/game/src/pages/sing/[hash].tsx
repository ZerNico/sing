import { useNavigate, useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { For, Show, Suspense, createSignal } from "solid-js";
import KeyHints from "~/components/key-hints";
import Layout from "~/components/layout";
import TitleBar from "~/components/title-bar";
import Avatar from "~/components/ui/avatar";
import Button from "~/components/ui/button";
import Select from "~/components/ui/select";
import { createLoop } from "~/hooks/loop";
import { useNavigation } from "~/hooks/navigation";
import { lobbyQueryOptions } from "~/lib/queries";
import type { LocalUser } from "~/lib/types";
import { useRoundStore } from "~/stores/round";
import { settingsStore } from "~/stores/settings";
import { songsStore } from "~/stores/songs";
import IconLoaderCircle from "~icons/lucide/loader-circle";

export default function PlayerSelect() {
  const [pressed, setPressed] = createSignal(false);
  const navigate = useNavigate();
  const onBack = () => navigate("/sing");

  const lobbyQuery = createQuery(() => lobbyQueryOptions());

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Settings" description={"Microphones"} onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <Suspense
        fallback={
          <div class="flex flex-grow items-center justify-center">
            <IconLoaderCircle class="animate-spin text-6xl" />
          </div>
        }
      >
        <Show when={lobbyQuery.data}>
          {(lobby) => {
            const localUsers: LocalUser[] = [
              {
                id: "guest",
                username: "Guest",
                picture: null,
                type: "local",
              },
            ];

            const roundStore = useRoundStore();
            const { hash } = useParams<{ hash: string }>();
            const [playerCount, setPlayerCount] = createSignal(settingsStore.microphones().length);
            const [selectedPlayers, setSelectedPlayers] = createSignal<(number | string)[]>(
              Array(settingsStore.microphones().length).fill(localUsers[0]?.id || -1)
            );

            const users = () => [...lobby().users, ...localUsers];

            const startGame = () => {
              const players = selectedPlayers()
                .slice(0, playerCount())
                .map((player) => users().find((user) => user.id === player) || undefined);
              const song = songsStore.songs().find((song) => song.hash === hash);

              if (!song) {
                return;
              }

              roundStore.startRound({ song, players });
            };

            const { position, increment, decrement, set } = createLoop(() => playerCount() + 2);

            useNavigation(() => ({
              layer: 0,
              onKeydown(event) {
                if (event.action === "back") {
                  onBack();
                } else if (event.action === "down") {
                  increment();
                } else if (event.action === "up") {
                  decrement();
                } else if (event.action === "confirm") {
                  if (position() === playerCount() + 1) {
                    setPressed(true);
                  }
                }
              },
              onKeyup(event) {
                if (event.action === "confirm") {
                  setPressed(false);
                  startGame();
                }
              },
            }));

            const setPlayer = (playerNumber: number, value: number | string) => {
              setSelectedPlayers((prev) => [...prev.slice(0, playerNumber), value, ...prev.slice(playerNumber + 1)]);
            };

            return (
              <div class="flex w-full flex-grow flex-col justify-center">
                <Select
                  selected={position() === 0}
                  onMouseEnter={() => set(0)}
                  gradient="gradient-sing"
                  label="Players"
                  value={playerCount()}
                  options={Array.from({ length: settingsStore.microphones().length }, (_, i) => i + 1)}
                  onChange={(value) => setPlayerCount(value)}
                />
                <For each={Array.from({ length: playerCount() }, (_, i) => i)}>
                  {(playerNumber) => (
                    <Select
                      selected={position() === playerNumber + 1}
                      onMouseEnter={() => set(playerNumber + 1)}
                      gradient="gradient-sing"
                      label={`Player ${playerNumber + 1}`}
                      value={selectedPlayers()[playerNumber] || -1}
                      options={users().map((user) => user.id)}
                      onChange={(value) => setPlayer(playerNumber, value)}
                      renderValue={(value) => {
                        const player = users().find((user) => user.id === value) || { username: "?" };
                        return (
                          <div class="flex items-center gap-4">
                            <Avatar user={player} />
                            <span>{player.username}</span>
                          </div>
                        );
                      }}
                    />
                  )}
                </For>
                <Button
                  selected={position() === playerCount() + 1}
                  active={pressed() && position() === playerCount() + 1}
                  gradient="gradient-sing"
                  onClick={startGame}
                  onMouseEnter={() => set(playerCount() + 1)}
                >
                  Start
                </Button>
              </div>
            );
          }}
        </Show>
      </Suspense>
    </Layout>
  );
}
