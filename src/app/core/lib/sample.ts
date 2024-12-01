// Largely untested
export function sample(array: number[], size: number): number[] {
    const shuffled = array.slice();
    this.shuffle(shuffled);
    return shuffled.slice(0, size);
}