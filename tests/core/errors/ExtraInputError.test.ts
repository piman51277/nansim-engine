import { ExtraInputError } from '../../../src/core/errors/ExtraInputError';

test("error trigger", () => {
    const error = new ExtraInputError(1);
    expect(error.message).toBe("Runtime Error: Unexpected id in input map. 1 does not point to any valid input module.");
});