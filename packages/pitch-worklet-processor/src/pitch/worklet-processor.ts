import '../polyfill/text-decoder'
import init, { DywaPitchTracker } from 'dywapitchtrack'
import { isAboveNoiseSuppressionThreshold } from '../utils/audio'
import type { PitchWorkletOptions } from './options'
import { OverwriteBuffer } from './overwrite-buffer'
import type { WorkletEvent } from './events'

class PitchWorkletProcessor extends AudioWorkletProcessor {
  private buffer = new OverwriteBuffer(sampleRate)
  private options: PitchWorkletOptions
  private dywaPitchTracker?: DywaPitchTracker

  constructor(options: PitchWorkletOptions) {
    super()

    this.options = options

    this.port.onmessage = (event: WorkletEvent) => {
      if (event.data.event === 'pitch') {
        let pitch = -1
        if (this.dywaPitchTracker) {
          const threshold = this.options.processorOptions.threshold
          const samplesPerBeat = this.options.processorOptions.samplesPerBeat
          const startSample = this.buffer.getSize() - samplesPerBeat

          const isAboveThreshold = isAboveNoiseSuppressionThreshold(
            this.buffer.getBuffer(),
            startSample,
            samplesPerBeat,
            threshold,
          )
          if (isAboveThreshold) {
            pitch = this.dywaPitchTracker.compute_pitch(this.buffer.getBuffer(), startSample, samplesPerBeat)
          }

          if (pitch <= 0) {
            this.dywaPitchTracker.clear_pitch_history()
          }
        }
        event.ports[0]?.postMessage({ result: pitch })
      }
      event.ports[0]?.postMessage({ error: 'unknown event' })
    }

    ;(async () => {
      await init(options.processorOptions.wasmBinary)
      this.dywaPitchTracker = new DywaPitchTracker()
      this.dywaPitchTracker.sample_rate_hz = sampleRate
    })()
  }

  process(
    inputs: Float32Array[][],
    _outputs: Float32Array[][],
    _parameters: unknown,
  ) {
    if (inputs.length === 0 || !inputs[0] || inputs[0]?.length === 0 || !inputs[0][0]) {
      return true
    }
    this.buffer.add(inputs[0][0])
    return true
  }
}

registerProcessor('pitch-worklet-processor', PitchWorkletProcessor)
