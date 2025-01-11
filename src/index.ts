import { InputPort } from "./core/InputPort";
import { Module } from "./core/Module";
import { Network } from "./core/Network";
import { OutputPort } from "./core/OutputPort";
import { WireValue } from "./core/WireValue";

//These exports are mainly for type checking inputs,
//although they can be used to create simplified engines
export const Core = {
    EngineInputPort: InputPort,
    EngineModule: Module,
    EngineNetwork: Network,
    EngineOutputPort: OutputPort,
    EngineWireValue: WireValue
};
export {
    IWireValue as EngineWireValue,
    RawBinding as EngineRawBinding,
    RawInputPort as EngineRawInputPort,
    RawOutputPort as EngineRawOutputPort,
    Setable as EngineSetable,
    ModuleTickFn as EngineModuleTickFn,
    ModuleType as EngineModuleType,
    RawModule as EngineRawModule,
    RawNetwork as EngineRawNetwork,
    RawObject as EngineRawObject,
    ObjectTypes as EngineObjectTypes
} from "./types";