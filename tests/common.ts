import type { IWireValue, RawBinding, RawInputPort, RawIOModule, RawModule, RawNetwork, RawOutputPort, Setable } from "../src/types";
import { ModuleType, ObjectTypes } from "../src/types";

/**
 * Creates a binding object 
 * @param {number} id id to assign to the binding
 * @returns {*}  {RawBinding}
 */
export function createRawBinding(id: number): RawBinding {
    return {
        id
    };
}

/**
 * Creates an input port object
 * @param {number} id id to assign to the input port
 * @param {number} width value width
 * @param {number} targetID id of the target binding
 * @returns {*}  {RawInputPort}
 */
export function createRawInputPort(id: number, width: number, targetID: number): RawInputPort {
    return {
        id,
        width,
        bind: createRawBinding(targetID),
        type: ObjectTypes.INPUT_PORT
    };
}

/**
 * Creates an output port object
 * @param {number} id id to assign to the output port
 * @param {number} width value width
 * @param {number} targetID id of the target binding
 * @returns {*}  {RawInputPort}
 */
export function createRawOutputPort(id: number, width: number, targetID: number): RawOutputPort {
    return {
        id,
        width,
        bind: createRawBinding(targetID),
        type: ObjectTypes.OUTPUT_PORT
    };
}

/**
 * Creates a module that copies the each input to each output
 * @param {number} id id to assign to the module
 * @param {number[]} inputIDs array of input binding IDs
 * @param {number[]} outputIDs array of output binding IDs
 * @returns {*}  {RawModule<null>}
 */
export function createRawCopyModule(id: number, inputIDs: number[], outputIDs: number[]): RawModule<null> {
    return {
        id,
        inputs: inputIDs.map(createRawBinding),
        outputs: outputIDs.map(createRawBinding),
        moduleType: ModuleType.DEFAULT,
        initialState: null,
        tick: (inputs: IWireValue[], outputs: Setable[]): null => {
            for (let i = 0; i < inputs.length; i++) {
                if (outputs[i]) outputs[i].set(inputs[i]);
            }
            return null;
        },
        type: ObjectTypes.MODULE
    };
}

/**
 * Creates a module that throws an error
 * @param {number} id id to assign to the module
 * @param {number[]} inputIDs array of input binding IDs
 * @param {number[]} outputIDs array of output binding IDs
 * @returns {*}  {RawModule<null>}
 */
export function createRawErrorModule(id: number, inputIDs: number[], outputIDs: number[]): RawModule<null> {
    return {
        id,
        inputs: inputIDs.map(createRawBinding),
        outputs: outputIDs.map(createRawBinding),
        moduleType: ModuleType.DEFAULT,
        initialState: null,
        tick: (): null => {
            throw new Error("Error module");
        },
        type: ObjectTypes.MODULE
    };
}

/**
 * Creates an input module
 * @param {number} id id to assign to the module
 * @param {number} outputID id of the output binding
 * @param {number} width value width
 * @returns {*}  {RawIOModule}
 */
export function createRawInputModule(id: number, outputID: number, width: number): RawIOModule {
    return {
        id,
        outputs: [createRawBinding(outputID)],
        width,
        inputs: [],
        moduleType: ModuleType.INPUT,
        type: ObjectTypes.MODULE
    };
}

/**
 * Creates an output module
 * @param {number} id id to assign to the module
 * @param {number} inputID id of the input binding
 * @param {number} width value width
 * @returns {*}  {RawIOModule}
 */
export function createRawOutputModule(id: number, inputID: number, width: number): RawIOModule {
    return {
        id,
        inputs: [createRawBinding(inputID)],
        width,
        outputs: [],
        moduleType: ModuleType.OUTPUT,
        type: ObjectTypes.MODULE
    };
}

/**
 * Creates a network object
 * @param {number} id id to assign to the network
 * @param {number} width value width
 * @param {number[]} outputIDs array of output binding IDs
 * @returns {*}  {RawNetwork}
 */
export function createRawNetwork(id: number, width: number, outputIDs: number[]): RawNetwork {
    return {
        id,
        width,
        outputs: outputIDs.map(createRawBinding),
        type: ObjectTypes.NETWORK
    };
}