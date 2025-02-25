import { getNoteScore } from "./note";
import type { Phrase } from "./phrase";

export interface Voice {
  phrases: Phrase[];
}

export function getMaxScore(voice: Voice) {
  const score = {
    normal: 0,
    golden: 0,
    bonus: 0,
  };

  for (const phrase of voice.phrases) {
    for (const note of phrase.notes) {
      const noteScore = getNoteScore(note) * note.length;

      if (note.type === "Normal") {
        score.normal += noteScore;
        score.bonus += 1;
      } else if (note.type === "Golden") {
        score.golden += noteScore;
        score.bonus += 1;
      }
    }
  }

  return score;
}
