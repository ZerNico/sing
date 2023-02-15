export function frequencyToMidi(frequency: number): number {
  if (frequency <= 0) {
    return -1
  }
  // https://en.wikipedia.org/wiki/MIDI_tuning_standard#Frequency_values
  return 69 + 12 * Math.log2(frequency / 440)
}
