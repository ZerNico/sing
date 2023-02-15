import type { PitchProcessorOptions, PitchWorkletOptions } from './options'

export class PitchWorkletNode extends AudioWorkletNode {
  constructor(context: AudioContext, { wasmBinary, samplesPerBeat, threshold }: Readonly<PitchProcessorOptions>) {
    const workletOptions: PitchWorkletOptions = {
      processorOptions: { wasmBinary, samplesPerBeat, threshold },
    }
    super(context, 'pitch-worklet-processor', workletOptions)
  }
}
