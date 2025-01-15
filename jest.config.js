module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  testMatch: ["**/tests/**/*.test.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/tests/"],
};
