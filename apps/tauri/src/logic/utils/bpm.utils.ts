import type { LocalSong } from '../song/song'

export function millisecondInSongToBeat(song: LocalSong, millisInSong: number): number {
  return millisecondInSongToBeatWithoutGap(song, millisInSong - song.meta.gap)
}

export function millisecondInSongToBeatWithoutGap(song: LocalSong, millisInSong: number): number {
  const beatsPerMinute = getBeatsPerMinute(song)
  const result = (beatsPerMinute * millisInSong) / 1000.0 / 60.0
  return result
}

export function beatToMillisecondsInSong(song: LocalSong, beat: number): number {
  return beatToMillisecondsInSongWithoutGap(song, beat) + song.meta.gap
}

export function beatToMillisecondsInSongWithoutGap(song: LocalSong, beat: number): number {
  const beatsPerMinute = getBeatsPerMinute(song)
  const millisecondsPerBeat = 60000.0 / beatsPerMinute
  const millisecondsInSong = beat * millisecondsPerBeat
  return millisecondsInSong
}

export function getBeatsPerMinute(song: LocalSong): number {
  // Multiply by 4 because UltraStar songs use bars per minute instead of beats per minute
  return song.meta.bpm * 4
}
