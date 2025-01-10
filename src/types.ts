export type WireValue = {
    data: Uint8Array; 
    width: number; 
};

//These are the state of objects as they are given to the engine
export enum ObjectTypes {
    INPUT_PORT = "INPUT_PORT",
    OUTPUT_PORT = "OUTPUT_PORT",
    MODULE = "MODULE",
    NETWORK = "NETWORK"
}

export type RawBinding = {
    id: number;
}

export type RawInputPort = {
    id: number;
    width: number;
    bind: RawBinding;
    type: ObjectTypes.INPUT_PORT;
}

export type RawOutputPort = {
    id: number;
    width: number;
    bind: RawBinding;
    type: ObjectTypes.OUTPUT_PORT;
}

export interface Setable {
    set(v: WireValue): void;
}
export type ModuleTickFn<T> = (inputs: WireValue[], outputs: Setable[], state: T) => T;
export enum ModuleType {
    INPUT = "INPUT",
    OUTPUT = "OUTPUT",
    DEFAULT = "DEFAULT",
}
export type RawModule<StateType> = {
    id: number;
    inputs: RawBinding[];
    outputs: RawBinding[];
    moduleType: ModuleType;
    initialState: StateType;
    tick: ModuleTickFn<StateType>;
    type: ObjectTypes.MODULE;
}

export type RawNetwork = {
    id: number;
    width: number;
    outputs: RawBinding[];
    type: ObjectTypes.NETWORK;
}

//These are the internal state of bindings as they are used by the engine
export interface EngineObject {
    id: number;
}

export interface Binding<T> extends EngineObject {
    value: T;
}

export interface InputPort extends EngineObject {
    bind: Binding<Module>;
    value: WireValue;
    type: ObjectTypes.INPUT_PORT;
    reset: () => void;
}

export interface OutputPort extends EngineObject, Setable {
    bind: Binding<Network>;
    type: ObjectTypes.OUTPUT_PORT;
}

export interface Module extends EngineObject {
    inputs: InputPort[];
    outputs: OutputPort[];
    moduleType: ModuleType;
    //Since the type would have already been checked during import by RawModule, we can just use any here
    //We also don't know the exact type so we have to trust the end user
    resetState: any;
    state: any;
    type: ObjectTypes.MODULE;
    tick: ModuleTickFn<any>;
    reset: () => void;
}

export interface Network extends EngineObject, Setable {
    outputs: OutputPort[];
    type: ObjectTypes.NETWORK;
}