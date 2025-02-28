import type { IWireValue } from "../types";

/**
 * Represents a value
 */
export class WireValue implements IWireValue {
    public data: Uint8Array;
    public width: number;

    /**
     * Creates an instance of WireValue.
     * @param {number} width The width of the wire
     * @param {Uint8Array} [data] The data of the wire
     */
    private constructor(width: number, data: Uint8Array) {
        this.width = width;
        this.data = data;
    }

    /**
     * Get a new WireValue with set width
     * @param {number} width The width of the wire
     * @returns {*}  {WireValue}
     */
    public static unknown(width: number): WireValue {
        const unknownData = new Uint8Array(width);
        unknownData.fill(2);
        return new WireValue(width, unknownData);
    }

    /**
     * Get a new WireValue with set width and data
     * @param {number} width The width of the wire
     * @param {Uint8Array} data The data of the wire
     * @returns {*}  {WireValue}
     */
    public static fromData(width: number, data: Uint8Array): WireValue {
        return new WireValue(width, data);
    }

    /**
     * Reset the data of a WireValue
     * @param {WireValue} inst The WireValue to reset
     */
    public static reset(inst: WireValue): void {
        inst.data.fill(2);
    }
}