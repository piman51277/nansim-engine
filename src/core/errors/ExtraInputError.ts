import { EngineRuntimeError } from "./EngineRuntimeError";

/**
 * Error thrown when there is an unexpected id in the input map
 */
export class ExtraInputError extends EngineRuntimeError {
    constructor(id: number) {
        super([], `Unexpected id in input map. ${id} does not point to any valid input module.`);
    }
}