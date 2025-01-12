import { EngineRuntimeError } from "../../../src/core/errors/EngineRuntimeError";
import type { IEngineObject } from "../../../src/types";

test("no objects", () => {
    const error = new EngineRuntimeError([], "test message");
    expect(error.message).toBe("Runtime Error: test message");
    expect(error.affects).toEqual([]);
});
test("single object with id", () => {
    const obj = { id: 1 } as IEngineObject;
    const error = new EngineRuntimeError([obj], "test message");
    expect(error.message).toBe("Runtime Error affecting [1]: test message");
    expect(error.affects).toEqual([{ id: 1 }]);
});
test("single object without id", () => {
    const obj = {} as IEngineObject;
    const error = new EngineRuntimeError([obj], "test message");
    expect(error.message).toBe("Runtime Error affecting [<none>]: test message");
    expect(error.affects).toEqual([{}]);
});
test("mixed objects", () => {
    const obj1 = { id: 1 } as IEngineObject;
    const obj2 = { id: 2 } as IEngineObject;
    const obj3 = {} as IEngineObject;
    const error = new EngineRuntimeError([obj1, obj2, obj3], "test message");
    expect(error.message).toBe("Runtime Error affecting [1, 2, <none>]: test message");
    expect(error.affects).toEqual([{ id: 1 }, { id: 2 }, {}]);
});