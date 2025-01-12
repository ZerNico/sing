import type { Note } from "../ultrastar/note";
import { frequencyToMidi } from "../utils/midi";

export class PitchProcessor {
  private hasJoker = false;

  public process(frequency: number, note: Note) {
    let midiNote = frequencyToMidi(frequency);
    midiNote = this.applyCorrection(midiNote, note);
    midiNote = this.applyJoker(midiNote, note);

    return midiNote;
  }

  private applyCorrection(detectedMidiNote: number, targetNote: Note) {
    if (detectedMidiNote <= 0) {
      return Math.round(detectedMidiNote);
    }

    const diff = Math.abs(detectedMidiNote - targetNote.midiNote) % 12;
    const distance = diff > 6 ? 12 - diff : diff;

    return distance <= 2 ? targetNote.midiNote : Math.round(detectedMidiNote);
  }

  private applyJoker(detectedMidiNote: number, targetNote: Note) {
    if (detectedMidiNote === 0 && this.hasJoker) {
      this.hasJoker = false;
      return targetNote.midiNote;
    }
    this.hasJoker = detectedMidiNote === targetNote.midiNote;
    return detectedMidiNote;
  }
}
