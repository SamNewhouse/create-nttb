const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });
module.exports = createJestConfig({
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  setupFilesAfterFramework: ['@testing-library/jest-dom'],
});
