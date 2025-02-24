export type NoteType = "Normal" | "Golden" | "Freestyle" | "Rap" | "RapGolden";

export interface Note {
  type: NoteType;
  startBeat: number;
  length: number;
  text: string;
  txtPitch: number;
  midiNote: number;
}

export function getNoteScore(note: Note) {
  switch (note.type) {
    case "Normal":
      return 10;
    case "Golden":
      return 20;
    default:
      return 0;
  }
}
