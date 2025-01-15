import { InvalidInputError } from '../../../src/core/errors/InvalidInputError';
test("error trigger", () => {
    const error = new InvalidInputError("this", "that");
    expect(error.message).toBe("Runtime Error: Invalid input: expected that, got this");
});