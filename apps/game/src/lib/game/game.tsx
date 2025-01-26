import createRAF from "@solid-primitives/raf";
import { type Accessor, type JSX, batch, createContext, createEffect, createSignal, useContext } from "solid-js";
import { commands } from "~/bindings";
import type { SongPlayerRef } from "~/components/song-player";
import { beatToMsWithoutGap, msToBeat } from "~/lib/ultrastar/bpm";
import type { LocalSong } from "~/lib/ultrastar/parser/local";
import { settingsStore } from "~/stores/settings";

export interface CreateGameOptions {
  songPlayerRef?: SongPlayerRef;
  song?: LocalSong;
}

export interface GameContextValue {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  started: Accessor<boolean>;
  playing: Accessor<boolean>;
  ms: Accessor<number>;
  beat: Accessor<number>;
  song: Accessor<LocalSong | undefined>;
}

const GameContext = createContext<GameContextValue>();

export function createGame(options: Accessor<CreateGameOptions>) {
  const [ms, setMs] = createSignal(0);
  const [beat, setBeat] = createSignal(0);
  const [started, setStarted] = createSignal(false);
  const [playing, setPlaying] = createSignal(false);

  const start = async () => {
    const opts = options();

    if (!opts.song) {
      throw new Error("No song provided");
    }

    const samplesPerBeat = Math.floor((48000 * beatToMsWithoutGap(opts.song, 1)) / 1000);
    await commands.startRecording(settingsStore.microphones(), samplesPerBeat);

    setStarted(true);
    setPlaying(true);

    return true;
  };

  const stop = async () => {
    await commands.stopRecording();
  };

  const pause = () => {
    setPlaying(false);
  };

  const resume = () => {
    setPlaying(true);
  };

  const [_, startLoop, stopLoop] = createRAF(() => {
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

  createEffect(() => {
    if (!started()) {
      return;
    }

    if (playing()) {
      startLoop();
    } else {
      stopLoop();
    }
  });

  const values = {
    start,
    stop,
    pause,
    resume,
    started,
    playing,
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
