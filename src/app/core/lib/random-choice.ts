// Largely untested
export function randomChoice<T>(array: T[]): T {
    return array[Math.floor(this.rng() * array.length)];
}