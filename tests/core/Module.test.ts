import { InputPort } from "../../src/core/InputPort";
import { Module } from '../../src/core/Module';
import { OutputPort } from "../../src/core/OutputPort";
import { ModuleType } from "../../src/types";

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