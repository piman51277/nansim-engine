import { createRawCopyModule, createRawInputModule, createRawInputPort, createRawNetwork, createRawOutputModule, createRawOutputPort } from "../common";
import type { InputModule, Module, OutputModule } from "../../src/core/Module";
import { ModuleType, ObjectTypes } from "../../src/types";
import { Engine } from '../../src/core/Engine';
import { ExtraInputError } from "../../src/core/errors/ExtraInputError";
import { InfiniteLoopError } from "../../src/core/errors/InfiniteLoopError";
import { InvalidInputError } from "../../src/core/errors/InvalidInputError";
import { linkNet } from '../../src/io/linkNet';
import { MissingInputError } from "../../src/core/errors/MissingInputError";
import type { RawObject } from "../../src/types";
import { ShortCircuitError } from "../../src/core/errors/ShortCircuitError";

/**
 * Creates a sample (raw) network with two inputs, a copy module, and two outputs
 * @returns {*} {RawObject[]}
 */
function createSampleNet0(): RawObject[] {
    //two inputs
    const input0 = createRawInputModule(0, 1, 16);
    const port0 = createRawOutputPort(1, 16, 2);
    const net0 = createRawNetwork(2, 16, [10]);

    const input1 = createRawInputModule(3, 4, 16);
    const port1 = createRawOutputPort(4, 16, 5);
    const net1 = createRawNetwork(5, 16, [11]);

    //2 -> 2 copy module
    const iPort1 = createRawInputPort(10, 16, 12);
    const iPort2 = createRawInputPort(11, 16, 12);
    const module = createRawCopyModule(12, [10, 11], [13, 14]);
    const oPort1 = createRawOutputPort(13, 16, 20);
    const oPort2 = createRawOutputPort(14, 16, 23);

    //two outputs
    const oNet1 = createRawNetwork(20, 16, [21]);
    const iPort3 = createRawInputPort(21, 16, 22);
    const out0 = createRawOutputModule(22, 21, 16);

    const oNet2 = createRawNetwork(23, 16, [24]);
    const iPort4 = createRawInputPort(24, 16, 25);
    const out1 = createRawOutputModule(25, 24, 16);

    return [
        input0,
        port0,
        net0,
        input1,
        port1,
        net1,
        iPort1,
        iPort2,
        module,
        oPort1,
        oPort2,
        oNet1,
        iPort3,
        out0,
        oNet2,
        iPort4,
        out1
    ];
}

/**
 * Creates a sample (raw) network that is capable of triggering a short circuit
 * @returns {*}  {RawObject[]}
 */
function createShortCircuitNetwork0(): RawObject[] {

    //two inputs
    const input0 = createRawInputModule(0, 1, 16);
    const port0 = createRawOutputPort(1, 16, 2);
    const net0 = createRawNetwork(2, 16, [10]);

    const input1 = createRawInputModule(3, 4, 16);
    const port1 = createRawOutputPort(4, 16, 5);
    const net1 = createRawNetwork(5, 16, [11]);

    //2 -> 2 copy module
    const iPort1 = createRawInputPort(10, 16, 12);
    const iPort2 = createRawInputPort(11, 16, 12);
    const module = createRawCopyModule(12, [10, 11], [13, 14]);
    const oPort1 = createRawOutputPort(13, 16, 20);
    const oPort2 = createRawOutputPort(14, 16, 20);

    //two outputs
    const oNet1 = createRawNetwork(20, 16, [21]);
    const iPort3 = createRawInputPort(21, 16, 22);
    const out0 = createRawOutputModule(22, 21, 16);

    return [
        input0,
        port0,
        net0,
        input1,
        port1,
        net1,
        iPort1,
        iPort2,
        module,
        oPort1,
        oPort2,
        oNet1,
        iPort3,
        out0
    ];
}

/**
 * Creates a sample (raw) network that will trigger an infinite loop
 * @returns {*}  {RawObject[]}
 */
function createInfiniteLoop0(): RawObject[] {

    //one input
    const input0 = createRawInputModule(0, 1, 16);
    const port0 = createRawOutputPort(1, 16, 2);
    const net0 = createRawNetwork(2, 16, [11]);

    //1 -> 1 copy module
    const iPort2 = createRawInputPort(11, 16, 12);
    const module = createRawCopyModule(12, [11], [13]);
    const oPort1 = createRawOutputPort(13, 16, 2);

    return [
        input0,
        port0,
        net0,
        iPort2,
        module,
        oPort1
    ];
}


