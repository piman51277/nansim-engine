import { EngineRuntimeError } from "./EngineRuntimeError";

export class ExtraInputError extends EngineRuntimeError {
    constructor(id: number) {
        super([], `Unexpected id in input map. ${id} does not point to any valid input module.`);
    }
}