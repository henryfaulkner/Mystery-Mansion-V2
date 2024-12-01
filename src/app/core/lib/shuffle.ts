// Largely untested
export function shuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(this.rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}