test("constructor", () => {
    const rawNet = createSampleNet0();
    const linked = linkNet(rawNet);
    const engine = new Engine(linked);

    //check the type of each object
    expect(engine.getObject(0)?.type).toBe(ObjectTypes.MODULE);
    expect((engine.getObject(0) as Module)?.moduleType).toBe(ModuleType.INPUT);
    expect(engine.getObject(1)?.type).toBe(ObjectTypes.OUTPUT_PORT);
    expect(engine.getObject(2)?.type).toBe(ObjectTypes.NETWORK);

    expect(engine.getObject(3)?.type).toBe(ObjectTypes.MODULE);
    expect((engine.getObject(3) as Module)?.moduleType).toBe(ModuleType.INPUT);
    expect(engine.getObject(4)?.type).toBe(ObjectTypes.OUTPUT_PORT);
    expect(engine.getObject(5)?.type).toBe(ObjectTypes.NETWORK);

    expect(engine.getObject(10)?.type).toBe(ObjectTypes.INPUT_PORT);
    expect(engine.getObject(11)?.type).toBe(ObjectTypes.INPUT_PORT);
    expect(engine.getObject(12)?.type).toBe(ObjectTypes.MODULE);
    expect((engine.getObject(12) as Module)?.moduleType).toBe(ModuleType.DEFAULT);
    expect(engine.getObject(13)?.type).toBe(ObjectTypes.OUTPUT_PORT);
    expect(engine.getObject(14)?.type).toBe(ObjectTypes.OUTPUT_PORT);

    expect(engine.getObject(20)?.type).toBe(ObjectTypes.NETWORK);
    expect(engine.getObject(21)?.type).toBe(ObjectTypes.INPUT_PORT);
    expect(engine.getObject(22)?.type).toBe(ObjectTypes.MODULE);
    expect((engine.getObject(22) as Module)?.moduleType).toBe(ModuleType.OUTPUT);

    expect(engine.getObject(23)?.type).toBe(ObjectTypes.NETWORK);
    expect(engine.getObject(24)?.type).toBe(ObjectTypes.INPUT_PORT);
    expect(engine.getObject(25)?.type).toBe(ObjectTypes.MODULE);
    expect((engine.getObject(25) as Module)?.moduleType).toBe(ModuleType.OUTPUT);
});

test("passInputs extra inputs", () => {
    const rawNet = createSampleNet0();
    const linked = linkNet(rawNet);
    const engine = new Engine(linked);

    const inputs = new Map<number, Uint8Array>();
    inputs.set(99, new Uint8Array([0, 1, 2]));

    expect(() => engine.passInputs(inputs)).toThrow(ExtraInputError);
});

test("passInputs invalid input", () => {
    const rawNet = createSampleNet0();
    const linked = linkNet(rawNet);
    const engine = new Engine(linked);

    const inputs = new Map<number, Uint8Array>();
    inputs.set(0, new Uint8Array([0, 1, 2]));

    expect(() => engine.passInputs(inputs)).toThrow(InvalidInputError);
});

test("passInputs missing input", () => {
    const rawNet = createSampleNet0();
    const linked = linkNet(rawNet);
    const engine = new Engine(linked);

    const inputs = new Map<number, Uint8Array>();
    inputs.set(0, new Uint8Array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]));

    expect(() => engine.passInputs(inputs)).toThrow(MissingInputError);
});

test("passInputs valid input", () => {
    const rawNet = createSampleNet0();
    const linked = linkNet(rawNet);
    const engine = new Engine(linked);

    const inputs = new Map<number, Uint8Array>();
    const data0 = new Uint8Array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
    const data1 = new Uint8Array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);

    inputs.set(0, data0);
    inputs.set(3, data1);

    engine.passInputs(inputs);

    expect((engine.getObject(0) as InputModule)?.state?.data).toEqual(data0);
    expect((engine.getObject(3) as InputModule)?.state?.data).toEqual(data1);
});

test("evaluate", () => {
    const rawNet = createSampleNet0();
    const linked = linkNet(rawNet);
    const engine = new Engine(linked);

    const inputs = new Map<number, Uint8Array>();
    const data0 = new Uint8Array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
    const data1 = new Uint8Array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);

    inputs.set(0, data0);
    inputs.set(3, data1);

    engine.passInputs(inputs);
    engine.evaluate();

    expect((engine.getObject(22) as OutputModule)?.get().data).toEqual(data0);
    expect((engine.getObject(25) as OutputModule)?.get().data).toEqual(data1);
});

test("evaluate short circuit 1", () => {
    const rawNet = createShortCircuitNetwork0();
    const linked = linkNet(rawNet);
    const engine = new Engine(linked);

    const inputs = new Map<number, Uint8Array>();
    const data0 = new Uint8Array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
    const data1 = new Uint8Array([1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]);

    inputs.set(0, data0);
    inputs.set(3, data1);

    engine.passInputs(inputs);
    expect(() => {
        engine.evaluate();
    }).toThrow(ShortCircuitError);

    try {
        engine.evaluate();
    }
    catch (e: any) {
        expect(e.affects.length).toBe(1);
        expect(e.affects[0].id).toBe(20);
        expect(e.message).toEqual("Runtime Error affecting [20]: Short circuit detected");
    }
});

test("evaluate overlapping non-short circuit", () => {
    const rawNet = createShortCircuitNetwork0();
    const linked = linkNet(rawNet);
    const engine = new Engine(linked);

    const inputs = new Map<number, Uint8Array>();
    const data0 = new Uint8Array([0, 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2]);
    const data1 = new Uint8Array([0, 0, 0, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0]);
    const expectedOut = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    inputs.set(0, data0);
    inputs.set(3, data1);

    engine.passInputs(inputs);
    expect(() => {
        engine.evaluate();
    }).not.toThrow();

    expect((engine.getObject(22) as OutputModule)?.get().data).toEqual(expectedOut);
});

test("evaluate infinite loop 1", () => {
    const rawNet = createInfiniteLoop0();
    const linked = linkNet(rawNet);

    const engine = new Engine(linked);

    const input = new Uint8Array([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
    const inputs = new Map<number, Uint8Array>();
    inputs.set(0, input);

    engine.passInputs(inputs);
    expect(() => {
        engine.evaluate();
    }).toThrow(InfiniteLoopError);

    try {
        engine.evaluate();
    }
    catch (e: any) {
        expect(e.affects.length).toBe(1);
        expect(e.affects[0].id).toBe(2);
        expect(e.message).toEqual("Runtime Error affecting [2]: Infinite loop detected");
    }
});



//TODO: create circuits for infinite loops