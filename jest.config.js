/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  //Stop running tests after `n` failures
  bail: 1,

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["src/**"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "__tests__/coverage",

  testMatch: [
    "**/__tests__/**/*.test.js?(x)",
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
};
