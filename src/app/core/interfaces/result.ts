import { Process } from "../types/process";

export interface IResult {
    process?: Process;
    uiPrompts?: { type: 'message' | 'sound', value: string }[]; 
}