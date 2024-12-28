import createRAF from "@solid-primitives/raf";
import { type Accessor, type JSX, batch, createContext, createSignal, useContext } from "solid-js";
import type { SongPlayerRef } from "~/components/song-player";
import { msToBeat } from "~/lib/ultrastar/bpm";
import type { LocalSong } from "~/lib/ultrastar/parser/local";

export interface CreateGameOptions {
  songPlayerRef?: SongPlayerRef;
  song?: LocalSong;
}

export interface GameContextValue {
  play: () => void;
  pause: () => void;
  playing: Accessor<boolean>;
  ms: Accessor<number>;
  beat: Accessor<number>;
  song: Accessor<LocalSong | undefined>;
}

const GameContext = createContext<GameContextValue>();

export function createGame(options: Accessor<CreateGameOptions>) {
  const [ms, setMs] = createSignal(0);
  const [beat, setBeat] = createSignal(0);

  const play = () => {
    const opts = options();
    if (!opts.songPlayerRef) {
      return;
    }

    opts.songPlayerRef.play();
    start();
  };
  const pause = () => {
    const opts = options();
    if (!opts.songPlayerRef) {
      return;
    }

    opts.songPlayerRef.pause();
    stop();
  };

  const [playing, start, stop] = createRAF(() => {
    const opts = options();
    if (!opts.songPlayerRef || !opts.song) {
      return;
    }

    const ms = opts.songPlayerRef?.getCurrentTime() * 1000;
    const beat = msToBeat(opts.song, ms);

    batch(() => {
      setMs(ms);
      setBeat(beat);
    });
  });

  const Provider = (props: { children: JSX.Element }) => (
    <GameContext.Provider value={{ play, pause, playing, ms, beat, song: () => options().song }}>{props.children}</GameContext.Provider>
  );

  return {
    play,
    pause,
    playing,
    ms,
    beat,
    song: () => options().song,
    GameProvider: Provider,
  };
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
}
