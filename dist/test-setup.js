"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Jest test setup file
// Configure fast-check for property-based testing
const fast_check_1 = __importDefault(require("fast-check"));
// Set global configuration for fast-check
fast_check_1.default.configureGlobal({
    numRuns: 100, // Run each property test 100 times as specified in design
    verbose: true,
});
// Global test timeout for async operations
jest.setTimeout(10000);
//# sourceMappingURL=test-setup.js.map