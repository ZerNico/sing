import { invoke } from '@tauri-apps/api'
import type { LocalSong } from '../song/song'
import { beatToMillisecondsInSongWithoutGap } from '../utils/bpm.utils'
import { PitchProcessor } from './pitch-processor'
import type { Microphone } from '~/stores/settings'

interface RustMicrophones {
  name: string
  channel: number
}

export const initPitchProcessors = async (song: LocalSong, microphones: Microphone[]) => {
  const samplesPerBeat = Math.floor((48000 * beatToMillisecondsInSongWithoutGap(song, 1)) / 1000)

  const rustMicrophones: RustMicrophones[] = microphones.map((microphone) => ({
    name: microphone.name,
    channel: microphone.channel - 1,
    gain: microphone.gain,
    threshold: microphone.threshold,
  }))

  await invoke('start_recording', { samplesPerBeat, microphones: rustMicrophones })

  const pitchProcessors: PitchProcessor[] = microphones.map((microphone, index) => new PitchProcessor(index))
  return pitchProcessors
}

export const stopPitchProcessors = async () => {
  await invoke('stop_recording')
}
