// Simple Linear Congruential Generator for deterministic random numbers
export class RNG {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  // Generate next random number between 0 and 1
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296
    return this.seed / 4294967296
  }

  // Generate random integer between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min
  }

  // Shuffle array in place using Fisher-Yates algorithm
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1)
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
}
