import { ModuleType, ObjectTypes, RawBinding, RawInputPort, RawModule, RawNetwork, RawOutputPort } from "../../src/types";
import { isValidBinding, validateNet } from "../../src/io/validateNet";
import { MAX_WIREVALUE_WIDTH } from "../../src/constants";
import { createRawCopyModule, createRawInputPort, createRawNetwork, createRawOutputPort } from "../common";

/** Stage 1 */

test("object missing id (single)", () => {
    const obj = {
        key: "value"
    } as unknown as RawInputPort;
    const result = validateNet([obj]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(obj);
    expect(result![0].message).toContain("ID is missing");
});
test("object missing id (multiple)", () => {
    const obj1 = {
        key: "value1"
    } as unknown as RawInputPort;
    const obj2 = {
        key: "value2"
    } as unknown as RawInputPort;
    const result = validateNet([obj1, obj2]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const messages = result!.map(error => error.message);
    const affects = result!.map(error => error.affects).flat();

    expect(messages).toEqual([
        "Validation error for [<none>]: ID is missing",
        "Validation error for [<none>]: ID is missing"
    ]);

    expect(affects).toContain(obj1);
    expect(affects).toContain(obj2);
});
test("object missing type (single)", () => {
    const obj = {
        id: 1
    } as unknown as RawInputPort;
    const result = validateNet([obj]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(obj);
    expect(result![0].message).toContain("Type is missing");
});
test("object missing type (multiple)", () => {
    const obj1 = {
        id: 1
    } as unknown as RawInputPort;
    const obj2 = {
        id: 2
    } as unknown as RawInputPort;
    const result = validateNet([obj1, obj2]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const messages = result!.map(error => error.message);
    const affects = result!.map(error => error.affects).flat();

    expect(messages).toEqual([
        "Validation error for [1]: Type is missing",
        "Validation error for [2]: Type is missing"
    ]);

    expect(affects).toContain(obj1);
    expect(affects).toContain(obj2);
});
test("mixed missing attributes", () => {
    const obj1 = {
        id: 1
    } as unknown as RawInputPort;
    const obj2 = {
        key: "value2"
    } as unknown as RawInputPort;
    const result = validateNet([obj1, obj2]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const messages = result!.map(error => error.message);
    const affects = result!.map(error => error.affects).flat();

    expect(messages).toEqual([
        "Validation error for [1]: Type is missing",
        "Validation error for [<none>]: ID is missing"
    ]);

    expect(affects).toContain(obj1);
    expect(affects).toContain(obj2);
});
test("object with invalid type (single)", () => {
    const obj = {
        id: 1,
        type: "INVALID_TYPE"
    } as unknown as RawInputPort;
    const result = validateNet([obj]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(obj);
    expect(result![0].message).toContain("Invalid type");
});
test("object with invalid type (multiple)", () => {
    const obj1 = {
        id: 1,
        type: "INVALID_TYPE"
    } as unknown as RawInputPort;
    const obj2 = {
        id: 2,
        type: "INVALID_TYPE"
    } as unknown as RawInputPort;
    const result = validateNet([obj1, obj2]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const messages = result!.map(error => error.message);
    const affects = result!.map(error => error.affects).flat();

    expect(messages).toEqual([
        "Validation error for [1]: Invalid type",
        "Validation error for [2]: Invalid type"
    ]);

    expect(affects).toContain(obj1);
    expect(affects).toContain(obj2);
});
test("objects with duplicate IDs (single conflict)", () => {
    const obj1 = {
        id: 1,
        type: "INPUT_PORT"
    } as unknown as RawInputPort;
    const obj2 = {
        id: 1,
        type: "OUTPUT_PORT"
    } as unknown as RawInputPort;
    const result = validateNet([obj1, obj2]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(obj1);
    expect(result![0].affects).toContain(obj2);
    expect(result![0].message).toContain("Duplicate ID");
});
test("objects with duplicate IDs (multiple conflicts)", () => {
    const obj1 = {
        id: 1,
        type: "INPUT_PORT"
    } as unknown as RawInputPort;
    const obj2 = {
        id: 1,
        type: "OUTPUT_PORT"
    } as unknown as RawInputPort;
    const obj3 = {
        id: 1,
        type: "MODULE"
    } as unknown as RawInputPort;
    const result = validateNet([obj1, obj2, obj3]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const messages = result!.map(error => error.message);
    const affects = result!.map(error => error.affects).flat();

    expect(messages).toEqual([
        "Validation error for [1, 1]: Duplicate ID",
        "Validation error for [1, 1]: Duplicate ID"
    ]);

    expect(affects).toContain(obj1);
    expect(affects).toContain(obj2);
    expect(affects).toContain(obj3);
});

/** Stage 2 */

//isValidBinding Helper Function
test("isValidBinding missing binding", () => {
    const result = isValidBinding(undefined as unknown as RawBinding, {}, ObjectTypes.MODULE);
    expect(result).toBe("Binding is missing");
});
test("isValidBinding missing binding ID", () => {
    const result = isValidBinding({} as RawBinding, {}, ObjectTypes.MODULE);
    expect(result).toBe("Binding ID is missing");
});
test("isValidBinding missing target", () => {
    const result = isValidBinding({ id: 1 } as RawBinding, {}, ObjectTypes.MODULE);
    expect(result).toBe("Binding target (id:1) does not exist");
});
test("isValidBinding invalid target type", () => {
    const result = isValidBinding({ id: 1 } as RawBinding, { 1: { type: ObjectTypes.INPUT_PORT } as RawInputPort }, ObjectTypes.MODULE);
    expect(result).toBe("Binding target (id:1) is of type INPUT_PORT, expected MODULE");
});
test("isValidBinding valid target", () => {
    const result = isValidBinding({ id: 1 } as RawBinding, { 1: { type: ObjectTypes.MODULE } as unknown as RawInputPort }, ObjectTypes.MODULE);
    expect(result).toBeNull();
});

//Main Function
//We're not bothering to test the individual binding checks, as they're already tested in the helper function
test("input port invalid binding", () => {
    const inputPort: RawInputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.INPUT_PORT
    };
    const result = validateNet([inputPort]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(inputPort);
    expect(result![0].message).toEqual("Validation error for [1]: Binding target (id:2) does not exist");
});
test("output port invalid binding", () => {
    const outputPort: RawOutputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.OUTPUT_PORT
    };
    const result = validateNet([outputPort]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(outputPort);
    expect(result![0].message).toEqual("Validation error for [1]: Binding target (id:2) does not exist");
});
test("module invalid input binding", () => {
    const module: RawModule<any> = {
        id: 1,
        inputs: [{ id: 2 }],
        outputs: [],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const result = validateNet([module]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(module);
    expect(result![0].message).toEqual("Validation error for [1]: Binding target (id:2) does not exist");
});
test("module invalid output binding", () => {
    const module: RawModule<any> = {
        id: 1,
        inputs: [],
        outputs: [{ id: 2 }],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const result = validateNet([module]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(module);
    expect(result![0].message).toEqual("Validation error for [1]: Binding target (id:2) does not exist");
});
test("module invalid input/output bindings", () => {
    const module: RawModule<any> = {
        id: 1,
        inputs: [{ id: 2 }],
        outputs: [{ id: 3 }],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const result = validateNet([module]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const affects = result!.map(error => error.affects).flat();
    const messages = result!.map(error => error.message);

    expect(affects).toEqual([module, module]);
    expect(messages).toContain("Validation error for [1]: Binding target (id:2) does not exist");
    expect(messages).toContain("Validation error for [1]: Binding target (id:3) does not exist");
});
test("network invalid output binding", () => {
    const network: RawNetwork = {
        id: 1,
        outputs: [{ id: 2 }],
        width: 1,
        type: ObjectTypes.NETWORK
    };
    const result = validateNet([network]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(network);
    expect(result![0].message).toEqual("Validation error for [1]: Binding target (id:2) does not exist");
});
test("input port invalid binding target type", () => {
    const fromObj: RawInputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.INPUT_PORT
    };
    const toObj: RawNetwork = {
        id: 2,
        outputs: [],
        width: 1,
        type: ObjectTypes.NETWORK
    };
    const result = validateNet([fromObj, toObj]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(fromObj);
    expect(result![0].message).toEqual("Validation error for [1]: Binding target (id:2) is of type NETWORK, expected MODULE");
});
test("output port invalid binding target type", () => {
    const fromObj: RawOutputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.OUTPUT_PORT
    };
    const toObj: RawInputPort = {
        id: 2,
        width: 1,
        bind: { id: 3 },
        type: ObjectTypes.INPUT_PORT
    };
    const result = validateNet([fromObj, toObj]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const affects = result!.map(error => error.affects).flat();
    const messages = result!.map(error => error.message);

    expect(affects).toContain(fromObj);
    expect(affects).toContain(toObj);
    expect(messages).toContain("Validation error for [1]: Binding target (id:2) is of type INPUT_PORT, expected NETWORK");
    expect(messages).toContain("Validation error for [2]: Binding target (id:3) does not exist");
});
test("module invalid input binding target type", () => {
    const fromObj: RawModule<any> = {
        id: 1,
        inputs: [{ id: 2 }],
        outputs: [],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const toObj: RawOutputPort = {
        id: 2,
        width: 1,
        bind: { id: 3 },
        type: ObjectTypes.OUTPUT_PORT
    };
    const result = validateNet([fromObj, toObj]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const affects = result!.map(error => error.affects).flat();
    const messages = result!.map(error => error.message);

    expect(affects).toContain(fromObj);
    expect(affects).toContain(toObj);
    expect(messages).toContain("Validation error for [1]: Binding target (id:2) is of type OUTPUT_PORT, expected INPUT_PORT");
    expect(messages).toContain("Validation error for [2]: Binding target (id:3) does not exist");
});
test("module invalid output binding target type", () => {
    const fromObj: RawModule<any> = {
        id: 1,
        inputs: [],
        outputs: [{ id: 2 }],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const toObj: RawInputPort = {
        id: 2,
        width: 1,
        bind: { id: 3 },
        type: ObjectTypes.INPUT_PORT
    };
    const result = validateNet([fromObj, toObj]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const affects = result!.map(error => error.affects).flat();
    const messages = result!.map(error => error.message);

    expect(affects).toContain(fromObj);
    expect(affects).toContain(toObj);
    expect(messages).toContain("Validation error for [1]: Binding target (id:2) is of type INPUT_PORT, expected OUTPUT_PORT");
    expect(messages).toContain("Validation error for [2]: Binding target (id:3) does not exist");
});
test("network invalid output binding target type", () => {
    const fromObj: RawNetwork = {
        id: 1,
        outputs: [{ id: 2 }],
        width: 1,
        type: ObjectTypes.NETWORK
    };
    const toObj: RawOutputPort = {
        id: 2,
        width: 1,
        bind: { id: 3 },
        type: ObjectTypes.OUTPUT_PORT
    };
    const result = validateNet([fromObj, toObj]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const affects = result!.map(error => error.affects).flat();
    const messages = result!.map(error => error.message);

    expect(affects).toContain(fromObj);
    expect(affects).toContain(toObj);
    expect(messages).toContain("Validation error for [1]: Binding target (id:2) is of type OUTPUT_PORT, expected INPUT_PORT");
    expect(messages).toContain("Validation error for [2]: Binding target (id:3) does not exist");
});
test("valid inputPort -> Module binding", () => {
    const inputPort: RawInputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.INPUT_PORT
    };
    const module: RawModule<any> = {
        id: 2,
        inputs: [],
        outputs: [],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const result = validateNet([inputPort, module]);
    expect(result).toBeNull();
});
test("valid outputPort -> Network binding", () => {
    const outputPort: RawOutputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.OUTPUT_PORT
    };
    const network: RawNetwork = {
        id: 2,
        outputs: [],
        width: 1,
        type: ObjectTypes.NETWORK
    };
    const result = validateNet([outputPort, network]);
    expect(result).toBeNull();
});
test("valid Module <-> inputPort binding", () => {
    const inputPort: RawInputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.INPUT_PORT
    };
    const module: RawModule<any> = {
        id: 2,
        inputs: [{ id: 1 }],
        outputs: [],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const result = validateNet([inputPort, module]);
    expect(result).toBeNull();
});
test("valid Module -> outputPort -> Network binding", () => {
    const outputPort: RawOutputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.OUTPUT_PORT
    };
    const network: RawNetwork = {
        id: 2,
        outputs: [],
        width: 1,
        type: ObjectTypes.NETWORK
    };
    const module: RawModule<any> = {
        id: 3,
        inputs: [],
        outputs: [{ id: 1 }],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };

    const result = validateNet([outputPort, network, module]);
    expect(result).toBeNull();
});

/** Stage 3 */
test("width mismatch outputPort -> Network", () => {
    const outputPort: RawOutputPort = {
        id: 1,
        width: 1,
        bind: { id: 2 },
        type: ObjectTypes.OUTPUT_PORT
    };
    const network: RawNetwork = {
        id: 2,
        outputs: [],
        width: 2,
        type: ObjectTypes.NETWORK
    };
    const result = validateNet([outputPort, network]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(outputPort);
    expect(result![0].affects).toContain(network);
    expect(result![0].message).toEqual("Validation error for [1, 2]: Width mismatch. Expected 2, got 1");
});
test("width mismatch Network -> inputPort", () => {
    const inputPort: RawInputPort = {
        id: 1,
        width: 1,
        bind: { id: 3 },
        type: ObjectTypes.INPUT_PORT
    };
    const network: RawNetwork = {
        id: 2,
        outputs: [{ id: 1 }],
        width: 2,
        type: ObjectTypes.NETWORK
    };
    const module: RawModule<any> = {
        id: 3,
        inputs: [],
        outputs: [],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const result = validateNet([inputPort, network, module]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(inputPort);
    expect(result![0].affects).toContain(network);
    expect(result![0].message).toEqual("Validation error for [1, 2]: Width mismatch. Expected 2, got 1");
});
test("invalid width (low) inputPort", () => {
    const inputPort: RawInputPort = {
        id: 1,
        width: 0,
        bind: { id: 3 },
        type: ObjectTypes.INPUT_PORT
    };
    const module: RawModule<any> = {
        id: 3,
        inputs: [],
        outputs: [],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const result = validateNet([inputPort, module]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(inputPort);
    expect(result![0].message).toEqual("Validation error for [1]: Width must be greater than 0");
});
test("invalid width (high) inputPort", () => {
    const inputPort: RawInputPort = {
        id: 1,
        width: MAX_WIREVALUE_WIDTH * 2,
        bind: { id: 3 },
        type: ObjectTypes.INPUT_PORT
    };
    const module: RawModule<any> = {
        id: 3,
        inputs: [],
        outputs: [],
        initialState: {},
        moduleType: ModuleType.DEFAULT,
        tick: () => ({}),
        type: ObjectTypes.MODULE
    };
    const result = validateNet([inputPort, module]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(inputPort);
    expect(result![0].message).toEqual(`Validation error for [1]: Width must be less than or equal to ${MAX_WIREVALUE_WIDTH}`);
});
test("invalid width (low) outputPort", () => {
    const outputPort: RawOutputPort = {
        id: 1,
        width: 0,
        bind: { id: 3 },
        type: ObjectTypes.OUTPUT_PORT
    };
    const network: RawNetwork = {
        id: 3,
        outputs: [],
        width: 1,
        type: ObjectTypes.NETWORK
    };
    const result = validateNet([outputPort, network]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(outputPort);
    expect(result![0].message).toEqual("Validation error for [1]: Width must be greater than 0");
});
test("invalid width (low) network", () => {
    const network: RawNetwork = {
        id: 1,
        width: 0,
        outputs: [],
        type: ObjectTypes.NETWORK
    };
    const result = validateNet([network]);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(1);
    expect(result![0].affects).toContain(network);
    expect(result![0].message).toEqual("Validation error for [1]: Width must be greater than 0");
});

/** Comprehensive tests */
test("single ref chain", () => {
    const module1 = createRawCopyModule(1, [], [0]);
    const module1Output = createRawOutputPort(0, 16, 10);
    const network = createRawNetwork(10, 16, [20]);
    const module2Input = createRawInputPort(20, 16, 21);
    const module2 = createRawCopyModule(21, [20], []);

    const elements = [module1Output, module1, network, module2Input, module2];
    const result = validateNet(elements);
    expect(result).toBeNull();
});
test("multiple ref chains", () => {
    const module1 = createRawCopyModule(0, [], [1, 2]);
    const module1Output1 = createRawOutputPort(1, 16, 10);
    const module1Output2 = createRawOutputPort(2, 16, 11);
    const network1 = createRawNetwork(10, 16, [20]);
    const network2 = createRawNetwork(11, 16, [21]);
    const module2Input1 = createRawInputPort(20, 16, 22);
    const module2Input2 = createRawInputPort(21, 16, 22);
    const module2 = createRawCopyModule(22, [20, 21], []);

    const elements = [module1Output1, module1Output2, module1, network1, network2, module2Input1, module2Input2, module2];
    const result = validateNet(elements);
    expect(result).toBeNull();
});
test("circular dependency", () => {
    const module1Input = createRawInputPort(0, 16, 1);
    const module1 = createRawCopyModule(1, [0], [2]);
    const module1Output = createRawOutputPort(2, 16, 3);
    const network = createRawNetwork(3, 16, [0]);

    const elements = [module1Input, module1, module1Output, network];
    const result = validateNet(elements);
    expect(result).toBeNull();
});