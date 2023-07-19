import type { Note } from './note'

export class Sentence {
  public minBeat: number
  public maxBeat: number
  public length: number
  public linebreakBeat: number
  public appearBeat: number
  public notes: Note[]

  constructor(notes: Note[], linebreakBeat: number, appearBeat?: number) {
    this.notes = notes
    this.length = 0

    this.minBeat = this.notes.at(0)?.startBeat ?? 0
    this.maxBeat = this.getMaxBeat()
    this.linebreakBeat = linebreakBeat < this.maxBeat ? this.maxBeat : linebreakBeat
    this.appearBeat = !appearBeat || appearBeat > this.minBeat ? this.minBeat : appearBeat

    this.length = this.getLength()
  }

  private getMaxBeat() {
    const lastNote = this.notes.at(-1)
    if (!lastNote) return this.linebreakBeat
    return lastNote.startBeat + lastNote.length
  }

  private getLength() {
    const firstNote = this.notes.at(0)
    const lastNote = this.notes.at(-1)

    if (!firstNote || !lastNote) return 0

    if (this.notes.length > 2) {
      return lastNote.startBeat + lastNote.length - firstNote.startBeat
    }

    return firstNote.length
  }
}
