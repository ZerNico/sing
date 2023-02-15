import type { PitchWorkletNode } from 'pitch-worklet-processor'
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
  private node?: PitchWorkletNode
  private hasJoker = false
  constructor(node?: PitchWorkletNode) {
    this.node = node
  }

  public async process(beat: Beat) {
    if (!this.node) return
    const pitchFrequency = await this.getPitch()

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

  private getPitch = () => new Promise<number>((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = ({ data }: { data: any }) => {
      channel.port1.close()
      if (data.error) {
        reject(data.error)
      } else {
        resolve(data.result)
      }
    }

    this.node?.port.postMessage({ event: 'pitch' }, [channel.port2])
  })

  private applyCorrection = (note: number, beat: Beat) => {
    const midiNote = beat.note.midiNote
    if (note > 0) {
      let midiDifference = Math.abs(note - beat.note.midiNote)
      midiDifference %= 12

      if (midiDifference > 6) {
        midiDifference = 12 - midiDifference
      }
      if (midiDifference < 2.5) {
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
