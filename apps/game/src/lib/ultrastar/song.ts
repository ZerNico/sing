import type { Voice } from "./voice";

interface Data {
  title: string;
  artist: string;
  bpm: number;
  gap: number;
  videoGap: number;
  hash: string;
  album?: string;
  language?: string;
  edition?: string;
  genre?: string;
  year?: number;
  author?: string;
  relative?: boolean;
  audio?: string;
  cover?: string;
  video?: string;
  background?: string;
  duetSingerP1?: string;
  duetSingerP2?: string;
}

export interface Song extends Data {
  voices: Voice[];
}
