import * as crypto from 'crypto';
import seedrandom from 'seedrandom';
import { ItemOrPerson } from './item-or-person';
import { Furniture } from './furniture';
import { Room } from './room';
import { Note } from './note';
import { shuffle } from '../lib/shuffle';
import { sample } from '../lib/sample';
import { randomChoice } from '../lib/random-choice';
import { IResult } from '../interfaces/result';
import { ExploreFurnitureStates, ExploreRoomStates, Process } from '../types/process';
import { Result } from './result';

export class Game {
    private rng: seedrandom.prng;
    private seed: string;

    items: ItemOrPerson[];
    people: ItemOrPerson[];
    furnitureArr: Furniture[];
    rooms: Room[];
    cluesFound: number;

    constructor(seed?: string) {
        // Generate a random seed if none is provided
        this.seed = seed || this.generateRandomSeed();
        this.rng = seedrandom(this.seed);

        this.items = this.buildItemCards();
        this.people = this.buildPeopleCards();
        this.furnitureArr = this.buildFurniture();
        this.rooms = this.buildRooms();
        this.cluesFound = 0;
        this.furnishRoomsSmart(this.furnitureArr, this.rooms);
        this.buildAndApplyNotes(this.furnitureArr, this.items, this.people);
    }

    getSeed(): string {
        return this.seed;
    }

    getRng(): number {
        return this.rng();
    }

    private generateRandomSeed(): string {
        // Generate a random 16-byte hexadecimal seed
        return crypto.randomBytes(16).toString('hex');
    }

    // create physical cards
    buildItemCards(): ItemOrPerson[] {
        return [
            new ItemOrPerson("Tape"),
            new ItemOrPerson("Letter"),
            new ItemOrPerson("Photos"),
            new ItemOrPerson("Map"),
        ];
    }

    // create physical cards
    buildPeopleCards(): ItemOrPerson[] {
        return [
            new ItemOrPerson("Cook"),
            new ItemOrPerson("Chauffeur"),
            new ItemOrPerson("Maid"),
            new ItemOrPerson("Butler"),
        ];
    }

    // Create the furniture
    buildFurniture(): Furniture[] {
        const result: Furniture[] = [
            new Furniture("Dining Room Chair #1 [111]", 111),
            new Furniture("Dining Room Chair #2 [112]", 112),
            new Furniture("Dining Room Table", 113),
            new Furniture("China Cabinet", 114),
            new Furniture("Sofa", 121),
            new Furniture("Coffee Table", 122),
            new Furniture("Bed", 123),
            new Furniture("Dresser", 124),
            new Furniture("Small Bookcase", 131),
            new Furniture("Refrigerator", 132),
            new Furniture("Sink", 133),
            new Furniture("Oven", 134),
            new Furniture("Kitchen Table", 141),
            new Furniture("Pool Table", 142),
            new Furniture("Pinball Machines", 143),
            new Furniture("Large Bookcase", 144),
            new Furniture("Whirlpool", 211),
            new Furniture("Treadmill", 212),
            new Furniture("Piano", 213),
            new Furniture("Telescope", 214),
            new Furniture("Clock", 221),
            new Furniture("Computer", 222),
            new Furniture("Juke Box", 223),
            new Furniture("Rug", 224),
            new Furniture("Fireplace", 231),
            new Furniture("Knight", 232),
            new Furniture("Television", 233),
            new Furniture("Fish Tank", 234),
            new Furniture("Lamp", 241),
            new Furniture("Planter", 242),
            new Furniture("Easel", 243),
            new Furniture("Black Armchair #1 [244]", 244),
            new Furniture("Black Armchair #2 [311]", 311),
            new Furniture("White Armchair #1 [312]", 312),
            new Furniture("White Armchair #2 [313]", 313),
        ];        

        return result;
    }

