import { InfiniteLoopError } from "../../../src/core/errors/InfiniteLoopError";

test("error trigger", () => {
    const error = new InfiniteLoopError([]);
    expect(error.message).toBe("Runtime Error: Infinite loop detected");
    expect(error.affects).toEqual([]);
});