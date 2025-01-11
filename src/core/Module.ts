import { IModule, ModuleTickFn, ModuleType, ObjectTypes, } from "../types";
import { InputPort } from "./InputPort";
import { OutputPort } from "./OutputPort";
import { WireValue } from "./WireValue";

/**
 * Represents a module
 */
export class Module implements IModule {
    public id: number;
    public inputs: InputPort[];
    public outputs: OutputPort[];
    public moduleType: ModuleType;
    public resetState: any;
    public state: any;
    public type: ObjectTypes.MODULE;
    public tickFn: ModuleTickFn<any>;

    private inputValues: WireValue[];

    /**
     * Creates an instance of Module.
     * @param {number} id The id of the module
     * @param {InputPort[]} inputs The input ports of the module
     * @param {OutputPort[]} outputs The output ports of the module
     * @param {ModuleType} moduleType The type of the module
     * @param {ModuleTickFn<any>} tick The tick function of the module
     * @param {*} initialState The initial state of the module
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    constructor(id: number, inputs: InputPort[], outputs: OutputPort[], moduleType: ModuleType, tick: ModuleTickFn<any>, initialState: any) {
        this.id = id;
        this.inputs = inputs;
        this.outputs = outputs;
        this.moduleType = moduleType;
        this.state = initialState;
        this.resetState = initialState;
        this.tickFn = tick;
        this.type = ObjectTypes.MODULE;
        this.inputValues = new Array(inputs.length);
    }

    /**
     * Set up internal bindings.
     * In order for this to work, all networks must be bound before any modules are bound.
     */
    public setBinds(): void {
        //since wireValues uses Uint8Arrays internally, we abuse  JS references 
        //to avoid copying values every time we need to propagate them
        for (let i = 0; i < this.inputs.length; i++) {
            this.inputValues[i] = this.inputs[i].value;
        }
    }

    /**
     * Resets the state of the module
     */
    public reset(): void {
        this.state = structuredClone(this.resetState);
    }

    /**
     * Advances the module by one tick
     */
    public tick(): void {
        this.state = this.tickFn(this.inputValues, this.outputs, this.state);
    }
}