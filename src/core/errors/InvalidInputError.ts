import { EngineRuntimeError } from "./EngineRuntimeError";

export class InvalidInputError extends EngineRuntimeError {
    constructor(got: string, expected: string) {
        super([], `Invalid input: expected ${expected}, got ${got}`);
    }
}