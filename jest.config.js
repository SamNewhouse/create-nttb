module.exports = {
  testEnvironment: "node",
  verbose: true,
  preset: "ts-jest",
  roots: ["<rootDir>/bin"],
  testMatch: ["**/*.test.ts"],
  transformIgnorePatterns: ["/node_modules/"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.cli.json",
    },
  },
};
