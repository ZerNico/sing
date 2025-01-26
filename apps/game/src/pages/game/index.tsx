import { Show, createSignal, onCleanup, onMount } from "solid-js";
import GameLayout from "~/components/game/game-layout";
import Half from "~/components/game/half";
import Menu from "~/components/game/menu";
import SongPlayer, { type SongPlayerRef } from "~/components/song-player";
import { useNavigation } from "~/hooks/navigation";
import { createGame } from "~/lib/game/game";
import { useRoundStore } from "~/stores/round";

export default function Game() {
  const roundStore = useRoundStore();
  const [songPlayerRef, setSongPlayerRef] = createSignal<SongPlayerRef>();

  const isPaused = () => !playing() && started();

  const { GameProvider, play, pause, playing, start, started, stop } = createGame(() => ({
    songPlayerRef: songPlayerRef(),
    song: roundStore.settings()?.song,
  }));

  useNavigation(() => ({
    layer: 0,
    onKeydown: (event) => {
      if (event.action === "back" && started()) {
        pause();
      }
    },
  }));

  const waitForStart = async () => {
    const started = await start();
    if (!started) {
      setTimeout(waitForStart, 500);
    }
  };

  onMount(() => {
    setTimeout(() => {
      waitForStart();
    }, 3000);
  });

  onCleanup(async () => {
    await stop();
  });

  return (
    <GameLayout>
      <GameProvider>
        <div class="relative h-full w-full">
          <div
            class="relative z-1 h-full w-full"
            classList={{
              "pointer-events-none opacity-0": isPaused(),
            }}
          >
            <div class="absolute inset-0">
              <Show when={roundStore.settings()}>
                {(settings) => <SongPlayer playerRef={setSongPlayerRef} class="h-full w-full" song={settings().song} />}
              </Show>
            </div>
            <div class="relative z-1 grid h-full flex-grow grid-rows-[1fr_1fr]">
              <Half index={0} />
              <Half index={1} />
            </div>
          </div>

          <Show when={isPaused()}>
            <Menu class="absolute inset-0" onClose={play} />
          </Show>

          <div
            class="absolute inset-0 z-2 bg-black transition-opacity duration-1000"
            classList={{
              "pointer-events-none opacity-0": started(),
            }}
          >
            <img
              class="absolute inset-0 block h-full w-full scale-110 transform object-cover opacity-60 blur-xl"
              src={roundStore.settings()?.song.coverUrl || roundStore.settings()?.song.backgroundUrl}
              alt=""
            />
            <div class="relative flex h-full w-full flex-col items-center justify-center gap-2">
              <p class="text-3xl">{roundStore.settings()?.song.artist}</p>
              <div class="max-w-200">
                <span class="gradient-sing bg-gradient-to-b bg-clip-text font-bold text-7xl text-transparent ">
                  {roundStore.settings()?.song.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GameProvider>
    </GameLayout>
  );
}
