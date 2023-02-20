import { z } from 'zod'
import type { Voice } from './voice'

export const metaSchema = z.object({
  title: z.string(),
  artist: z.string(),
  language: z.string().optional(),
  edition: z.string().optional(),
  genre: z.string().optional(),
  year: z.coerce.number().int().optional(),
  bpm: z.coerce.number(),
  gap: z.coerce.number().default(0),
  author: z.string().optional(),
  relative: z.literal(false),
  hash: z.string(),
  videoGap: z.coerce.number().default(0),
})

export const urlsSchema = z.object({
  mp3: z.string(),
  cover: z.string().optional(),
  video: z.string().optional(),
  background: z.string().optional(),
})

export type Meta = z.infer<typeof metaSchema>
export type Urls = z.infer<typeof urlsSchema>

export class LocalSong {
  public meta: Meta
  public urls: Urls
  public voices: Voice[]
  constructor(song: Meta, urls: Urls, voices: Voice[]) {
    this.meta = song
    this.voices = voices
    this.urls = urls
  }

  public isDuet() {
    return this.voices.length > 1
  }
}