    // Create and add notes to the furniture.
    // This is the step that hides the money and clues.
    buildAndApplyNotes(furnitureArr: Furniture[], items: ItemOrPerson[], people: ItemOrPerson[]): void {
        const furnitureCodesToUse = structuredClone(furnitureArr);
        shuffle(furnitureCodesToUse);

        // Hide the money
        const moneyFurniture = furnitureCodesToUse.pop()!;
        const moneyRoom = this.findRoomByFurnitureCode(this.rooms, moneyFurniture.code);
        const moneyNote = new Note();
        moneyNote.money = true;
        moneyNote.ask = true;
        moneyNote.item = randomChoice<ItemOrPerson>(items);
        moneyNote.person = randomChoice<ItemOrPerson>(people);
        moneyFurniture.note = moneyNote;

        const nonMoneyFurniture = [...furnitureCodesToUse];
        nonMoneyFurniture.splice(nonMoneyFurniture.indexOf(moneyFurniture), 1);

        const nonMoneyRooms = structuredClone(this.rooms).filter(room => room !== moneyRoom);

        // Generate 11 "You found a clue!" notes
        const clueFurniture: Furniture[] = [];
        for (let i = 0; i < 11; i++) {
            const note = new Note();
            note.clue = 2; // Furniture starts with 2 clues
            const furniture = furnitureCodesToUse.pop()!;
            furniture.note = note;
            clueFurniture.push(furniture);
        }

        // Trapdoor
        const trapdoorNote = new Note();
        trapdoorNote.trapdoor = true;
        furnitureCodesToUse.pop()!.note = trapdoorNote;

        // Secret, 1-item, non-room clues
        for (let i = 0; i < 2; i++) {
            const note = new Note();
            note.ask = true;
            if (Math.random() < 0.5) {
                note.item = randomChoice<ItemOrPerson>(items);
                note.person = undefined;
            } else {
                note.item = undefined;
                note.person = randomChoice<ItemOrPerson>(people);
            }
            note.secret = `The money is not in the ${randomChoice<Room>(nonMoneyRooms).name}.`;
            furnitureCodesToUse.pop()!.note = note;
        }

        // 2-item, normal clue
        for (let i = 0; i < 1; i++) {
            const note = new Note();
            note.ask = true;
            note.item = randomChoice<ItemOrPerson>(items);
            note.person = randomChoice<ItemOrPerson>(people);
            note.clue = 2;
            furnitureCodesToUse.pop()!.note = note;
        }

        // Not in furniture
        for (let i = 0; i < 6; i++) {
            const note = new Note();
            note.notIn = randomChoice<Furniture>(nonMoneyFurniture);
            furnitureCodesToUse.pop()!.note = note;
        }

        // Look in furniture for clue
        for (let i = 0; i < 4; i++) {
            const note = new Note();
            note.lookIn = randomChoice<Furniture>(clueFurniture);
            furnitureCodesToUse.pop()!.note = note;
        }
    }

    private findRoomByFurnitureCode(rooms: Room[], furnitureCode: number) {
        const len = rooms.length;
        for (let i = 0; i < len; i += 1) {
            if (rooms[i].containsFurniture(furnitureCode)) {
                return rooms[i];
            }
        }
    }

