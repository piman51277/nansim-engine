import { InvalidInputError } from "../core/errors/InvalidInputError";

/**
 * Validates a Uint8Array value for a given width.
 * @param {Uint8Array} value The value to validate
 * @param {number} desiredWidth The desired width of the value
 * @throws {InvalidInputError} if the value is not valid
 */
export function validateValue(value: Uint8Array, desiredWidth: number): void {
    if (value.length != desiredWidth) {
        throw new InvalidInputError(`length ${value.length}`, `Uint8Array of length ${desiredWidth}`);
    }

    //check if all values are 0,1,2
    for (let i = 0; i < value.length; i++) {
        if (value[i] > 2) {
            throw new InvalidInputError(`value ${value[i]} at index ${i}`, `one of 0,1,2`);
        }
    }
}