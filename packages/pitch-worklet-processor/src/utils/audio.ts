export function isAboveNoiseSuppressionThreshold(
  samplesBuffer: Float32Array,
  sampleStartIndex: number,
  sampleCount: number,
  threshold: number,
) {
  const minThreshold = threshold / 100
  const sampleEndIndex = sampleStartIndex + sampleCount
  for (let index = sampleStartIndex; index < sampleEndIndex; index++) {
    const sample = samplesBuffer[index]
    if (sample && Math.abs(sample) >= minThreshold) {
      return true
    }
  }
  return false
}