    buildRooms(): Room[] {
        const roomValues: { name: string, furnitureCodes: number[] }[] = [
            { name: "Living Room", furnitureCodes: [121, 122] },  // Sofa, Coffee Table
            { name: "Bed Room", furnitureCodes: [123, 124] },    // Bed, Dresser
            { name: "Kitchen", furnitureCodes: [132, 133, 134, 141] },  // Refrigerator, Sink, Oven, Kitchen Table
            { name: "Music Room", furnitureCodes: [213] },        // Piano
            { name: "Game Room", furnitureCodes: [142, 143] },    // Pool Table, Pinball Machines
            { name: "Study", furnitureCodes: [131] },             // Small Bookcase
            { name: "Library", furnitureCodes: [144] },           // Large Bookcase
            { name: "Dining Room", furnitureCodes: [111, 112, 113] },    // (2) Dining Room Chairs, Dining Room Table
            { name: "Gym", furnitureCodes: [211, 212] }           // Whirlpool, Treadmill
        ];
        
        const roomCodes = [11, 12, 13, 14, 21, 22, 23, 24, 31];
        shuffle(roomCodes);

        if (roomValues.length !== roomCodes.length) {
            console.error('The number of room names and room numbers does not match.');
            throw new Error('The number of room names and room numbers does not match.');
        }

        const result: Room[] = [];
        const len = roomValues.length;
        for (let i = 0; i < len; i += 1) {
            this.rooms.push(new Room(roomValues[i].name, roomValues[i].furnitureCodes, roomCodes[i]));
        }
        return result;
    }

    lockRooms(rooms: Room[]): void {
        const roomCodes = rooms.map(x => x.code);
        const firstRoomNumber = 11;
        const filteredroomCodes = roomCodes.filter(num => num !== firstRoomNumber);

        const numRoomsToLock = Math.floor(this.rng() * 2) + 1; // Randomly 1 or 2 rooms
        const roomCodesToLock = sample(filteredroomCodes, numRoomsToLock);

        for (const num of roomCodesToLock) {
            this.rooms[num].locked = true;
        }
    }

    furnishRoomsRandom(furnitureArr: Furniture[], rooms: Room[]): void {
        const furnitureCodes = furnitureArr.map(x => x.code);
        shuffle(furnitureCodes);

        shuffle(rooms);

        // 8 rooms get 4 pieces, 1 room gets 3 pieces
        let start = 0;
        for (const room of rooms) {
            room.furnitureCodes = furnitureCodes.slice(start, start + 4);
            start += 4;
        }
    }

    furnishRoomsSmart(furnitureArr: Furniture[], rooms: Room[]): void {
        const furnitureCodes = furnitureArr.map(x => x.code);

        // Remove the used furniture
        for (const room of rooms) {
            for (const furniture of room.furnitureCodes) {
                const index = furnitureCodes.indexOf(furniture);
                if (index !== -1) {
                    furnitureCodes.splice(index, 1); // Remove used furniture
                }
            }
        }

        shuffle(furnitureCodes);
        shuffle(rooms);

        // Assign the remaining furniture
        while (furnitureCodes.length > 0) {
            for (const room of rooms) {
                if (room.furnitureCodes.length < 4 && furnitureCodes.length > 0) {
                    room.furnitureCodes.push(furnitureCodes.pop()!);
                }
            }
        }
    }

    exploreRoom(process: Process, roomCode?: number, userInput?: string): IResult {
        const result = new Result();
        result.setProcess(process.action, process.pid);
        
        if (!roomCode) {
            result.appendMessage('Invalid request. A room number is required.');
            result.updatePID(ExploreFurnitureStates.Begin);
            return result;
        }
        const currRoom = this.getRoomByCode(this.rooms, roomCode);
        if (!currRoom) {
            result.appendMessage('Invalid request. Room number not found.');
            result.updatePID(ExploreFurnitureStates.Begin);
            return result;
        }

        if (result.process.pid === ExploreRoomStates.Begin) {
            if (currRoom.locked) {
                result.appendMessage('This room is locked. Do you have the key?');
                result.appendSound('room_locked.wav');
                result.appendMessage('y/n');
                result.updatePID(ExploreRoomStates.CheckLockedRoom);
                return result;
            }
        }

        if (result.process.pid === ExploreRoomStates.CheckLockedRoom) {
            if (userInput === 'y' || userInput === 'Y') {
                currRoom.locked = false;
                result.updatePID(ExploreRoomStates.ListFurniture);
            } else {
                result.appendMessage('Sorry.');
                result.appendSound('sorry.wav');
                result.updatePID(ExploreRoomStates.Finish);
                return result;
            }
        }

        if (result.process.pid === ExploreRoomStates.ListFurniture) {
            let message = `This is the ${currRoom.name}. You see the following:\n`;
            const len = currRoom.furnitureCodes.length;
            for (let i = 0; i < len; i += 1) {
                const furniture: Furniture = this.getFurnitureByCode(this.furnitureArr, currRoom.furnitureCodes[i]);
                message += `- ${furniture.name}`;
            }

            result.appendMessage(message);
            result.appendSound('room_explore_1');
            result.appendSound(currRoom.filename);
            result.appendSound('room_explore_2');

            for (let i = 0; i < len; i += 1) {
                const furniture: Furniture = this.getFurnitureByCode(this.furnitureArr, currRoom.furnitureCodes[i]);
                result.appendSound(furniture.filename);
            }

            return result;
        }

        if (result.process.pid === ExploreRoomStates.Finish) {
            return result;
        }

        console.warn('Using fallback result');
        return result;
    }

