
import { EngineRuntimeError } from "./EngineRuntimeError";
import type { IEngineObject } from "../../types";

/**
 * Error thrown when two different outputs try to write different values to
 * the same network on the same cycle
 */
export class ShortCircuitError extends EngineRuntimeError {
    constructor(affects: IEngineObject[]) {
        super(affects, "Short circuit detected");
    }
}