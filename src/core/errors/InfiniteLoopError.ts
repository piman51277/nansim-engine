
import { EngineRuntimeError } from "./EngineRuntimeError";
import type { IEngineObject } from "../../types";

/**
 * Error thrown when objects are stuck in an infinite loop
 */
export class InfiniteLoopError extends EngineRuntimeError {
    constructor(affects: IEngineObject[]) {
        super(affects, "Infinite loop detected");
    }
}