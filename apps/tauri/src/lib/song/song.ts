import { Voice } from './voice'

export interface Meta {
  title: string
  artist: string
  bpm: number
  gap: number
  videoGap: number
  hash: string
  album?: string
  language?: string
  edition?: string
  genre?: string
  year?: number
  author?: string
  relative?: boolean
}

export interface FileUrls {
  audio: string
  cover?: string
  video?: string
  background?: string
}

export interface Extra {
  replayGain?: number
}

export interface Song {
  getMeta(): Meta
  getFileUrls(): FileUrls
  getExtra(): Extra
  getVoices(): Voice[]
}

export class LocalSong implements Song {
  constructor(private voices: Voice[], private meta: Meta, private fileUrls: FileUrls, private extra: Extra) {}

  getMeta() {
    return this.meta
  }

  getFileUrls() {
    return this.fileUrls
  }

  getExtra() {
    return this.extra
  }

  getVoices() {
    return this.voices
  }
}
