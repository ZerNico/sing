// @ts-ignore polyfill for TextDecoder in Worklet
export class TextDecoder {
  decode(octets?: Uint8Array): string | undefined {
    if (octets === undefined) return
    let string = ''
    let i = 0
    while (i < octets.length) {
      let octet = octets[i]
      if (octet === undefined) continue
      let bytesNeeded = 0
      let codePoint = 0
      if (octet <= 0x7F) {
        bytesNeeded = 0
        codePoint = octet & 0xFF
      } else if (octet <= 0xDF) {
        bytesNeeded = 1
        codePoint = octet & 0x1F
      } else if (octet <= 0xEF) {
        bytesNeeded = 2
        codePoint = octet & 0x0F
      } else if (octet <= 0xF4) {
        bytesNeeded = 3
        codePoint = octet & 0x07
      }
      if (octets.length - i - bytesNeeded > 0) {
        let k = 0
        while (k < bytesNeeded) {
          octet = octets[i + k + 1]
          if (octet === undefined) continue
          codePoint = (codePoint << 6) | (octet & 0x3F)
          k += 1
        }
      } else {
        codePoint = 0xFFFD
        bytesNeeded = octets.length - i
      }
      string += String.fromCodePoint(codePoint)
      i += bytesNeeded + 1
    }
    return string
  }
}

// @ts-ignore polyfill for TextDecoder in Worklet
globalThis.TextDecoder = TextDecoder
