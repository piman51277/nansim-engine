import { IBinding, IOutputPort, ObjectTypes } from "../types";
import { Network } from "./Network";
import { WireValue } from "./WireValue";

/**
 * Represents an output port
 */
export class OutputPort implements IOutputPort {
    public id: number;
    public bind: IBinding<Network>;
    public type: ObjectTypes.OUTPUT_PORT;

    /**
     * Creates an instance of OutputPort.
     * @param {number} id id to assign to the output port
     * @param {IBinding<Network>} [bind] binding to assign to the output port
     */
    constructor(id: number, bind?: IBinding<Network>) {
        this.id = id;
        this.bind = bind ?? { id: -1, val: null };
        this.type = ObjectTypes.OUTPUT_PORT;
    }

    /**
     * Sets the binding of the output port
     * @param {IBinding<Network>} bind binding to assign to the output port
     */
    public setBinding(bind: IBinding<Network>): void {
        this.bind = bind;
    }

    /**
     * Sets the value of the output port
     * @param {WireValue} v value to assign to the output port
     */
    public set(v: WireValue): void {
        this.bind.val?.set(v, this.id);
    }
}