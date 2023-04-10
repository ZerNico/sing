import type { Sentence } from './sentence'

export class Voice {
  public sentences: Sentence[]

  constructor(sentences: Sentence[]) {
    this.sentences = sentences
  }

  getMaxScore() {
    // max score is score of all notes in all sentences in this voice + 1 for every note that isn't of type Freestyle
    const maxScore = {
      totalScore: 0,
      noteScore: 0,
      goldenScore: 0,
      bonusScore: 0,
    }

    for (const sentence of this.sentences) {
      for (const note of sentence.notes) {
        const noteScore = note.getPoints() * note.length
        maxScore.totalScore += noteScore
        maxScore.noteScore += noteScore
        if (note.type === 'Golden') {
          maxScore.goldenScore += noteScore
        }

        if (note.type !== 'Freestyle') {
          maxScore.bonusScore += 1 * note.length
          maxScore.totalScore += 1 * note.length
        }
      }
    }
    return maxScore
  }
}
