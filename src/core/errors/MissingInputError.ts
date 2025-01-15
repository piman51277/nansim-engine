import { EngineRuntimeError } from "./EngineRuntimeError";

export class MissingInputError extends EngineRuntimeError {
    constructor(message: string) {
        super([], `Missing input: ${message}`);
    }
}