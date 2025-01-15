import { Engine } from "./core/Engine";
import { EngineRuntimeError } from "./core/errors/EngineRuntimeError";
import { ExtraInputError } from "./core/errors/ExtraInputError";
import { InfiniteLoopError } from "./core/errors/InfiniteLoopError";
import { InputPort } from "./core/InputPort";
import { InvalidInputError } from "./core/errors/InvalidInputError";
import { MissingInputError } from "./core/errors/MissingInputError";
import { Module } from "./core/Module";
import { Network } from "./core/Network";
import { OutputPort } from "./core/OutputPort";
import { ShortCircuitError } from "./core/errors/ShortCircuitError";
import { WireValue } from "./core/WireValue";

//These exports are mainly for type checking inputs,
//although they can be used to create simplified engines
export const Core = {
    EngineInputPort: InputPort,
    EngineModule: Module,
    EngineNetwork: Network,
    EngineOutputPort: OutputPort,
    EngineWireValue: WireValue,
    Engine: Engine
};

//errors
export const Errors = {
    EngineRuntimeError,
    ExtraInputError,
    InfiniteLoopError,
    MissingInputError,
    InvalidInputError,
    ShortCircuitError
};

//types
export type { IWireValue as EngineWireValue, RawBinding as EngineRawBinding, RawInputPort as EngineRawInputPort, RawOutputPort as EngineRawOutputPort, Setable as EngineSetable, ModuleTickFn as EngineModuleTickFn, RawModule as EngineRawModule, RawNetwork as EngineRawNetwork, RawObject as EngineRawObject } from './types';
export { ModuleType as EngineModuleType, ObjectTypes as EngineObjectTypes } from "./types";