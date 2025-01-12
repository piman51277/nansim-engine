
import { createRawCopyModule, createRawInputPort, createRawNetwork, createRawOutputPort } from "../common";
import { ModuleType, ObjectTypes } from "../../src/types";
import type { InputPort } from "../../src/core/InputPort";
import { linkNet } from "../../src/io/linkNet";
import type { Module } from "../../src/core/Module";
import type { Network } from "../../src/core/Network";
import type { OutputPort } from "../../src/core/OutputPort";

test("InputPort <-> Module", () => {
    const module = createRawCopyModule(0, [1], []);
    const input = createRawInputPort(1, 16, 0);
    const arr = [module, input];

    const result = linkNet(arr);

    //check if the input was generated correctly
    const inputObj = result.get(1) as InputPort;
    expect(inputObj).not.toBeUndefined();
    expect(inputObj?.type).toBe(ObjectTypes.INPUT_PORT);
    expect(inputObj?.id).toBe(1);
    expect(inputObj?.bind.id).toBe(0);
    expect(inputObj?.value.width).toBe(16);

    //check if the module was generated correctly
    const moduleObj = result.get(0) as Module;
    expect(moduleObj).not.toBeUndefined();
    expect(moduleObj?.type).toBe(ObjectTypes.MODULE);
    expect(moduleObj?.id).toBe(0);
    expect(moduleObj?.inputs.length).toBe(1);
    expect(moduleObj?.outputs.length).toBe(0);
    expect(moduleObj?.moduleType).toBe(ModuleType.DEFAULT);
    expect(moduleObj?.state).toBeNull();

    //check if the bindings were set correctly
    expect(moduleObj?.inputs[0]).toBe(inputObj);
    expect(inputObj?.bind.val).toBe(moduleObj);
});

test("Module -> OutputPort -> Network", () => {
    const module = createRawCopyModule(0, [], [1]);
    const output = createRawOutputPort(1, 16, 2);
    const network = createRawNetwork(2, 16, []);
    const arr = [module, output, network];

    const result = linkNet(arr);

    //check if the module was generated correctly
    const moduleObj = result.get(0) as Module;
    expect(moduleObj).not.toBeUndefined();
    expect(moduleObj?.type).toBe(ObjectTypes.MODULE);
    expect(moduleObj?.id).toBe(0);
    expect(moduleObj?.inputs.length).toBe(0);
    expect(moduleObj?.outputs.length).toBe(1);
    expect(moduleObj?.moduleType).toBe(ModuleType.DEFAULT);
    expect(moduleObj?.state).toBeNull();

    //check if the output was generated correctly
    const outputObj = result.get(1) as OutputPort;
    expect(outputObj).not.toBeUndefined();
    expect(outputObj?.type).toBe(ObjectTypes.OUTPUT_PORT);
    expect(outputObj?.id).toBe(1);
    expect(outputObj?.bind.id).toBe(2);

    //check if the network was generated correctly
    const networkObj = result.get(2) as Network;
    expect(networkObj).not.toBeUndefined();
    expect(networkObj?.type).toBe(ObjectTypes.NETWORK);
    expect(networkObj?.id).toBe(2);
    expect(networkObj?.outputs.length).toBe(0);

    //check if the bindings were set correctly
    expect(moduleObj?.outputs[0]).toBe(outputObj);
    expect(outputObj?.bind.val).toBe(networkObj);
});

test("Network <-> InputPort <-> Module", () => {
    const network = createRawNetwork(0, 16, [1]);
    const input = createRawInputPort(1, 16, 2);
    const module = createRawCopyModule(2, [1], []);

    const arr = [network, input, module];

    const result = linkNet(arr);

    //check if the network was generated correctly
    const networkObj = result.get(0) as Network;
    expect(networkObj).not.toBeUndefined();
    expect(networkObj?.type).toBe(ObjectTypes.NETWORK);
    expect(networkObj?.id).toBe(0);
    expect(networkObj?.outputs.length).toBe(1);

    //check if the input was generated correctly
    const inputObj = result.get(1) as InputPort;
    expect(inputObj).not.toBeUndefined();
    expect(inputObj?.type).toBe(ObjectTypes.INPUT_PORT);
    expect(inputObj?.id).toBe(1);
    expect(inputObj?.bind.id).toBe(2);

    //check if the module was generated correctly
    const moduleObj = result.get(2) as Module;
    expect(moduleObj).not.toBeUndefined();
    expect(moduleObj?.type).toBe(ObjectTypes.MODULE);
    expect(moduleObj?.id).toBe(2);
    expect(moduleObj?.inputs.length).toBe(1);
    expect(moduleObj?.outputs.length).toBe(0);
    expect(moduleObj?.moduleType).toBe(ModuleType.DEFAULT);
    expect(moduleObj?.state).toBeNull();

    //check if the bindings were set correctly
    expect(networkObj?.outputs[0]).toBe(inputObj);
    expect(inputObj?.bind.val).toBe(moduleObj);
    expect(moduleObj?.inputs[0]).toBe(inputObj);
});