import type { IBinding, IInputPort } from "../types";
import type { Module } from "./Module";
import { ObjectTypes } from "../types";
import { WireValue } from "./WireValue";

/**
 * Represents an input port
 */
export class InputPort implements IInputPort {
    public id: number;
    public bind: IBinding<Module>;
    public value: WireValue;
    public type: ObjectTypes.INPUT_PORT;

    /**
     * Creates an instance of InputPort.
     * @param {number} id id to assign to the input port
     * @param {number} width width of the input port
     * @param {IBinding<Module>} [bind] binding to assign to the input port
     */
    constructor(id: number, width: number, bind?: IBinding<Module>) {
        this.id = id;
        this.bind = bind ?? { id: -1, val: null };
        this.value = WireValue.unknown(width);
        this.type = ObjectTypes.INPUT_PORT;
    }

    /**
     * Sets the binding of the input port
     * @param {IBinding<Module>} bind binding to assign to the input port
     */
    public setBinding(bind: IBinding<Module>): void {
        this.bind = bind;
    }

    /**
     * Resets the state of the input port
     */
    public reset(): void {
        WireValue.reset(this.value);
    }
}