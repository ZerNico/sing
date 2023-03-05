import pitchWorkletUrl from 'pitch-worklet-processor/pitchWorklet.js?url'
import pitchWasmUrl from 'dywapitchtrack/dywapitchtrack_bg.wasm?url'
import type { Microphone } from '@renderer/stores/settings'
import { PitchWorkletNode } from 'pitch-worklet-processor'
import { ofetch } from 'ofetch'
import type { LocalSong } from '../song/song'
import { beatToMillisecondsInSongWithoutGap } from '../utils/bpm.utils'
import { PitchProcessor } from './pitch-processor'

export class PitchProcessorFactory {
  // save existing streams for mics to reuse
  private streamMap = new Map<string, MediaStream>()
  private ctx = new AudioContext({ sampleRate: 48000 })
  private initialized = false
  private samplesPerBeat: number

  constructor(song: LocalSong) {
    this.samplesPerBeat = Math.floor((48000 * beatToMillisecondsInSongWithoutGap(song, 1)) / 1000)
  }

  public async createPitchProcessor(microphone: Microphone) {
    if (!this.initialized) {
      await this.ctx.audioWorklet.addModule(pitchWorkletUrl)
      this.initialized = true
    }
    try {
      const stream = await this.createMediaStream(microphone)
      const source = this.ctx.createMediaStreamSource(stream)

      // separate audio channels
      const splitterNode = this.ctx.createChannelSplitter(2)
      source.connect(splitterNode)

      // add gain
      const gainNode = this.ctx.createGain()
      gainNode.gain.value = microphone.gain
      splitterNode.connect(gainNode, microphone.channel - 1, 0)

      const pitchWorkletNode = await this.createPitchWorkletNode(microphone)
      gainNode.connect(pitchWorkletNode)

      return new PitchProcessor(pitchWorkletNode)
    } catch (e) {
      console.error(e)
      return new PitchProcessor()
    }
  }

  private async createMediaStream(microphone: Microphone) {
    // return existing stream if it exists
    let stream = this.streamMap.get(microphone.id)
    if (stream) {
      return stream
    }

    // disable browser audio processing to allow mic seperated channels (for eg. SingStar mics)
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: microphone.id },
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
      },
    })
    this.streamMap.set(microphone.id, stream)
    return stream
  }

  private async createPitchWorkletNode(microphone: Microphone) {
    const wasm = await ofetch(pitchWasmUrl, { responseType: 'blob' })
    const wasmArrayBuffer = await wasm.arrayBuffer()

    const pitchWorkletNode = new PitchWorkletNode(this.ctx, { samplesPerBeat: this.samplesPerBeat, wasmBinary: wasmArrayBuffer, threshold: microphone.threshold })

    return pitchWorkletNode
  }

  public async stopStreams() {
    this.streamMap.forEach((stream) => {
      stream.getTracks().forEach((track) => {
        track.stop()
      })
    })
    await this.ctx.close()
  }
}
