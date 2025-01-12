import { ReactiveMap } from "@solid-primitives/map";
import { type Accessor, type JSX, createContext, createEffect, createMemo, createSignal, on, useContext } from "solid-js";
import { commands } from "~/bindings";
import type { Phrase } from "~/lib/ultrastar/phrase";
import { type Microphone, settingsStore } from "~/stores/settings";
import { msToBeatWithoutGap } from "../ultrastar/bpm";
import type { Note } from "../ultrastar/note";
import { useGame } from "./game";
import { PitchProcessor } from "./pitch";

interface CreatePlayerOptions {
  index: number;
} 

interface PlayerContextValue {
  index: Accessor<number>;
  phraseIndex: Accessor<number>;
  phrase: Accessor<Phrase | undefined>;
  nextPhrase: Accessor<Phrase | undefined>;
  microphone: Accessor<Microphone>;
  delayedBeat: Accessor<number>;
  processedBeats: ReactiveMap<number, { note: Note; midiNote: number }>;
}

const PlayerContext = createContext<PlayerContextValue>();

export function createPlayer(options: Accessor<CreatePlayerOptions>) {
  const pitchProcessor = new PitchProcessor();
  const game = useGame();

  const voice = createMemo(() => {
    return game.song()?.voices[0];
  });

  const [phraseIndex, setPhraseIndex] = createSignal(0);
  const phrase = createMemo(() => {
    return voice()?.phrases[phraseIndex()];
  });
  const nextPhrase = createMemo(() => {
    return voice()?.phrases[phraseIndex() + 1];
  });

  createEffect(() => {
    const p = phrase();
    if (!p) {
      return;
    }

    if (game.beat() >= p.disappearBeat) {
      setPhraseIndex((i) => i + 1);
    }
  });

  const microphone = createMemo(() => {
    const mic = settingsStore.microphones()[options().index];
    if (!mic) {
      throw new Error("Microphone not found");
    }
    return mic;
  });

  const delayedBeat = createMemo(() => {
    const song = game.song();
    if (!song) {
      return 0;
    }
    const delayInBeats = msToBeatWithoutGap(song, microphone().delay);

    return game.beat() - delayInBeats;
  });

  const beats = createMemo(() => {
    const beatMap = new Map<number, Note>();
    for (const phrase of voice()?.phrases || []) {
      for (const note of phrase.notes) {
        for (let i = 0; i < note.length; i++) {
          beatMap.set(note.startBeat + i, note);
        }
      }
    }

    return beatMap;
  });

  const processedBeats = new ReactiveMap<number, { note: Note; midiNote: number }>();

  const delayedFlooredBeat = createMemo(() => {
    return Math.floor(delayedBeat());
  });

  createEffect(async () => {
    const flooredBeat = delayedFlooredBeat();

    const note = beats().get(flooredBeat);

    if (!note) {
      return;
    }

    const result = await commands.getPitch(options().index);

    if (result.status === "error") {
      return;
    }

    const midiNote = pitchProcessor.process(result.data, note);

    if (midiNote <= 0) {
      return;
    }

    processedBeats.set(flooredBeat, { note, midiNote });
  });

  const values = {
    index: () => options().index,
    phraseIndex,
    phrase,
    nextPhrase,
    microphone,
    delayedBeat,
    processedBeats,
  };

  const PlayerProvider = (props: { children: JSX.Element }) => (
    <PlayerContext.Provider value={values}>{props.children}</PlayerContext.Provider>
  );

  return {
    ...values,
    PlayerProvider,
  };
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }

  return context;
}
