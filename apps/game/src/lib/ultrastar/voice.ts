import { getNoteScore } from "./note";
import type { Phrase } from "./phrase";

export interface Voice {
  phrases: Phrase[];
}

export function getMaxScore(voice: Voice) {
  const score = {
    note: 0,
    golden: 0,
    bonus: 0,
  };

  for (const phrase of voice.phrases) {
    for (const note of phrase.notes) {
      const noteScore = getNoteScore(note) * note.length;

      if (note.type === "Normal") {
        score.note += noteScore;
        score.bonus += 1;
      } else if (note.type === "Golden") {
        score.golden += noteScore;
        score.bonus += 1;
      }
    }
  }

  return score;
}
