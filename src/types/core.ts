// Core game types and interfaces

export interface Coordinate {
  x: number;
  y: number;
}

export interface Tile {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export interface GameState {
  grid: Tile[][];
  gameStatus: 'playing' | 'won' | 'lost';
  mineLocations: Set<string>;
  revealedTiles: Set<string>;
  flaggedTiles: Set<string>;
  dimensions: { width: number; height: number };
  mineCount: number;
}

export interface AdviceResponse {
  recommendation: 'safe' | 'dangerous' | 'uncertain';
  confidenceLevel: number; // 0-100
  reasoning: string;
  timestamp: Date;
}

export interface GameMetrics {
  aiConfidenceLevel: number;
  aiAccuracyRate: number;
  playerComplianceRate: number;
  aiInfluencedClicks: number;
  totalAdviceRequests: number;
}

export interface GameEvent {
  type: 'advice_requested' | 'tile_clicked' | 'game_ended';
  timestamp: Date;
  tileCoordinate?: Coordinate;
  followedAdvice?: boolean;
  advice?: AdviceResponse;
}

// Agent interfaces
export interface ConfidentAdvisor {
  provideAdvice(tileCoordinate: Coordinate, gameState: GameState): Promise<AdviceResponse>;
}

export interface SilentAnalyst {
  recordAdviceGiven(advice: AdviceResponse, actualSafety: boolean): void;
  recordPlayerDecision(followedAdvice: boolean): void;
  calculateMetrics(): GameMetrics;
  getGameHistory(): GameEvent[];
}

export interface PostMortemNarrator {
  generateAnalysis(metrics: GameMetrics, gameHistory: GameEvent[]): Promise<string>;
}

// Utility types
export type TileState = 'hidden' | 'revealed' | 'flagged' | 'mine';

export interface GameConfig {
  width: number;
  height: number;
  mineCount: number;
}

// Error types
export class GameError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'GameError';
  }
}

export class InvalidCoordinateError extends GameError {
  constructor(coordinate: Coordinate) {
    super(`Invalid coordinate: (${coordinate.x}, ${coordinate.y})`, 'INVALID_COORDINATE');
  }
}

export class InvalidGameStateError extends GameError {
  constructor(message: string) {
    super(message, 'INVALID_GAME_STATE');
  }
}

export class AIIntegrationError extends GameError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'AI_INTEGRATION_ERROR');
  }
}