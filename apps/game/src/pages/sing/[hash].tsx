import { useNavigate, useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
import { type Accessor, For, type JSX, Match, Switch, createMemo, createSignal } from "solid-js";
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

const localUsers: LocalUser[] = [
  {
    id: "guest",
    username: "Guest",
    picture: null,
    type: "local",
  },
];

export default function PlayerSelect() {
  const { hash } = useParams<{ hash: string }>();

  const song = () => songsStore.songs().find((song) => song.hash === hash);
  const voiceCount = () => song()?.voices.length || 0;

  const [pressed, setPressed] = createSignal(false);
  const navigate = useNavigate();
  const onBack = () => navigate("/sing");
  const roundStore = useRoundStore();
  const lobbyQuery = createQuery(() => lobbyQueryOptions());
  const [playerCount, setPlayerCount] = createSignal(settingsStore.microphones().length);
  const [selectedPlayers, setSelectedPlayers] = createSignal<(number | string)[]>(
    Array(settingsStore.microphones().length).fill(localUsers[0]?.id || -1)
  );
  const [selectedVoices, setSelectedVoices] = createSignal<number[]>(
    Array(settingsStore.microphones().length)
      .fill(0)
      .map((_, i) => i % voiceCount())
  );

  const users = () => [...(lobbyQuery.data?.users || []), ...localUsers];

  const startGame = () => {
    const players = selectedPlayers()
      .slice(0, playerCount())
      .map((player) => users().find((user) => user.id === player) || undefined);

    const voices = selectedVoices()
      .slice(0, playerCount())
      .map((voice) => voice % voiceCount());

    const s = song();
    if (!s) {
      return;
    }

    roundStore.startRound({ song: s, players, voices });
  };

  const setPlayer = (playerNumber: number, value: number | string) => {
    setSelectedPlayers((prev) => [...prev.slice(0, playerNumber), value, ...prev.slice(playerNumber + 1)]);
  };

  const setVoice = (playerNumber: number, value: number) => {
    setSelectedVoices((prev) => [...prev.slice(0, playerNumber), value, ...prev.slice(playerNumber + 1)]);
  };

  const inputs: Accessor<Input[]> = createMemo(() => {
    const inputs: Input[] = [
      {
        type: "select-number",
        label: "Players",
        value: playerCount,
        onChange: setPlayerCount,
        options: Array.from({ length: settingsStore.microphones().length }, (_, i) => i + 1),
      },
    ];

    for (const playerIndex of Array.from({ length: playerCount() }, (_, i) => i)) {
      inputs.push({
        type: "select-string-number",
        label: `Player ${playerIndex + 1}`,
        value: () => selectedPlayers()[playerIndex] || null,
        onChange: (value) => setPlayer(playerIndex, value),
        options: users().map((user) => user.id),
        renderValue: (value) => {
          const player = users().find((user) => user.id === value) || { username: "?" };
          return (
            <div class="flex items-center gap-4">
              <Avatar user={player} />
              <span>{player.username}</span>
            </div>
          );
        },
      });

      if (voiceCount() > 1) {
        inputs.push({
          type: "select-number",
          label: `Voice ${playerIndex + 1}`,
          value: () => selectedVoices()[playerIndex] || 0,
          options: Array.from({ length: voiceCount() }, (_, i) => i),
          onChange: (value) => setVoice(playerIndex, value),
          renderValue: (value) => {
            const s = song();
            if (!s || value === null) {
              return value;
            }
            const duetSingerKey = `duetSingerP${value + 1}` as "duetSingerP1" | "duetSingerP2";
            if (duetSingerKey in s) {
              const duetSinger = s[duetSingerKey];
              return <span>{duetSinger}</span>;
            }

            return <span>{value}</span>;
          },
        });
      }
    }

    inputs.push({
      type: "button",
      label: "Start",
      action: startGame,
    });

    return inputs;
  });

  const { position, increment, decrement, set } = createLoop(() => inputs().length);

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
        setPressed(true);
      }
    },
    onKeyup(event) {
      if (event.action === "confirm") {
        setPressed(false);

        const currentInput = inputs()[position()];
        if (currentInput?.type === "button") {
          currentInput.action();
        }
      }
    },
  }));

  return (
    <Layout
      intent="secondary"
      header={<TitleBar title="Players" onBack={onBack} />}
      footer={<KeyHints hints={["back", "navigate", "confirm"]} />}
    >
      <div class="flex w-full flex-grow flex-col justify-center">
        <For each={inputs()}>
          {(button, index) => (
            <Switch>
              <Match when={button.type === "select-string-number" && button}>
                {(button) => (
                  <Select
                    selected={position() === index()}
                    gradient="gradient-settings"
                    label={button().label}
                    value={button().value()}
                    options={button().options}
                    onChange={button().onChange}
                    renderValue={button().renderValue}
                    onMouseEnter={() => set(index())}
                  />
                )}
              </Match>
              <Match when={button.type === "select-number" && button}>
                {(button) => (
                  <Select
                    selected={position() === index()}
                    gradient="gradient-settings"
                    label={button().label}
                    value={button().value()}
                    options={button().options}
                    onChange={button().onChange}
                    renderValue={button().renderValue}
                    onMouseEnter={() => set(index())}
                  />
                )}
              </Match>
              <Match when={button.type === "button" && button}>
                {(button) => (
                  <Button
                    selected={position() === index()}
                    active={pressed() && position() === index()}
                    gradient="gradient-settings"
                    onClick={button().action}
                    onMouseEnter={() => set(index())}
                  >
                    {button().label}
                  </Button>
                )}
              </Match>
            </Switch>
          )}
        </For>
      </div>
    </Layout>
  );
}

type Input =
  | {
      type: "select-number";
      label: string;
      value: Accessor<number | null>;
      onChange: (value: number) => void;
      options: number[];
      renderValue?: (value: number | null) => JSX.Element;
    }
  | {
      type: "select-string-number";
      label: string;
      value: Accessor<string | number | null>;
      onChange: (value: string | number) => void;
      options: (string | number)[];
      renderValue?: (value: string | number | null) => JSX.Element;
    }
  | {
      type: "button";
      label: string;
      action: () => void;
    };
