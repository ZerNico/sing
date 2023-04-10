import { invoke } from '@tauri-apps/api'
import type { Note } from '../song/note'
import { frequencyToMidi } from '../utils/midi.utils'

export interface Beat {
  note: Note
  isFirstBeat: boolean
  isLastBeat: boolean
  beat: number
}

export interface ProcessedBeat extends Beat {
  sungNote: number
  length: number
}

export class PitchProcessor {
  private hasJoker = false
  private index: number
  constructor(index: number) {
    this.index = index
  }

  public async process(beat: Beat) {
    const pitchFrequency = await invoke<number>('get_pitch', { microphone: this.index })

    const sungMidiNote = frequencyToMidi(pitchFrequency)
    let note = this.applyCorrection(sungMidiNote, beat)
    note = this.applyJokerRule(note, beat)

    const processedBeat: ProcessedBeat = {
      ...beat,
      sungNote: note,
      length: 1,
    }

    return processedBeat
  }

  private applyCorrection = (note: number, beat: Beat) => {
    const midiNote = beat.note.midiNote
    if (note > 0) {
      let midiDifference = Math.abs(note - beat.note.midiNote)
      midiDifference %= 12

      if (midiDifference > 6) {
        midiDifference = 12 - midiDifference
      }
      // TODO: make this configurable by the user
      if (midiDifference < 2) {
        return midiNote
      }
    }
    return Math.round(note)
  }

  private applyJokerRule(note: number, beat: Beat) {
    const midiNote = beat.note.midiNote

    if (note === 0 && this.hasJoker) {
      this.hasJoker = false
      return midiNote
    }
    this.hasJoker = note === midiNote
    return note
  }
}
