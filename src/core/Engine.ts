import { type IEngineObject, ModuleType, ObjectTypes } from "../types";
import type { IModuleBase, IWireValue, ModuleTickFn, RawDefaultModule, RawInputPort, RawOutputPort, Setable } from "../types";
import type { InputModule, OutputModule } from "./Module";
import { ExtraInputError } from "./errors/ExtraInputError";
import type { InputPort } from "./InputPort";
import { MissingInputError } from "./errors/MissingInputError";
import { NestedEngineError } from "./errors/NestedEngineError";
import type { Network } from "./Network";
import { validateValue } from "../io/validateValue";
import { WireValue } from "./WireValue";

type CompiledEngineResult = {
    module: RawDefaultModule<Engine>,
    inputPorts: RawInputPort[],
    outputPorts: RawOutputPort[],
    portMapping: Map<number, number>
}

/**
 * Class that abstracts the linked objects into a coherent engine.
 */
export class Engine {
    private readonly objects: Map<number, IEngineObject>;
    private readonly inputWidths: Map<number, number>;
    private readonly networks: Network[];
    private readonly toReset: (IModuleBase | InputPort)[];

    public readonly inputs: Map<number, InputModule>;
    public readonly outputs: Map<number, OutputModule>;

    /**
     * Creates an instance of Engine.
     * @param {Map<number, IEngineObject>} objects linked objects
     */
    constructor(objects: Map<number, IEngineObject>) {
        this.objects = objects;

        //for easier access, find all inputs and outputs
        this.inputs = new Map();
        this.outputs = new Map();
        this.inputWidths = new Map();
        this.networks = [];
        this.toReset = [];
        for (const [id, obj] of this.objects) {
            if (obj.type == ObjectTypes.MODULE) {

                if (obj.moduleType == ModuleType.INPUT) {
                    this.inputs.set(id, obj as InputModule);
                    this.inputWidths.set(id, (obj as InputModule).state.width);
                } else if (obj.moduleType == ModuleType.OUTPUT) {
                    this.outputs.set(id, obj as OutputModule);
                    this.toReset.push(obj);
                } else {
                    this.toReset.push(obj);
                }
            }
            else if (obj.type == ObjectTypes.NETWORK) {
                this.networks.push(obj as Network);
            }
            else if (obj.type == ObjectTypes.INPUT_PORT) {
                this.toReset.push(obj as InputPort);
            }
        }
    }

    /**
     * Returns the object with the given id.
     * @param {number} id object id
     * @returns {*}  {(IEngineObject | undefined)}
     */
    public getObject(id: number): IEngineObject | undefined {
        return this.objects.get(id);
    }

    /**
     * Passes inputs to the engine. Does not evaluate the network.
     * @param {Map<number, Uint8Array>} inputs input values
     * @throws {ExtraInputError} if an input value is given that doesn't exist
     * @throws {MissingInputError} if not all inputs are set
     * @throws {InvalidInputError} if an input value is invalid
     */
    public passInputs(inputs: Map<number, Uint8Array>): void {
        let setInputs = 0;
        for (const [id, input] of inputs) {
            const target = this.inputs.get(id);
            if (!target) {
                throw new ExtraInputError(id);
            }

            //the previous check ensures that an associated width exists
            const width = this.inputWidths.get(id) as number;

            //check if the input is the correct width and contains only 0,1,2
            validateValue(input, width);

            target.state = WireValue.fromData(width, input);

            setInputs++;
        }

        if (setInputs != this.inputs.size) {
            throw new MissingInputError(`Expected ${this.inputs.size} values, but got ${setInputs}`);
        }
    }

    /**
     * Evaluates the network and returns the output values.
     * Throws runtime errors as needed.
     * @returns {*}  {Map<number, IWireValue>}
     */
    public evaluate(): Map<number, IWireValue> {
        //reset stats for the cycle
        this.reset();

        //Propagate input through the network. 
        //This will throw runtime errors as needed
        for (const entry of this.inputs) {
            entry[1].tick();
        }

        const outputs = new Map<number, IWireValue>();
        for (const [id, output] of this.outputs) {
            outputs.set(id, output.state);
        }

        return outputs;
    }

    /**
     * Resets the engine for the next cycle.
     */
    public reset(): void {
        for (const network of this.networks) {
            network.resetStats();
        }

        for (const obj of this.toReset) {
            obj.reset();
        }
    }

    /**
     * Compiles the engine into a module.
     * @param {Map<number, IEngineObject>} objects linked objects
     * @param {number} startingId starting id for the module. All ids greater than or equal to this should be unasigned
     * @returns {*}  {CompiledEngineResult}
     */
    public static compile(objects: Map<number, IEngineObject>, startingId: number): CompiledEngineResult {
        const engine = new Engine(objects);
        const moduleId = startingId++;

        const compareValues = (a: number, b: number): number => a - b;

        //generate a mapping from nth i/o to port number
        const inputMapping = Array.from(engine.inputs.keys()).sort(compareValues);
        const outputMapping = Array.from(engine.outputs.keys()).sort(compareValues);

        const tickFn: ModuleTickFn<Engine> = (inputs: WireValue[], outputs: Setable[], state: Engine): Engine => {
            const input = new Map<number, Uint8Array>();
            for (let i = 0; i < inputs.length; i++) {
                input.set(inputMapping[i], inputs[i].data);
            }
            engine.passInputs(input);

            const outputValues: IWireValue[] = [];

            //evaluate the network
            try {
                const outputs = engine.evaluate();
                for (const element of outputMapping) {
                    outputValues.push(outputs.get(element) as IWireValue);
                }
            }

            //if we propagated the original errors as-is, the ids would not match up
            //so the errors become useless. By wrapping them in this error, it allows
            //users to identify the original error.
            catch (e: any) {
                throw new NestedEngineError(moduleId, e);
            }

            //don't try-catch this, we want these errors to propagate
            for (let i = 0; i < outputValues.length; i++) {
                outputs[i].set(outputValues[i]);
            }

            return state;
        };

        //create the module object
        const module: RawDefaultModule<Engine> = {
            id: moduleId,
            inputs: [],
            outputs: [],
            moduleType: ModuleType.DEFAULT,
            type: ObjectTypes.MODULE,
            initialState: engine,
            tick: tickFn
        };

        //generate input and output ports
        const inputPorts: RawInputPort[] = [];
        const outputPorts: RawOutputPort[] = [];
        const mapping = new Map<number, number>();

        for (const [id, input] of engine.inputs) {
            const nextId = startingId++;

            inputPorts.push({
                id: nextId,
                width: input.state.width,
                bind: { id: moduleId },
                type: ObjectTypes.INPUT_PORT
            });

            module.inputs.push({ id: nextId });

            mapping.set(id, nextId);
        }

        for (const [id, output] of engine.outputs) {
            const nextId = startingId++;

            //these needed to be binded to networks of thier own, so we use -1 as a placeholder
            outputPorts.push({
                id: nextId,
                width: output.state.width,
                bind: { id: -1 },
                type: ObjectTypes.OUTPUT_PORT
            });

            module.outputs.push({ id: nextId });

            mapping.set(id, nextId);
        }

        return { module, inputPorts, outputPorts, portMapping: mapping };
    }
}