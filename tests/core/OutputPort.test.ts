import { Network } from "../../src/core/Network";
import { OutputPort } from "../../src/core/OutputPort";

test("constructor with bind", () => {
    const network = new Network(0, 16, []);
    const port = new OutputPort(1, { id: 0, val: network });

    expect(port.id).toBe(1);
    expect(port.bind.id).toBe(0);
    expect(port.bind.val).toBe(network);
    expect(port.set).toBeDefined();
});

test("constructor without bind", () => {
    const port = new OutputPort(1);

    expect(port.id).toBe(1);
    expect(port.bind.id).toBe(-1);
    expect(port.bind.val).toBe(null);
    expect(port.set).toBeDefined();
});

test("setBinding", () => {
    const network = new Network(0, 16, []);
    const port = new OutputPort(1);
    expect(port.bind.id).toBe(-1);
    expect(port.bind.val).toBe(null);

    port.setBinding({ id: 0, val: network });
    expect(port.bind.id).toBe(0);
    expect(port.bind.val).toBe(network);
});