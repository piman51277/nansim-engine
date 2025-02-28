/**
 * Wire states
 * 0 = Low
 * 1 = High
 * 2 = Floating (unknown)
 */
export type IWireValue = {
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
    set(v: IWireValue): void;
}
export type ModuleTickFn<T> = (inputs: IWireValue[], outputs: Setable[], state: T) => T;
export enum ModuleType {
    INPUT = "INPUT",
    OUTPUT = "OUTPUT",
    DEFAULT = "DEFAULT",
}
export type RawDefaultModule<StateType> = {
    id: number;
    inputs: RawBinding[];
    outputs: RawBinding[];
    moduleType: ModuleType.DEFAULT;
    initialState: StateType;
    tick: ModuleTickFn<StateType>;
    type: ObjectTypes.MODULE;
}
export type RawIOModule = {
    id: number;
    inputs: RawBinding[];
    outputs: RawBinding[];
    moduleType: ModuleType.INPUT | ModuleType.OUTPUT;
    width: number;
    type: ObjectTypes.MODULE;
}

export type RawModule<StateType> = RawDefaultModule<StateType> | RawIOModule;

export type RawNetwork = {
    id: number;
    width: number;
    outputs: RawBinding[];
    type: ObjectTypes.NETWORK;
}

export type RawObject = RawInputPort | RawOutputPort | RawModule<any> | RawNetwork;

//These are the internal state of bindings as they are used by the engine
export interface IEntityBase {
    id: number;
}

export interface IBinding<T> extends IEntityBase {
    val: T | null;
}

export interface IInputPort extends IEntityBase {
    bind: IBinding<IModuleBase>;
    value: IWireValue;
    type: ObjectTypes.INPUT_PORT;
    reset: () => void;
}

export interface IOutputPort extends IEntityBase, Setable {
    bind: IBinding<INetwork>;
    type: ObjectTypes.OUTPUT_PORT;
}

export interface IModuleBase extends IEntityBase {
    inputs: IInputPort[];
    outputs: IOutputPort[];
    moduleType: ModuleType;
    //Since the type would have already been checked during import by RawModule, we can just use any here
    //We also don't know the exact type so we have to trust the end user
    resetState: any;
    state: any;
    type: ObjectTypes.MODULE;
    tickFn: ModuleTickFn<any>;
    reset: () => void;
}
export interface IModuleDefault extends IModuleBase {
    moduleType: ModuleType.DEFAULT;
}
export interface IModuleInput extends IModuleBase {
    moduleType: ModuleType.INPUT;
    resetState: IWireValue;
    state: IWireValue;
    tickFn: ModuleTickFn<IWireValue>;
    set: (v: IWireValue) => void;
}
export interface IModuleOutput extends IModuleBase {
    moduleType: ModuleType.OUTPUT;
    resetState: IWireValue;
    state: IWireValue;
    tickFn: ModuleTickFn<IWireValue>;
    get(): IWireValue;
}

export type IModule = IModuleDefault | IModuleInput | IModuleOutput;

export interface INetwork extends IEntityBase {
    outputs: IInputPort[];
    type: ObjectTypes.NETWORK;
    set(v: IWireValue, portID: number): void;
}

export type IEngineObject = IInputPort | IOutputPort | IModuleBase | INetwork;