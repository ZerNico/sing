export type NoteType = 'Normal' | 'Golden' | 'Freestyle' | 'Rap' | 'RapGolden'

export function getPointsForNoteType(noteType: NoteType): number {
  switch (noteType) {
    case 'Normal':
      return 10
    case 'Golden':
      return 20
    case 'Freestyle':
      return 0
    case 'Rap':
      return 5
    case 'RapGolden':
      return 10
  }
}

export class Note {
  public type: NoteType
  public startBeat: number
  public length: number
  public text: string
  public txtPitch: number
  public midiNote: number

  constructor(type: NoteType, startBeat: number, length: number, txtPitch: number, text: string) {
    this.type = type
    this.startBeat = startBeat
    this.length = length
    this.txtPitch = txtPitch
    this.text = text
    this.midiNote = txtPitch + 60
  }

  getPoints(): number {
    return getPointsForNoteType(this.type)
  }
}
