import { InputPort } from "../../src/core/InputPort";
import { Network } from "../../src/core/Network";
import { WireValue } from "../../src/core/WireValue";

test("constructor (empty)", () => {
    const net = new Network(0, 16, []);
    expect(net.id).toBe(0);
    expect(net.outputs).toEqual([]);
});

test("constructor (with outputs)", () => {
    const output = new InputPort(0, 16);
    const net = new Network(0, 16, [output]);
    expect(net.id).toBe(0);
    expect(net.outputs).toEqual([output]);
});

test("binds", () => {
    const output = new InputPort(0, 16);
    const net = new Network(0, 16, [output]);
    net.setBinds();

    const emptyData = (WireValue.unknown(16)).data;
    expect(output.value.data).toEqual(emptyData);

    const testData = WireValue.unknown(16);
    testData.data.fill(1);
    net.set(testData);

    expect(output.value.data).toEqual(testData.data);
});
