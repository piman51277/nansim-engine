import { EngineRuntimeError } from "./EngineRuntimeError";
import type { IEngineObject } from "../../types";

/**
 * Error that is thrown when a module tick function throws an error
 * that is unrelated to the engine itself.
 */
export class ModuleTickError extends EngineRuntimeError {
    nestedError: Error;

    constructor(affects: IEngineObject[], err: Error) {
        super(affects, `Error in module tick function.`);
        this.nestedError = err;
    }
}