export class OverwriteBuffer {
  private buffer: Float32Array
  private readonly size: number
  private pos = 0

  constructor(size: number) {
    if (size < 0) {
      throw new RangeError('The size does not allow negative values.')
    }
    this.buffer = new Float32Array(size)
    this.size = size
  }

  public add(array: Float32Array): void {
    // make space in buffer if input too large
    if (array.length + this.pos > this.buffer.length) {
      const sizeNeeded = array.length - (this.size - this.pos)
      const subArray = this.buffer.subarray(sizeNeeded, this.pos)
      this.pos = subArray.length
      this.buffer = new Float32Array(this.size)
      this.buffer.set(subArray)
    }
    this.buffer.set(array, this.pos)
    this.pos += array.length
  }

  public getBuffer(): Float32Array {
    return this.buffer
  }

  public getSize(): number {
    return this.size
  }

  public getPos(): number {
    return this.pos
  }
}
