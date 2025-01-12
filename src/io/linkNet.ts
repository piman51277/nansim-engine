import { type IEngineObject, ObjectTypes, type RawObject } from "../types";
import type { RawModule, RawNetwork } from "../types";
import { InputPort } from "../core/InputPort";
import { Module } from "../core/Module";
import { Network } from "../core/Network";
import { OutputPort } from "../core/OutputPort";

/**
 * Links raw objects into an engine-usable form. Assumed valid input.
 * @param {RawObject[]} arr array of raw objects
 * @returns {*}  {IEngineObject[]}
 */
export function linkNet(arr: RawObject[]): Map<number, IEngineObject> {
    //Stage 1: Convert raw objects to engine objects without bindings
    const rawObjects: Record<number, RawObject> = {};
    const mappings: Map<number, IEngineObject> = new Map();
    for (const obj of arr) {
        if (obj.type == ObjectTypes.INPUT_PORT) {
            mappings.set(obj.id, new InputPort(obj.id, obj.width, {
                id: obj.bind.id,
                val: null
            }));
        }
        else if (obj.type == ObjectTypes.OUTPUT_PORT) {
            mappings.set(obj.id, new OutputPort(obj.id, {
                id: obj.bind.id,
                val: null
            }));
        }
        else if (obj.type == ObjectTypes.MODULE) {
            mappings.set(obj.id, new Module(obj.id, [], [], obj.moduleType, obj.tick, obj.initialState));
        }
        else if (obj.type == ObjectTypes.NETWORK) {
            mappings.set(obj.id, new Network(obj.id, obj.width, []));
        }
        rawObjects[obj.id] = obj;
    }

    //Stage 2: for each object, link bindings
    for (const [id, engineObj] of mappings) {
        if (engineObj.type == ObjectTypes.INPUT_PORT) {
            const boundModule = mappings.get(engineObj.bind.id);
            engineObj.bind.val = boundModule as Module;
        }
        else if (engineObj.type == ObjectTypes.OUTPUT_PORT) {
            const boundNetwork = mappings.get(engineObj.bind.id);
            engineObj.bind.val = boundNetwork as Network;
        }
        else if (engineObj.type == ObjectTypes.MODULE) {
            const module = engineObj as Module;
            const rawObj = rawObjects[id] as RawModule<any>;
            for (const input of rawObj.inputs) {
                const boundInput = mappings.get(input.id);
                module.inputs.push(boundInput as InputPort);
            }
            for (const output of rawObj.outputs) {
                const boundOutput = mappings.get(output.id);
                module.outputs.push(boundOutput as OutputPort);
            }
            module.setBinds();
        }
        else if (engineObj.type == ObjectTypes.NETWORK) {
            const network = engineObj as Network;
            const rawObj = rawObjects[id] as RawNetwork;
            for (const output of rawObj.outputs) {
                const boundInput = mappings.get(output.id);
                network.outputs.push(boundInput as InputPort);
            }
            network.setBinds();
        }
    }

    return mappings;
}