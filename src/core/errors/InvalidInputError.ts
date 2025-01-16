import { EngineRuntimeError } from "./EngineRuntimeError";

/**
 *Error thrown when there is invalid input
 */
export class InvalidInputError extends EngineRuntimeError {
    constructor(got: string, expected: string) {
        super([], `Invalid input: expected ${expected}, got ${got}`);
    }
}