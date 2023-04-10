import type { Note } from './note'

export class Sentence {
  public minBeat: number
  public maxBeat: number
  public length: number
  public linebreakBeat: number
  public notes: Note[]

  constructor(notes: Note[], linebreakBeat = 0) {
    this.notes = notes
    this.linebreakBeat = linebreakBeat
    this.minBeat = linebreakBeat
    this.maxBeat = linebreakBeat
    this.length = 0

    this.updateMaxBeat()
    this.updateMinBeat()
    this.updateLength()
  }

  private updateMinBeat() {
    if (this.notes.length > 0) this.minBeat = this.notes[0].startBeat
    else this.minBeat = 0
  }

  private updateMaxBeat() {
    if (this.notes.length > 0) {
      const lastNote: Note = this.notes[this.notes.length - 1]
      this.maxBeat = lastNote.startBeat + lastNote.length
      if (this.linebreakBeat < this.maxBeat) this.linebreakBeat = this.maxBeat
    }
  }

  private updateLength() {
    if (this.notes.length < 1) {
      this.length = 0
    } else if (this.notes.length === 1) {
      this.length = this.notes[0].length
    } else {
      this.length
        = this.notes[this.notes.length - 1].startBeat
        + this.notes[this.notes.length - 1].length
        - this.notes[0].startBeat
    }
  }
}
