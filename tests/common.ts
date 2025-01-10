import { ModuleType, ObjectTypes, RawBinding, RawInputPort, RawModule, RawNetwork, RawOutputPort, Setable, WireValue } from "../src/types";

/**
 * Creates a binding object 
 * @param {number} id id to assign to the binding
 * @returns {*}  {RawBinding}
 */
export function createBinding(id: number): RawBinding {
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
export function createInputPort(id: number, width: number, targetID: number): RawInputPort {
    return {
        id,
        width,
        bind: createBinding(targetID),
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
export function createOutputPort(id: number, width: number, targetID: number): RawOutputPort {
    return {
        id,
        width,
        bind: createBinding(targetID),
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
export function createCopyModule(id: number, inputIDs: number[], outputIDs: number[]): RawModule<null> {
    return {
        id,
        inputs: inputIDs.map(createBinding),
        outputs: outputIDs.map(createBinding),
        moduleType: ModuleType.DEFAULT,
        initialState: null,
        tick: (inputs: WireValue[], outputs: Setable[]): null => {
            for (let i = 0; i < inputs.length; i++) {
                if (outputs[i]) outputs[i].set(inputs[i]);
            }
            return null;
        },
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
export function createNetwork(id: number, width: number, outputIDs: number[]): RawNetwork {
    return {
        id,
        width,
        outputs: outputIDs.map(createBinding),
        type: ObjectTypes.NETWORK
    };
}