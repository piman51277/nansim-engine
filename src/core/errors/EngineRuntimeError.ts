import type { IEngineObject } from "../../types";

/**
 * Base class for all engine runtime errors.
 */
export class EngineRuntimeError extends Error {
    affects: IEngineObject[];

    constructor(affects: IEngineObject[], message: string) {
        if (affects.length == 0) {
            super(`Runtime Error: ${message}`);
        } else {
            const ids = affects.map((a: IEngineObject) => a.id ?? "<none>").sort((a: number, b: number) => {
                return a - b;
            }).join(", ");
            super(`Runtime Error affecting [${ids}]: ${message}`);
        }
        this.affects = affects;
    }
}