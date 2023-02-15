import type { TypedAudioWorkletOptions } from '../utils/worklet'

export interface PitchProcessorOptions {
  samplesPerBeat: number
  wasmBinary: ArrayBuffer
  threshold: number
}

export type PitchWorkletOptions = TypedAudioWorkletOptions<PitchProcessorOptions>
