import { ModuleType, ObjectTypes } from "../types";
import type { RawBinding, RawNetwork, RawObject, RawOutputPort } from "../types";
import { MAX_WIREVALUE_WIDTH } from "../constants";


const validRawObjectTypes: string[] = Object.values(ObjectTypes);

export type ValidationError = {
    affects: RawObject[];
    message: string;
}

/**
 * Helper for creating a validation error
 * @param {RawObject[]} affects The objects that are affected by the error
 * @param {string} message The message to append to the error
 * @returns {*}  {ValidationError}
 */
function createValidationError(affects: RawObject[], message: string): ValidationError {
    if (affects.length === 0) return {
        affects: [],
        message: `Validation error: ${message}`
    };
    const ids = affects.map((a: RawObject) => a.id ?? "<none>").sort((a: number, b: number) => {
        return a - b;
    }).join(", ");
    return {
        affects,
        message: `Validation error for [${ids}]: ${message}`
    };
}

/**
 * Helper for checking if a binding is valid
 * @param {RawBinding} binding The binding to check
 * @param {Record<string, RawObject>} mapping The mapping of IDs to objects
 * @param {ObjectTypes} expectedTarget The expected target type
 * @returns {*}  {boolean}
 */
export function isValidBinding(binding: RawBinding, mapping: Record<string, RawObject>, expectedTarget: ObjectTypes): null | string {
    if (binding === undefined) {
        return ("Binding is missing");
    }
    else if (binding.id === undefined) {
        return ("Binding ID is missing");
    }
    const target = mapping[binding.id];
    if (target === undefined) {
        return (`Binding target (id:${binding.id}) does not exist`);
    }
    if (target.type !== expectedTarget) {
        return (`Binding target (id:${binding.id}) is of type ${target.type}, expected ${expectedTarget}`);
    }
    return null;
}

/**
 * Validates a width for a wire value
 * @param {number} width The width to validate
 * @returns {*}  {(null | string)}
 */
export function isValidWireValueWidth(width: number): null | string {
    if (width < 1) {
        return "Width must be greater than 0";
    }
    else if (width > MAX_WIREVALUE_WIDTH) {
        return `Width must be less than or equal to ${MAX_WIREVALUE_WIDTH}`;
    }
    else if (Math.floor(width) !== width) {
        return "Width must be an integer";
    }
    return null;
}

/**
 * Validates a provided network
 * @param {RawObject[]} arr The network to validate
 * @returns {*} {null | ValidationError[]} Null if the network is valid, an array of validation errors otherwise
 */
export function validateNet(arr: RawObject[]): null | ValidationError[] {
    const errors: ValidationError[] = [];

    //Stage 0: We need at least one object to validate
    if (arr.length === 0) {
        errors.push(createValidationError([], "No objects to validate"));
        return errors;
    }

    //Stage 1: Populate mappings and check for duplicate IDs and valid types
    const mappings: Record<string, RawObject> = {};
    for (const obj of arr) {
        if (obj.id === undefined) {
            errors.push(createValidationError([obj], "ID is missing"));
        } else if (mappings[obj.id]) {
            errors.push(createValidationError([obj, mappings[obj.id]], "Duplicate ID"));
        } else if (obj.type === undefined) {
            errors.push(createValidationError([obj], "Type is missing"));
        } else if (!validRawObjectTypes.includes(obj.type)) {
            errors.push(createValidationError([obj], "Invalid type"));
        } else {
            mappings[obj.id] = obj;
        }
    }
    if (errors.length > 0) return errors;

    //Stage 2: Validate that the bindings point towards valid objects
    /**
     * Table of valid bindings
     * RawInputPort -> RawModule
     * RawOutputPort -> RawNetwork
     * RawModule.inputs -> RawInputPort
     * RawModule.outputs -> RawOutputPort
     * RawNetwork.outputs -> RawInputPort
     */
    for (const obj of arr) {
        const type = obj.type;
        if (type == ObjectTypes.INPUT_PORT) {
            const inputPort = obj;
            const bindingError = isValidBinding(inputPort.bind, mappings, ObjectTypes.MODULE);
            if (bindingError) errors.push(createValidationError([inputPort], bindingError));
        }
        else if (type == ObjectTypes.OUTPUT_PORT) {
            const outputPort = obj;
            const bindingError = isValidBinding(outputPort.bind, mappings, ObjectTypes.NETWORK);
            if (bindingError) errors.push(createValidationError([outputPort], bindingError));
        }
        else if (type == ObjectTypes.MODULE) {
            const module = obj;
            for (const input of module.inputs) {
                const bindingError = isValidBinding(input, mappings, ObjectTypes.INPUT_PORT);
                if (bindingError) errors.push(createValidationError([module], bindingError));
            }
            for (const output of module.outputs) {
                const bindingError = isValidBinding(output, mappings, ObjectTypes.OUTPUT_PORT);
                if (bindingError) errors.push(createValidationError([module], bindingError));
            }

            //check extra module properties for input/output modules

            //input modules 
            if (module.moduleType === ModuleType.INPUT) {
                //input modules cannot have inputs
                if (module.inputs.length > 0) {
                    errors.push(createValidationError([module], "Input modules cannot have inputs"));
                }

                //input modules must have exactly one output
                if (module.outputs.length !== 1) {
                    errors.push(createValidationError([module], "Input modules must have exactly one output"));
                }
            }

            //output modules
            if (module.moduleType === ModuleType.OUTPUT) {
                //output modules cannot have outputs
                if (module.outputs.length > 0) {
                    errors.push(createValidationError([module], "Output modules cannot have outputs"));
                }

                //output modules must have exactly one input
                if (module.inputs.length !== 1) {
                    errors.push(createValidationError([module], "Output modules must have exactly one input"));
                }
            }
        }
        else if (type == ObjectTypes.NETWORK) {
            const network = obj;
            for (const output of network.outputs) {
                const bindingError = isValidBinding(output, mappings, ObjectTypes.INPUT_PORT);
                if (bindingError) errors.push(createValidationError([network], bindingError));
            }
        }
    }
    if (errors.length > 0) return errors;

    //Stage 3: Validate that all ports writing to and from a network have the same valid width
    for (const obj of arr) {
        if (obj.type === ObjectTypes.OUTPUT_PORT) {
            const network = mappings[obj.bind.id] as RawNetwork;
            const widthError = isValidWireValueWidth(obj.width);
            if (widthError) errors.push(createValidationError([obj], widthError));
            else if (network.width !== obj.width) {
                errors.push(createValidationError([obj, network], `Width mismatch. Expected ${network.width}, got ${obj.width}`));
            }
        }
        else if (obj.type === ObjectTypes.INPUT_PORT) {
            const port = obj;
            const widthError = isValidWireValueWidth(port.width);
            if (widthError) {
                errors.push(createValidationError([port], widthError));
            }
        }
        else if (obj.type === ObjectTypes.NETWORK) {
            const network = obj;
            const widthError = isValidWireValueWidth(network.width);
            if (widthError) {
                errors.push(createValidationError([network], widthError));
            } else {
                for (const output of network.outputs) {
                    const port = mappings[output.id] as RawOutputPort;
                    if (port.width !== network.width) {
                        errors.push(createValidationError([port, network], `Width mismatch. Expected ${network.width}, got ${port.width}`));
                    }
                }
            }
        }
    }
    if (errors.length > 0) return errors;

    return null;
}

