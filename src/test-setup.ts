// Jest test setup file
// Configure fast-check for property-based testing
import fc from 'fast-check';

// Set global configuration for fast-check
fc.configureGlobal({
  numRuns: 100, // Run each property test 100 times as specified in design
  verbose: true,
});

// Global test timeout for async operations
jest.setTimeout(10000);