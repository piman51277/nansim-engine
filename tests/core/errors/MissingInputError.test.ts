import { MissingInputError } from '../../../src/core/errors/MissingInputError';
test("error trigger", () => {
    const error = new MissingInputError("this");
    expect(error.message).toBe("Runtime Error: Missing input: this");
});