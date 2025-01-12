import { InfiniteLoopError } from "../../src/core/errors/InfiniteLoopError";
import { InputPort } from "../../src/core/InputPort";
import { MAX_NETWORK_UPDATE_COUNT } from "../../src/constants";
import { Network } from "../../src/core/Network";
import { OutputPort } from "../../src/core/OutputPort";
import { ShortCircuitError } from "../../src/core/errors/ShortCircuitError";
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
    net.set(testData, 0);

    expect(output.value.data).toEqual(testData.data);
});

//tests for short circuit detection
test("single input single write", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(0, 4, [outputReader]);
    const writer = new OutputPort(1, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    writer.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 0])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 2, 0]));
});
test("single input multiple writes", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(1, 4, [outputReader]);
    const writer = new OutputPort(2, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    writer.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 0])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 2, 0]));
    writer.set(WireValue.fromData(4, new Uint8Array([2, 2, 0, 2])));
    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 0, 2]));
    writer.set(WireValue.fromData(4, new Uint8Array([1, 1, 1, 1])));
    expect(outputReader.value.data).toEqual(new Uint8Array([1, 1, 1, 1]));
});
test("2 inputs no conflicts", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(1, 4, [outputReader]);
    const writer1 = new OutputPort(2, { id: 0, val: net });
    const writer2 = new OutputPort(3, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    writer1.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 2])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 2, 2]));
    writer2.set(WireValue.fromData(4, new Uint8Array([2, 2, 0, 1])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 0, 1]));
    writer1.set(WireValue.fromData(4, new Uint8Array([1, 0, 2, 2])));
    expect(outputReader.value.data).toEqual(new Uint8Array([1, 0, 0, 1]));
    writer1.set(WireValue.fromData(4, new Uint8Array([0, 1, 0, 1])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 0, 1]));
});
test("3 inputs no conflicts", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(1, 4, [outputReader]);
    const writer1 = new OutputPort(2, { id: 0, val: net });
    const writer2 = new OutputPort(3, { id: 0, val: net });
    const writer3 = new OutputPort(4, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    writer1.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 2])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 2, 2]));
    writer2.set(WireValue.fromData(4, new Uint8Array([2, 2, 0, 1])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 0, 1]));
    writer3.set(WireValue.fromData(4, new Uint8Array([0, 2, 2, 1])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 0, 1]));
    writer3.set(WireValue.fromData(4, new Uint8Array([0, 1, 0, 1])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 0, 1]));

});
test("multiple input conflict from update", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(1, 4, [outputReader]);
    const writer1 = new OutputPort(2, { id: 0, val: net });
    const writer2 = new OutputPort(3, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    writer1.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 2])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 2, 2]));
    writer2.set(WireValue.fromData(4, new Uint8Array([2, 2, 0, 1])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 0, 1]));
    expect(() => {
        writer2.set(WireValue.fromData(4, new Uint8Array([1, 0, 1, 0])));
    }).toThrow(ShortCircuitError);
});
test("multiple input conflict from new", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(1, 4, [outputReader]);
    const writer1 = new OutputPort(2, { id: 0, val: net });
    const writer2 = new OutputPort(3, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    writer1.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 2])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 2, 2]));
    expect(() => {
        writer2.set(WireValue.fromData(4, new Uint8Array([1, 0, 1, 0])));
    }).toThrow(ShortCircuitError);
});
test("stat reset no conflict", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(1, 4, [outputReader]);
    const writer1 = new OutputPort(2, { id: 0, val: net });
    const writer2 = new OutputPort(3, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    writer1.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 2])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 2, 2]));
    writer2.set(WireValue.fromData(4, new Uint8Array([2, 2, 0, 1])));
    expect(outputReader.value.data).toEqual(new Uint8Array([0, 1, 0, 1]));
    net.resetStats();
    writer2.set(WireValue.fromData(4, new Uint8Array([1, 0, 1, 0])));
    expect(outputReader.value.data).toEqual(new Uint8Array([1, 0, 1, 0]));
});

//tests for infinite loop detection
test("infinite loop single input", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(0, 4, [outputReader]);
    const writer = new OutputPort(1, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    expect(() => {
        for (let i = 0; i < MAX_NETWORK_UPDATE_COUNT * 0.6; i++) {
            writer.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 0])));
            writer.set(WireValue.fromData(4, new Uint8Array([2, 2, 0, 1])));
        }
    }).toThrow(InfiniteLoopError);
});
test("infinite loop multiple inputs", () => {
    const outputReader = new InputPort(0, 4);
    const net = new Network(0, 4, [outputReader]);
    const writer1 = new OutputPort(1, { id: 0, val: net });
    const writer2 = new OutputPort(2, { id: 0, val: net });
    net.setBinds();

    expect(outputReader.value.data).toEqual(new Uint8Array([2, 2, 2, 2]));
    expect(() => {
        for (let i = 0; i < MAX_NETWORK_UPDATE_COUNT * 0.3; i++) {
            writer1.set(WireValue.fromData(4, new Uint8Array([0, 1, 2, 2])));
            writer2.set(WireValue.fromData(4, new Uint8Array([2, 2, 0, 1])));
            writer1.set(WireValue.fromData(4, new Uint8Array([1, 0, 2, 2])));
            writer2.set(WireValue.fromData(4, new Uint8Array([2, 2, 0, 1])));
        }
    }).toThrow(InfiniteLoopError);
});