    exploreFurniture(process: Process, furnitureCode?: number, userInput?: string): IResult {
        const result = new Result();
        result.setProcess(process.action, process.pid);
        
        if (!furnitureCode) {
            result.appendMessage('Invalid request. A room number is required.');
            result.updatePID(ExploreFurnitureStates.Begin);
            return result;
        }
        const currFurniture = this.getFurnitureByCode(this.furnitureArr, furnitureCode); 
        if (!currFurniture) {
            result.appendMessage('Invalid request. Room number not found.');
            result.updatePID(ExploreFurnitureStates.Begin);
            return result;
        }
        const currNote = currFurniture.note;

        if (process.pid === ExploreFurnitureStates.Begin) {
            result.appendMessage(currFurniture.toString());
            result.appendSound(currFurniture.filename);

            if (!currFurniture.note) {
                result.appendMessage('Sorry. No clue here.');
                result.appendSound('clue_none.wav');
                result.updatePID(ExploreFurnitureStates.Finish);
                return result;
            }

            if (currNote.trapdoor) {
                result.appendMessage('Oops! A trapdoor! Go to the entrance.');
                result.appendSound('trapdoor.wav');
                result.updatePID(ExploreFurnitureStates.Finish);
                return result;
            }

            if (currNote.ask) { 
                if (currNote.item) {
                    result.updatePID(ExploreFurnitureStates.CheckNoteItem);
                    return result;
                } else if (currNote.person) {
                    result.updatePID(ExploreFurnitureStates.CheckNotePerson);
                    return result;
                } else {
                    result.updatePID(ExploreFurnitureStates.CheckNoteClue);
                    return result;
                }
            }
        }

        if (process.pid === ExploreFurnitureStates.CheckNoteItem) {
            result.appendMessage(`Do you have the ${currNote.item.name}?`);
            result.appendSound('ask_item.wav');
            result.appendSound(currNote.item.filename);
            result.appendMessage('y/n: ');
            result.updatePID(ExploreFurnitureStates.CheckNoteItemInput);
            return result;
        }

        if (process.pid === ExploreFurnitureStates.CheckNoteItemInput) {
            if (userInput !== 'y' && userInput !== 'Y') {
                result.appendMessage('Sorry.');
                result.appendSound('sorry.wav');
                result.updatePID(ExploreFurnitureStates.Finish);
                return result;
            } else if (currNote.person) {
                result.updatePID(ExploreFurnitureStates.CheckNotePerson);
                return result;
            } else {
                result.updatePID(ExploreFurnitureStates.CheckNoteClue);
                return result;
            }
        }

        if (process.pid === ExploreFurnitureStates.CheckNotePerson) {
            result.appendMessage(`Is the ${currNote.person} with you?`);
            result.appendSound('ask_person_1.wav');
            result.appendSound(currNote.person.filename);
            result.appendSound('ask_person_2.wav');
            result.appendMessage('y/n: ');
            result.updatePID(ExploreFurnitureStates.CheckNotePersonInput);
            return result;
        }

        if (process.pid === ExploreFurnitureStates.CheckNotePersonInput) {
            if (userInput !== 'y' && userInput !== 'Y') {
                result.appendMessage('Sorry.');
                result.appendSound('sorry.wav');
                result.updatePID(ExploreFurnitureStates.Finish);
                return result;
            } else {
                result.updatePID(ExploreFurnitureStates.CheckNoteClue);
                return result;
            }
        }

        if (process.pid === ExploreFurnitureStates.CheckNoteClue) {
            if (currNote.clue > 0) {
                if (this.cluesFound < 10) {
                    result.appendMessage('You found a clue!');
                    result.appendSound('clue_found.wav');
                } else {
                    result.appendMessage('Take a clue from another player.');
                    result.appendSound('clue_take.wav');
                }
                this.cluesFound += 1; // Keep track of how many have been found
                currNote.clue -= 1; // Remove a clue from the furniture
                result.updatePID(ExploreFurnitureStates.Finish);
                return result;
            } else {
                result.updatePID(ExploreFurnitureStates.CheckNoteSecret);
                return result;
            }
        }

        if (process.pid === ExploreFurnitureStates.CheckNoteSecret) {
            if (currNote.secret) {
                result.appendMessage('***[SECRET MESSAGE]***');
                result.appendSound('secret.wav');
                result.appendMessage('Press Enter to view.');
                result.updatePID(ExploreFurnitureStates.CheckNoteSecretInput);
                return result;
            } else {
                result.updatePID(ExploreFurnitureStates.CheckNoteLookIn);
                return result;
            }
        }

        if (process.pid === ExploreFurnitureStates.CheckNoteSecretInput) {
            result.appendMessage(currNote.secret);
            result.updatePID(ExploreFurnitureStates.Finish);
            return result;
        }

        if (process.pid === ExploreFurnitureStates.CheckNoteLookIn) {
            result.appendMessage(`Look in the ${currNote.lookIn.name} for a clue.`);
            result.appendSound('hint_look_1.wav');
            result.appendSound(currNote.lookIn.filename);
            result.appendSound('hint_look_2.wav');
            result.updatePID(ExploreFurnitureStates.CheckNoteNotIn);
            return result;
        }

        if (process.pid === ExploreFurnitureStates.CheckNoteNotIn) {
            result.appendMessage(`The money is not in the ${currNote.notIn.name}.`);
            result.appendSound('hint_not_in.wav');
            result.appendSound(currNote.notIn.filename);
            result.updatePID(ExploreFurnitureStates.CheckNoteMoney);
            return result;
        }

        if (process.pid === ExploreFurnitureStates.CheckNoteMoney) {
            result.appendMessage('You found the money! You WIN!');
            result.appendSound('win.wav');
            result.updatePID(ExploreFurnitureStates.BaseCase);
            return result;
        }

        if (process.pid === ExploreFurnitureStates.BaseCase) {
            result.appendMessage('Sorry. No clue here.');
            result.appendSound('clue_none');
            result.updatePID(ExploreFurnitureStates.Finish);
            return result;
        }

        if (result.process.pid === ExploreRoomStates.Finish) {
            return result;
        }

        console.warn('Using fallback result');
        return result;
    }

    private getRoomByCode(rooms: Room[], roomCode: number): Room {
        let result;
        const len = rooms.length;
        for (let i = 0; i < len; i += 1) {
            if (rooms[i].code === roomCode) {
                result = rooms[i];
                break;
            }
        }
        return result;
    }

    private getFurnitureByCode(furnitureArr: Furniture[], furnitureCode: number): Furniture {
        let result;
        const len = furnitureArr.length;
        for (let i = 0; i < len; i += 1) {
            if (furnitureArr[i].code === furnitureCode) {
                result = furnitureArr[i];
                break;
            }
        }
        return result;
    }
}
