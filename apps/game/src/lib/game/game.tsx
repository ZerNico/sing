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
  start: () => boolean;
  playing: Accessor<boolean>;
  ms: Accessor<number>;
  beat: Accessor<number>;
  song: Accessor<LocalSong | undefined>;
  started: Accessor<boolean>;
}

const GameContext = createContext<GameContextValue>();

export function createGame(options: Accessor<CreateGameOptions>) {
  const [ms, setMs] = createSignal(0);
  const [beat, setBeat] = createSignal(0);
  const [started, setStarted] = createSignal(false);

  const start = () => {
    const opts = options();

    if (!opts.songPlayerRef?.ready()) {
      return false;
    }

    opts.songPlayerRef.play();
    setStarted(true);
    startLoop();

    return true;
  };

  const play = () => {
    if (!started()) {
      return;
    }

    const opts = options();
    if (!opts.songPlayerRef) {
      return;
    }

    opts.songPlayerRef.play();
    startLoop();
  };
  const pause = () => {
    if (!started()) {
      return;
    }

    const opts = options();
    if (!opts.songPlayerRef) {
      return;
    }

    opts.songPlayerRef.pause();
    stopLoop();
  };

  const [playing, startLoop, stopLoop] = createRAF(() => {
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

  const values = {
    play,
    pause,
    start,
    playing,
    started,
    ms,
    beat,
    song: () => options().song,
  };

  const Provider = (props: { children: JSX.Element }) => <GameContext.Provider value={values}>{props.children}</GameContext.Provider>;

  return {
    GameProvider: Provider,
    ...values,
  };
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }

  return context;
}
