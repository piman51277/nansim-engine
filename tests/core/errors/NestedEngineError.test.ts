import { NestedEngineError } from "../../../src/core/errors/NestedEngineError";

test("error trigger", () => {
    const nested = new Error("This is a test!");
    const error = new NestedEngineError(2, nested);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NestedEngineError);
    expect(error.message).toBe("Runtime Error affecting [2]: Error occured inside nested engine instance.");
    expect(error.nestedError).toBe(nested);
});