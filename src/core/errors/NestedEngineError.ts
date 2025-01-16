import { EngineRuntimeError } from "./EngineRuntimeError";
import type { IEngineObject } from "../../types";

/**
 * Error thrown when an error occurs inside a nested engine instance.
 */
export class NestedEngineError extends EngineRuntimeError {
    nestedError: Error;

    constructor(id: number, error: Error) {
        //while the following is discouraged in TS, 
        //it is nessesary as this error is triggered within a tick() function,
        //meaning the actual IEngineObejct doesn't exist yet.
        super([{ id } as unknown as IEngineObject], `Error occured inside nested engine instance.`);
        this.nestedError = error;
    }
}