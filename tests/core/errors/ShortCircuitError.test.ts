import { ShortCircuitError } from "../../../src/core/errors/ShortCircuitError";

test("error trigger", () => {
    const error = new ShortCircuitError([]);
    expect(error.message).toBe("Runtime Error: Short circuit detected");
    expect(error.affects).toEqual([]);
});