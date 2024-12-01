import { IResult } from "../interfaces/result";
import { ExploreFurnitureStates, ExploreRoomStates, Process } from "../types/process";

export class Result implements IResult {
    process?: Process;
    uiPrompts: { type: 'message' | 'sound', value: string }[]; 

    constructor() {
        process = undefined;
        this.uiPrompts = [];
    }

    setProcess(action: 'explore-room' | 'explore-furniture', pid?: ExploreRoomStates | ExploreFurnitureStates): void {
        let status: 'begin' | 'continue' | 'finish';
        if (action === 'explore-room') {
            if (!pid) {
                pid = ExploreRoomStates.Begin;
            }
                
            if (pid === ExploreRoomStates.Begin) status = 'begin';
            else if (pid === ExploreRoomStates.Finish) status = 'finish';
            else status = 'continue';
        } else if (action === 'explore-furniture') {
            if (!pid) {
                pid = ExploreRoomStates.Begin;
            }

            if (process.pid === ExploreFurnitureStates.Begin) status = 'begin';
            else if (process.pid === ExploreFurnitureStates.Finish) status = 'finish';
            else status = 'continue';
        } 
        
        if (status) {
            this.process = {
                pid: pid,
                action: action,
                status
            };
        } else {
            console.error('Process was not set as intended.');
        }
    }

    updatePID(pid: ExploreRoomStates | ExploreFurnitureStates) {
        this.setProcess(this.process.action, pid);
    }

    appendMessage(text: string) {
        this.uiPrompts.push({ type: 'message', value: text });
    }

    appendSound(relativeFilePath: string) {
        this.uiPrompts.push({ type: 'sound', value: relativeFilePath });
    }
}