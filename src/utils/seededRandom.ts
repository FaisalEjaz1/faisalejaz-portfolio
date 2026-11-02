// Mulberry32 seeded pseudo-random number generator
export class SeededRandom {
  private seed: number;

  constructor(seed = 42) {
    this.seed = seed;
  }

  // Returns pseudo-random float [0, 1)
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns integer between min and max inclusive
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Returns float between min and max rounded to decimals
  nextFloat(min: number, max: number, decimals = 2): number {
    const val = this.next() * (max - min) + min;
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  // Pick random element from array
  choice<T>(array: readonly T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  // Pick based on weights
  weightedChoice<T>(items: readonly T[], weights: readonly number[]): T {
    const total = weights.reduce((acc, w) => acc + w, 0);
    let r = this.next() * total;
    for (let i = 0; i < items.length; i++) {
      r -= weights[i];
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  // Boolean with probability of being true
  bool(chance = 0.5): boolean {
    return this.next() < chance;
  }

  // Reset to original seed
  reset(seed = 42) {
    this.seed = seed;
  }
}

export const defaultRng = new SeededRandom(20261101);
