/**
 * A ItemOrPerson represents a physical card in the game.
 */
export class ItemOrPerson {
    name: string;
    filename: string;

    constructor(name: string) {
        this.name = name;
        this.filename = `items/${name.toLowerCase()}`;
    }
}
