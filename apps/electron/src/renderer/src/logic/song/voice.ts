import type { Sentence } from './sentence'

export class Voice {
  public sentences: Sentence[]

  constructor(sentences: Sentence[]) {
    this.sentences = sentences
  }

  getMaxScore(): number {
    let maxScore = 0
    for (const sentence of this.sentences) {
      for (const note of sentence.notes) {
        maxScore += note.getPoints() * note.length
      }
    }
    return maxScore
  }
}
