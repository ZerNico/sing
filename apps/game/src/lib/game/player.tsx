import { ReactiveMap } from "@solid-primitives/map";
import { type Accessor, type JSX, createEffect, createMemo, createSignal } from "solid-js";
import { commands } from "~/bindings";
import { useRoundStore } from "~/stores/round";
import { settingsStore } from "~/stores/settings";
import { msToBeatWithoutGap } from "../ultrastar/bpm";
import { type Note, getNoteScore } from "../ultrastar/note";
import { getMaxScore } from "../ultrastar/voice";
import { useGame } from "./game";
import { PitchProcessor } from "./pitch";
import { type PlayerContextValue, PlayerProvider } from "./player-context";

interface CreatePlayerOptions {
  index: number;
}

export { usePlayer } from "./player-context";

export function createPlayer(options: Accessor<CreatePlayerOptions>) {
  const pitchProcessor = new PitchProcessor();
  const game = useGame();
  const roundStore = useRoundStore();

  const voice = createMemo(() => {
    return game.song()?.voices[0];
  });

  const maxScore = createMemo(() => {
    const v = voice();
    if (!v) {
      return {
        normal: 0,
        golden: 0,
        bonus: 0,
      };
    }

    return getMaxScore(v);
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
    const beatMap = new Map<number, { note: Note; isFirstInPhrase: boolean }>();
    for (const phrase of voice()?.phrases || []) {
      for (const note of phrase.notes) {
        for (let i = 0; i < note.length; i++) {
          beatMap.set(note.startBeat + i, {
            note,
            isFirstInPhrase: note === phrase.notes[0] && i === 0,
          });
        }
      }
    }

    return beatMap;
  });

  const processedBeats = new ReactiveMap<number, { note: Note; midiNote: number; isFirstInPhrase: boolean }>();

  const delayedFlooredBeat = createMemo(() => {
    return Math.floor(delayedBeat());
  });

  let correctBeats = 0;
  let totalBeats = 0;

  createEffect(async () => {
    const flooredBeat = delayedFlooredBeat();

    const beatInfo = beats().get(flooredBeat);

    if (!beatInfo) {
      return;
    }

    if (beatInfo.isFirstInPhrase) {
      if (correctBeats / totalBeats > 0.9) {
        addScore("bonus", correctBeats);
      }

      correctBeats = 0;
      totalBeats = 0;
    }

    const noteScore = getNoteScore(beatInfo.note);

    if (noteScore === 0) {
      return;
    }

    totalBeats++;

    const result = await commands.getPitch(options().index);

    if (result.status === "error") {
      return;
    }

    const midiNote = pitchProcessor.process(result.data, beatInfo.note);

    if (midiNote === beatInfo.note.midiNote) {
      correctBeats++;

      if (beatInfo.note.type === "Golden") {
        addScore("golden", noteScore);
      } else if (beatInfo.note.type === "Normal") {
        addScore("normal", noteScore);
      }
    }

    if (midiNote <= 0) {
      return;
    }

    processedBeats.set(flooredBeat, {
      note: beatInfo.note,
      midiNote,
      isFirstInPhrase: beatInfo.isFirstInPhrase,
    });
  });

  const addScore = (type: "normal" | "golden" | "bonus", value: number) => {
    game.addScore(options().index, type, value);
  };

  const score = () => game.scores()[options().index] ?? { normal: 0, golden: 0, bonus: 0 };
  const player = () => roundStore.settings()?.players[options().index] || null;

  const values: PlayerContextValue = {
    index: () => options().index,
    phraseIndex,
    phrase,
    nextPhrase,
    microphone,
    delayedBeat,
    processedBeats,
    addScore,
    maxScore,
    player,
    score,
  };

  const Provider = (props: { children: JSX.Element }) => <PlayerProvider value={values}>{props.children}</PlayerProvider>;

  return {
    ...values,
    PlayerProvider: Provider,
  };
}
