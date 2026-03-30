export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  transform: {},
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
