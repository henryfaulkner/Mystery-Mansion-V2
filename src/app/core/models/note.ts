import { Furniture } from "./furniture";
import { ItemOrPerson } from "./item-or-person";

/**
 * A note is the data holder for each piece of furniture.
 */
export class Note {
    money: boolean;
    ask: boolean;
    item: ItemOrPerson | null;
    person: ItemOrPerson | null;
    clue: number;
    trapdoor: boolean;
    secret: string | null;
    notIn: Furniture | null;
    lookIn: Furniture | null;

    constructor() {
        this.money = false;       // Contains the money
        this.ask = false;         // Ask about the item and/or person
        this.item = null;         // Item to be asked about
        this.person = null;       // Person to be asked about
        this.clue = 0;            // How many clues are remaining?
        this.trapdoor = false;    // Contains a trapdoor
        this.secret = null;       // Secret message
        this.notIn = null;        // Furniture for "The money is not in the ___"
        this.lookIn = null;       // Furniture for "Look in the ___ for a clue"
    }
}
