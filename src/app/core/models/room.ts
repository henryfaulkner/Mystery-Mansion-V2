import { Furniture } from "./furniture";

/**
 * A single room.
 */
export class Room {
    name: string;
    code: number;
    furnitureCodes: number[]; 
    locked: boolean;
    filename: string;

    constructor(name: string, furnitureCodes: number[], code: number) {
        this.name = name;
        this.code = code;
        this.furnitureCodes = furnitureCodes;
        this.locked = false;
        this.filename = `rooms/${name.toLowerCase()}.wav`;
    }

    toString(): string {
        const contains = this.furnitureCodes.join(', ');
        const lockedString = this.locked ? ' [LOCKED]' : '';

        return `${this.code.toString().padStart(2, ' ')}: ${this.name} - Contains: ${contains}${lockedString}`;
    }

    toJSON(): string {
        return `${this.code.toString().padStart(2, ' ')}: ${this.name}`;
    }

    containsFurniture(furnitureCode: number): boolean {
        // Assuming furniture number is represented as a string for simplicity
        return this.furnitureCodes.includes(furnitureCode);
    }
}
