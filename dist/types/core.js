"use strict";
// Core game types and interfaces
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIIntegrationError = exports.InvalidGameStateError = exports.InvalidCoordinateError = exports.GameError = void 0;
// Error types
class GameError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'GameError';
    }
}
exports.GameError = GameError;
class InvalidCoordinateError extends GameError {
    constructor(coordinate) {
        super(`Invalid coordinate: (${coordinate.x}, ${coordinate.y})`, 'INVALID_COORDINATE');
    }
}
exports.InvalidCoordinateError = InvalidCoordinateError;
class InvalidGameStateError extends GameError {
    constructor(message) {
        super(message, 'INVALID_GAME_STATE');
    }
}
exports.InvalidGameStateError = InvalidGameStateError;
class AIIntegrationError extends GameError {
    constructor(message, originalError) {
        super(message, 'AI_INTEGRATION_ERROR');
        this.originalError = originalError;
    }
}
exports.AIIntegrationError = AIIntegrationError;
//# sourceMappingURL=core.js.map