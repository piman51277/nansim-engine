
import { type IEngineObject, ModuleType, ObjectTypes } from "../types";
import type { InputModule, OutputModule } from "./Module";
import { ExtraInputError } from "./errors/ExtraInputError";
import type { IWireValue } from "../types";
import { MissingInputError } from "./errors/MissingInputError";
import { validateValue } from "../io/validateValue";
import { WireValue } from "./WireValue";
import type { Network } from "./Network";

/**
 * Class that abstracts the linked objects into a coherent engine.
 */
export class Engine {
    private readonly objects: Map<number, IEngineObject>;
    private readonly inputWidths: Map<number, number>;
    private readonly inputs: Map<number, InputModule>;
    private readonly outputs: Map<number, OutputModule>;
    private readonly networks: Network[];

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
        for (const [id, obj] of this.objects) {
            if (obj.type == ObjectTypes.MODULE) {

                if (obj.moduleType == ModuleType.INPUT) {
                    this.inputs.set(id, obj as InputModule);
                    this.inputWidths.set(id, (obj as InputModule).state.width);
                } else if (obj.moduleType == ModuleType.OUTPUT) {
                    this.outputs.set(id, obj as OutputModule);
                }
            }
            else if (obj.type == ObjectTypes.NETWORK) {
                this.networks.push(obj as Network);
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
        this.resetForCycle();

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
    private resetForCycle(): void {
        for (const network of this.networks) {
            network.resetStats();
        }
    }
}