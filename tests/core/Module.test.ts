import { InputModule, Module, OutputModule } from '../../src/core/Module';
import { InputPort } from "../../src/core/InputPort";
import { ModuleType } from "../../src/types";
import { Network } from "../../src/core/Network";
import { OutputPort } from "../../src/core/OutputPort";
import { WireValue } from "../../src/core/WireValue";

// base Module class
test("constructor (empty)", () => {
    const sampleState = { "key": "value" };
    const sampleState1 = { "key1": "value1" };

    const module = new Module(0, [], [], ModuleType.DEFAULT, () => {
        return sampleState1;
    }, sampleState);

    expect(module.id).toBe(0);
    expect(module.inputs).toEqual([]);
    expect(module.outputs).toEqual([]);
    expect(module.moduleType).toBe(ModuleType.DEFAULT);
    expect(module.state).toEqual(sampleState);
    expect(module.resetState).toEqual(sampleState);
    expect(module.tickFn([], [], sampleState)).toEqual(sampleState1);
});

test("constructor (inputs only)", () => {
    const iPort = new InputPort(0, 16);
    const sampleState = { "key": "value" };
    const sampleState1 = { "key1": "value1" };

    const module = new Module(0, [iPort], [], ModuleType.DEFAULT, () => {
        return sampleState1;
    }, sampleState);

    expect(module.id).toBe(0);
    expect(module.inputs).toEqual([iPort]);
    expect(module.outputs).toEqual([]);
    expect(module.moduleType).toBe(ModuleType.DEFAULT);
    expect(module.state).toEqual(sampleState);
    expect(module.resetState).toEqual(sampleState);
    expect(module.tickFn([iPort.value], [], sampleState)).toEqual(sampleState1);
});

test("constructor (outputs only)", () => {
    const oPort = new OutputPort(0);
    const sampleState = { "key": "value" };
    const sampleState1 = { "key1": "value1" };

    const module = new Module(0, [], [oPort], ModuleType.DEFAULT, () => {
        return sampleState1;
    }, sampleState);

    expect(module.id).toBe(0);
    expect(module.inputs).toEqual([]);
    expect(module.outputs).toEqual([oPort]);
    expect(module.moduleType).toBe(ModuleType.DEFAULT);
    expect(module.state).toEqual(sampleState);
    expect(module.resetState).toEqual(sampleState);
    expect(module.tickFn([], [oPort], sampleState)).toEqual(sampleState1);
});

test("constructor (inputs and outputs)", () => {
    const iPort = new InputPort(0, 16);
    const oPort = new OutputPort(0);
    const sampleState = { "key": "value" };
    const sampleState1 = { "key1": "value1" };

    const module = new Module(0, [iPort], [oPort], ModuleType.DEFAULT, () => {
        return sampleState1;
    }, sampleState);

    expect(module.id).toBe(0);
    expect(module.inputs).toEqual([iPort]);
    expect(module.outputs).toEqual([oPort]);
    expect(module.moduleType).toBe(ModuleType.DEFAULT);
    expect(module.state).toEqual(sampleState);
    expect(module.resetState).toEqual(sampleState);
    expect(module.tickFn([iPort.value], [oPort], sampleState)).toEqual(sampleState1);
});

test("tick", () => {
    const sampleState = { "key": "value" };
    const sampleState1 = { "key1": "value1" };

    const module = new Module(0, [], [], ModuleType.DEFAULT, () => {
        return sampleState1;
    }, sampleState);
    expect(module.state).toEqual(sampleState);
    module.tick();
    expect(module.state).toEqual(sampleState1);
});

test("reset", () => {
    const sampleState = { "key": "value" };
    const sampleState1 = { "key1": "value1" };

    const module = new Module(0, [], [], ModuleType.DEFAULT, () => {
        return sampleState1;
    }, sampleState);
    expect(module.state).toEqual(sampleState);
    module.tick();
    expect(module.state).toEqual(sampleState1);
    module.reset();
    expect(module.state).toEqual(sampleState);
});

test("bindings", () => {
    const iPort = new InputPort(0, 16);
    const module = new Module(0, [iPort], [], ModuleType.DEFAULT, (a) => a[0], new Uint8Array(16));
    module.setBinds();
    module.tick();
    expect(module.state).toEqual(iPort.value);
    iPort.value.data[0] = 1;
    module.tick();
    expect(module.state).toEqual(iPort.value);
});


// InputModule subclass
test("input module constructor", () => {
    const output = new OutputPort(0);
    const module = new InputModule(0, [output], 16);

    expect(module.id).toBe(0);
    expect(module.inputs).toEqual([]);
    expect(module.outputs).toEqual([output]);
    expect(module.moduleType).toBe(ModuleType.INPUT);

    const sampleState = WireValue.unknown(16);
    expect(module.state).toEqual(sampleState);
    expect(module.resetState).toEqual(sampleState);
    expect(module.tickFn([], [], null)).toEqual(undefined);
});

test("input module set", () => {
    const testInput = new InputPort(0, 16);
    const testNet = new Network(1, 16, [testInput]);
    const testOutput = new OutputPort(2, { id: 1, val: testNet });
    const module = new InputModule(0, [testOutput], 16);
    testNet.setBinds();
    module.setBinds();

    expect(testInput.value).toEqual(WireValue.unknown(16));
    expect(module.state).toEqual(WireValue.unknown(16));

    const sendValue = WireValue.unknown(16);
    sendValue.data[0] = 1;
    module.set(sendValue);

    expect(testInput.value).toEqual(sendValue);
});

test("input module tick", () => {
    const testInput = new InputPort(0, 16);
    const testNet = new Network(1, 16, [testInput]);
    const testOutput = new OutputPort(2, { id: 1, val: testNet });
    const module = new InputModule(0, [testOutput], 16);
    testNet.setBinds();
    module.setBinds();

    expect(testInput.value).toEqual(WireValue.unknown(16));
    expect(module.state).toEqual(WireValue.unknown(16));

    const sendValue = WireValue.unknown(16);
    sendValue.data[0] = 1;
    module.state = sendValue;
    module.tick();

    expect(testInput.value).toEqual(sendValue);
});

// OutputModule subclass
test("output module constructor", () => {
    const input = new InputPort(0, 16);
    const module = new OutputModule(0, [input], 16);

    expect(module.id).toBe(0);
    expect(module.inputs).toEqual([input]);
    expect(module.outputs).toEqual([]);
    expect(module.moduleType).toBe(ModuleType.OUTPUT);

    const sampleState = WireValue.unknown(16);
    expect(module.state).toEqual(sampleState);
    expect(module.resetState).toEqual(sampleState);
    expect(module.tickFn([], [], null)).toEqual(undefined);
});

test("output module get", () => {
    const module = new OutputModule(0, [], 16);
    module.state.data[0] = 1;

    expect(module.get()).toEqual(module.state);
});

test("output module tick", () => {
    const input = new InputPort(0, 16);
    const module = new OutputModule(0, [input], 16);

    expect(module.state).toEqual(WireValue.unknown(16));
    expect(input.value).toEqual(WireValue.unknown(16));

    const sendValue = WireValue.unknown(16);
    sendValue.data[0] = 1;
    input.value = sendValue;
    module.tick();

    expect(module.state).toEqual(sendValue);
});