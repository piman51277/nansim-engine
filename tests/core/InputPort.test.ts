import { Module } from '../../src/core/Module';
import { ModuleType } from '../../src/types';
import { InputPort } from '../../src/core/InputPort';
import { WireValue } from '../../src/core/WireValue';
test("constructor with bind", () => {
    const module = new Module(0, [], [], ModuleType.DEFAULT, () => null, null);
    const port = new InputPort(1, 16, { id: 0, val: module });

    expect(port.id).toBe(1);
    expect(port.bind.id).toBe(0);
    expect(port.bind.val).toBe(module);
    expect(port.value.width).toBe(16);

    const expectedData = (WireValue.unknown(16)).data;
    expect(port.value.data).toEqual(expectedData);
});

test("constructor without bind", () => {
    const port = new InputPort(1, 16);

    expect(port.id).toBe(1);
    expect(port.bind.id).toBe(-1);
    expect(port.bind.val).toBe(null);
    expect(port.value.width).toBe(16);

    const expectedData = (WireValue.unknown(16)).data;
    expect(port.value.data).toEqual(expectedData);
});

test("setBinding", () => {
    const module = new Module(0, [], [], ModuleType.DEFAULT, () => null, null);
    const port = new InputPort(1, 16);
    expect(port.bind.id).toBe(-1);
    expect(port.bind.val).toBe(null);

    port.setBinding({ id: 0, val: module });
    expect(port.bind.id).toBe(0);
    expect(port.bind.val).toBe(module);
});

test("reset", () => {
    const port = new InputPort(1, 4);
    const data = new Uint8Array([1, 2, 3, 4]);
    port.value.data = data;

    port.reset();

    const expectedData = (WireValue.unknown(4)).data;
    expect(port.value.data).toEqual(expectedData);
});