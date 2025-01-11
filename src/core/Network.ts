import { INetwork, ObjectTypes } from "../types";
import { InputPort } from "./InputPort";
import { WireValue } from "./WireValue";

export class Network implements INetwork {
    public id: number;
    public outputs: InputPort[];
    public type: ObjectTypes.NETWORK;

    private value: WireValue;

    /**
     * Creates an instance of Network.
     * @param {number} id id to assign to the network
     * @param {number} width width of the network
     * @param {InputPort[]} outputs The output ports of the network
     */
    constructor(id: number, width: number, outputs: InputPort[]) {
        this.id = id;
        this.outputs = outputs;
        this.type = ObjectTypes.NETWORK;
        this.value = WireValue.unknown(width);
    }

    /**
     * Set up internal bindings.
     * In order for this to work, all networks must be bound before any modules are bound.
     */
    public setBinds(): void {
        //since wireValues uses Uint8Arrays internally, we abuse JS references 
        //to avoid copying values every time we need to propagate them
        for (const output of this.outputs) {
            output.value = this.value;
        }
    }

    /**
     * Propagates a value through the network
     * @param {WireValue} v value to propagate
     */
    public set(v: WireValue): void {
        //This method has to be used to preserve the references
        for (let i = 0; i < this.value.data.length; i++) {
            this.value.data[i] = v.data[i];
        }

        for (const output of this.outputs) {
            output.bind.val?.tick();
        }
    }
}