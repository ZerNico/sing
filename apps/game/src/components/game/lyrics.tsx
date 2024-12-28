import { For, Show, createMemo } from "solid-js";
import { useGame } from "~/lib/game/game";
import { usePlayer } from "~/lib/game/player";
import { msToBeatWithoutGap } from "~/lib/ultrastar/bpm";
import type { Note } from "~/lib/ultrastar/note";
import { clamp } from "~/lib/utils/math";

export default function Lyrics() {
  const game = useGame();
  const player = usePlayer();

  const leadInPercentage = createMemo(() => {
    const phrase = player.phrase();
    const song = game.song();
    if (!phrase || !song) {
      return;
    }

    const beat = game.beat();
    const startBeat = phrase.notes[0]?.startBeat;

    if (startBeat === undefined) {
      return;
    }

    const percentage = ((beat - startBeat) * -100) / msToBeatWithoutGap(song, 3000);

    return {
      end: percentage,
      start: percentage + 30,
    };
  });

  return (
    <div
      class="w-full bg-black/70"
      classList={{
        "pt-1.2cqh pb-0.8cqh": player.index() === 0,
        "pb-1.8cqh": player.index() === 1,
      }}
    >
      <div class="grid grid-cols-[1fr_min-content_1fr]">
        <div class="pt-0.8cqw pr-0.3cqw pb-0.6cqw">
          <Show when={leadInPercentage()}>
            {(percentage) => (
              <div
                style={{
                  "background-image": `linear-gradient(270deg, transparent ${percentage().end}%, #ff0000 ${
                    percentage().end
                  }%, transparent ${percentage().start}%`,
                }}
                class="h-full w-full"
              />
            )}
          </Show>
        </div>
        <div>
          <For fallback={<span class="text-4xl text-transparent leading-relaxed">{"\u00A0"}</span>} each={player.phrase()?.notes}>
            {(note) => <LyricsNote note={note} />}
          </For>
        </div>
        <div />
      </div>
      <div class="text-center text-3xl text-white/50">
        <For fallback={<span class="text-transparent">{"\u00A0"}</span>} each={player.nextPhrase()?.notes}>
          {(note) => (
            <span
              class="whitespace-pre"
              classList={{
                italic: note.type === "Freestyle",
              }}
            >
              {note.text}
            </span>
          )}
        </For>
      </div>
    </div>
  );
}

interface LyricsNoteProps {
  note: Note;
}
function LyricsNote(props: LyricsNoteProps) {
  const game = useGame();

  const percentage = createMemo(() => {
    const beat = game.beat();

    if (beat < props.note.startBeat) {
      return 0;
    }

    return clamp(((beat - props.note.startBeat) * 100) / props.note.length, 0, 100);
  });

  return (
    <span
      style={{
        "background-image": `linear-gradient(to right, #ff0000 ${percentage()}%, white ${percentage()}%)`,
      }}
      class="whitespace-pre bg-clip-text text-4xl text-transparent leading-relaxed"
      classList={{
        italic: props.note.type === "Freestyle",
      }}
    >
      {props.note.text}
    </span>
  );
}
