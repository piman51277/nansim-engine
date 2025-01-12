module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/tests/"],
};
