import type { INetwork } from "../types";
import { InfiniteLoopError } from "./errors/InfiniteLoopError";
import type { InputPort } from "./InputPort";
import { MAX_NETWORK_UPDATE_COUNT } from "../constants";
import { ObjectTypes } from "../types";
import { ShortCircuitError } from "./errors/ShortCircuitError";
import { WireValue } from "./WireValue";

export class Network implements INetwork {
    public id: number;
    public outputs: InputPort[];
    public type: ObjectTypes.NETWORK;

    private readonly value: WireValue;

    //these are used for short-circuit and cycle detection
    private readonly writersThisCycle: Set<number>;
    private readonly writeValuesThisCycle: Map<number, Uint8Array>;
    private writesThisCycle: number;

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

        this.writersThisCycle = new Set();
        this.writeValuesThisCycle = new Map();
        this.writesThisCycle = 0;
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
     * @param {number} portID id of the port that triggered the propagation
     */
    public set(v: WireValue, portID: number): void {
        //is this the first write this cycle?
        if (this.writersThisCycle.size == 0) {
            this.writersThisCycle.add(portID);
            this.writeValuesThisCycle.set(portID, structuredClone(v.data));
            this.writesThisCycle++;

            //set the initial value
            for (let i = 0; i < this.value.data.length; i++) {
                this.value.data[i] = v.data[i];
            }
        }

        //is this a new writer?
        else if (!this.writersThisCycle.has(portID)) {
            //check the value for short-circuit against the current value
            let shortCircuit = false;
            for (let i = 0; i < this.value.data.length; i++) {
                const curr = this.value.data[i];
                const newVal = v.data[i];

                //if the value is unknown, we can't short-circuit
                //otherwise, if the values are different, throw an error
                if (!(curr == 2 || newVal == 2) && curr != newVal) {
                    shortCircuit = true;
                    break;
                }
            }

            if (shortCircuit) {
                throw new ShortCircuitError([this]);
            } else {
                //write normally
                this.writersThisCycle.add(portID);
                this.writeValuesThisCycle.set(portID, structuredClone(v.data));
                this.writesThisCycle++;

                //update with respect to unknowns
                for (let i = 0; i < this.value.data.length; i++) {
                    this.value.data[i] = v.data[i] == 2 ? this.value.data[i] : v.data[i];
                }
            }
        }

        //this is a known writer
        //we have to go through this song and dance because of the edge case
        //where all the values to be updated are actually from this particular writer
        else {
            this.writeValuesThisCycle.set(portID, structuredClone(v.data));

            //more performant case: there's only one writer
            if (this.writersThisCycle.size == 1) {

                //go ahead and overwrite, this check will pass anyway
                for (let i = 0; i < this.value.data.length; i++) {
                    this.value.data[i] = v.data[i];
                }
            }

            //more than one writer
            else {
                //for each entry in the value, check if there's consensus
                const writerValues = Array.from(this.writeValuesThisCycle.values());

                for (let i = 0; i < this.value.data.length; i++) {
                    let agreedValue = writerValues[0][i];
                    for (let j = 1; j < writerValues.length; j++) {
                        if (writerValues[j][i] != 2 && writerValues[j][i] != agreedValue) {
                            if (agreedValue != 2) {
                                //we have a disagreement. Short-circuit
                                throw new ShortCircuitError([this]);
                            }
                            agreedValue = writerValues[j][i];
                        }
                    }

                    //there's consensus, update the value
                    this.value.data[i] = agreedValue;
                }
            }

            this.writesThisCycle++;
        }

        //check if infinite loop
        if (this.writesThisCycle > MAX_NETWORK_UPDATE_COUNT) {
            throw new InfiniteLoopError([this]);
        }

        for (const output of this.outputs) {
            output.bind.val?.tick();
        }
    }

    public resetStats(): void {
        this.writersThisCycle.clear();
        this.writeValuesThisCycle.clear();
        this.writesThisCycle = 0;
    }
}