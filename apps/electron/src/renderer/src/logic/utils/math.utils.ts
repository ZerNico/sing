export function loop(value: number, min: number, max: number) {
  return value < min ? max : value > max ? min : value
}
