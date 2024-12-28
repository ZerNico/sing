import { Show, createSignal, onMount } from "solid-js";
import GameLayout from "~/components/game/game-layout";
import Half from "~/components/game/half";
import SongPlayer, { type SongPlayerRef } from "~/components/song-player";
import { createGame } from "~/lib/game/game";
import { useRoundStore } from "~/stores/round";

export default function Game() {
  const roundStore = useRoundStore();
  const [songPlayerRef, setSongPlayerRef] = createSignal<SongPlayerRef>();

  const { GameProvider, play, beat } = createGame(() => ({
    songPlayerRef: songPlayerRef(),
    song: roundStore.settings()?.song,
  }));

  onMount(() => {
    setTimeout(() => {
      play();
    }, 3000);
  });

  return (
    <GameLayout>
      <GameProvider>
        <div class="relative h-full w-full">
          <div class="absolute inset-0 inset-0">
            <Show when={roundStore.settings()}>
              {(settings) => <SongPlayer playerRef={setSongPlayerRef} class="h-full w-full" song={settings().song} />}
            </Show>
          </div>
          <div class="relative z-1 grid h-full flex-grow grid-rows-[1fr_1fr]">
            <Half index={0} />
            <Half index={1} />
          </div>
        </div>
      </GameProvider>
    </GameLayout>
  );
}
