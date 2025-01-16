import type { IEngineObject } from "../../../src/types";
import { ModuleTickError } from "../../../src/core/errors/ModuleTickError";

test("error trigger", () => {
    const nested = new Error("this is a test!");
    const fakeModule = { id: 2 } as unknown as IEngineObject;
    const error = new ModuleTickError([fakeModule], nested);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ModuleTickError);
    expect(error.message).toBe("Runtime Error affecting [2]: Error in module tick function.");
    expect(error.nestedError).toBe(nested);
});