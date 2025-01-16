import { EngineRuntimeError } from "./EngineRuntimeError";

/**
 * Error thrown when an input is missing from the input map
 */
export class MissingInputError extends EngineRuntimeError {
    constructor(message: string) {
        super([], `Missing input: ${message}`);
    }
}