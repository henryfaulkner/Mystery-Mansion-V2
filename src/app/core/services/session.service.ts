import { Injectable } from '@angular/core';
import { Game } from '../models/game';
import { IResult } from '../interfaces/result';
import { Process } from '../types/process';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private _game: Game; 

  constructor() { }

  welcome(): string {
    return 'Welcome!'
  }

  startGame(data: { seed: string }): boolean {
    this._game = new Game(data.seed);
    return true;
  }

  testSeed(): number {
    const result = this._game.getRng();
    return result;
  }

  exploreRoom(process: Process, roomCode?: number, userInput?: string): IResult {
    const result = this._game.exploreRoom(process, roomCode, userInput);
    return result;
  }

  exploreFurniture(process: Process, furnitureCode?: number, userInput?: string): IResult {
    const result = this._game.exploreFurniture(process, furnitureCode, userInput);
    return result;
  }
}
