import type { IModuleBase, IModuleInput, IModuleOutput, ModuleTickFn } from "../types";
import type { InputPort } from "./InputPort";
import { ModuleType } from "../types";
import { ObjectTypes, } from "../types";
import type { OutputPort } from "./OutputPort";
import { WireValue } from "./WireValue";

/**
 * Represents a module
 */
export class Module implements IModuleBase {
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

/**
 * Special module variant for input to the overall circuit
 */
export class InputModule extends Module implements IModuleInput {
    public moduleType: ModuleType.INPUT;

    /**
     * Creates an instance of InputModule.
     * @param {number} id The id of the module
     * @param {OutputPort[]} outputs The output ports of the module
     * @param {number} width The width of the module
     */
    constructor(id: number, outputs: OutputPort[], width: number) {
        super(id, [], outputs, ModuleType.INPUT, () => { }, WireValue.unknown(width));
        this.moduleType = ModuleType.INPUT;
    }

    /**
     * Sets the value of the module. Only used when engine is used in module mode.
     * Triggers propagation to the output.
     * @param {WireValue} v The value to set
     */
    public set(v: WireValue): void {
        this.state = v;
        this.tick();

    }

    /**
     * Advances the module by one tick
     */
    public tick(): void {
        //we should only have one output, set state to the value of that output
        this.outputs[0].set(this.state);
    }
}

export class OutputModule extends Module implements IModuleOutput {
    public moduleType: ModuleType.OUTPUT;

    /**
     * Creates an instance of OutputModule.
     * @param {number} id The id of the module
     * @param {InputPort[]} inputs The input ports of the module
     * @param {number} width The width of the module
     */
    constructor(id: number, inputs: InputPort[], width: number) {
        super(id, inputs, [], ModuleType.OUTPUT, () => { }, WireValue.unknown(width));
        this.moduleType = ModuleType.OUTPUT;
    }

    /**
     * Gets the value of the module. Only used when engine is used in module mode.
     * @returns {WireValue} The value of the module
     */
    public get(): WireValue {
        return this.state;
    }

    /**
     * Advances the module by one tick
     */
    public tick(): void {
        //we should only have one input, set state to the value of that input
        this.state = this.inputs[0].value;
    }
}