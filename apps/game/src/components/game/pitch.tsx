import { For, createMemo } from "solid-js";
import { usePlayer } from "~/lib/game/player";
import type { Note } from "~/lib/ultrastar/note";

const ROW_COUNT = 16;

export default function Pitch() {
  const player = usePlayer();

  const averageNote = createMemo(() => {
    const phrase = player.phrase();
    if (!phrase) {
      return 0;
    }

    const totalNotes = phrase.notes.reduce((sum, note) => sum + note.midiNote, 0);
    return Math.round(totalNotes / phrase.notes.length);
  });

  const columnCount = createMemo(() => {
    const notes = player.phrase()?.notes;
    if (!notes || notes.length === 0) {
      return 0;
    }

    if (notes.length === 1 && notes[0]) {
      return notes[0].length;
    }

    // biome-ignore lint/style/noNonNullAssertion: Checked above
    const firstNote = notes[0]!;
    // biome-ignore lint/style/noNonNullAssertion: Checked above
    const lastNote = notes.at(-1)!;

    return lastNote.startBeat + lastNote.length - firstNote.startBeat - 1;
  });

  const getNoteRow = (note: number) => {
    let wrappedMidiNote: number = note;

    const minNoteRowMidiNote = Math.floor(averageNote() - ROW_COUNT / 2);
    const maxNoteRowMidiNote = minNoteRowMidiNote + ROW_COUNT - 1;

    // move by octave to fit on screen
    while (wrappedMidiNote > maxNoteRowMidiNote && wrappedMidiNote > 0) wrappedMidiNote -= 12;
    while (wrappedMidiNote < minNoteRowMidiNote && wrappedMidiNote < 127) wrappedMidiNote += 12;

    const offset: number = wrappedMidiNote - averageNote();
    let noteRow = Math.ceil(ROW_COUNT / 2 + offset);
    noteRow = Math.abs(noteRow - ROW_COUNT) - 1;

    return noteRow;
  };

  const notes = createMemo(() => {
    const phrase = player.phrase();
    console.log(phrase);

    if (!phrase) {
      return [];
    }

    const firstBeat = phrase.notes[0]?.startBeat;
    if (firstBeat === undefined) {
      return [];
    }

    return phrase.notes
      .filter((note) => note.type !== "Freestyle")
      .map((note) => {
        return {
          note,
          row: getNoteRow(note.midiNote),
          column: note.startBeat - firstBeat,
        };
      });
  });

  return (
    <div
      class="flex-grow px-12cqw"
      classList={{
        "pt-2cqh pb-8cqh": player.index() === 0,
        "pt-8cqh pb-2cqh": player.index() === 1,
      }}
    >
      <div
        style={{
          "grid-template-rows": `repeat(${ROW_COUNT},1fr)`,
          "grid-template-columns": `repeat(${columnCount()},1fr)`,
        }}
        class="grid h-full w-full"
      >
        <For each={notes()}>{(note) => <PitchNote note={note.note} row={note.row} column={note.column} />}</For>
      </div>
    </div>
  );
}

interface PitchNoteProps {
  note: Note;
  row: number;
  column: number;
}

export function PitchNote(props: PitchNoteProps) {
  return (
    <div
      class=""
      style={{
        "grid-row": props.row,
        "grid-column": `${props.column} / span ${props.note.length}`,
      }}
    >
      <div
        class="h-2/1 w-full translate-y--1/4 transform rounded-full border border-0.15cqw shadow-md"
        classList={{
          "border-yellow-400 bg-yellow-400/20": props.note.type === "Golden",
          "border-white bg-black/20": props.note.type !== "Golden",
        }}
      />
    </div>
  );
}
