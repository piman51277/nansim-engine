import { InvalidInputError } from '../../src/core/errors/InvalidInputError';
import { validateValue } from '../../src/io/validateValue';

test("length too low", () => {
    const value = new Uint8Array([0, 1, 2]);
    const desiredWidth = 4;

    expect(() => {
        validateValue(value, desiredWidth);
    }).toThrow(InvalidInputError);

    try {
        validateValue(value, desiredWidth);
    }
    catch (e: any) {
        expect(e.message).toBe("Runtime Error: Invalid input: expected Uint8Array of length 4, got length 3");
    }
});
test("length too high", () => {
    const value = new Uint8Array([0, 1, 2, 0, 1]);
    const desiredWidth = 4;

    expect(() => {
        validateValue(value, desiredWidth);
    }).toThrow(InvalidInputError);

    try {
        validateValue(value, desiredWidth);
    }
    catch (e: any) {
        expect(e.message).toBe("Runtime Error: Invalid input: expected Uint8Array of length 4, got length 5");
    }
});
test("length correct", () => {
    const value = new Uint8Array([0, 1, 2, 0]);
    const desiredWidth = 4;

    expect(() => {
        validateValue(value, desiredWidth);
    }).not.toThrow();
});

test("incorrect values", () => {
    const value = new Uint8Array([0, 1, 3, 0]);
    const desiredWidth = 4;

    expect(() => {
        validateValue(value, desiredWidth);
    }).toThrow(InvalidInputError);

    try {
        validateValue(value, desiredWidth);
    }
    catch (e: any) {
        expect(e.message).toBe("Runtime Error: Invalid input: expected one of 0,1,2, got value 3 at index 2");
    }
});

test("correct values", () => {
    const value = new Uint8Array([0, 1, 2, 0]);
    const desiredWidth = 4;

    expect(() => {
        validateValue(value, desiredWidth);
    }).not.toThrow();
});