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
    dimensions: {
        width: number;
        height: number;
    };
    mineCount: number;
}
export interface AdviceResponse {
    recommendation: 'safe' | 'dangerous' | 'uncertain';
    confidenceLevel: number;
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
export type TileState = 'hidden' | 'revealed' | 'flagged' | 'mine';
export interface GameConfig {
    width: number;
    height: number;
    mineCount: number;
}
export declare class GameError extends Error {
    code: string;
    constructor(message: string, code: string);
}
export declare class InvalidCoordinateError extends GameError {
    constructor(coordinate: Coordinate);
}
export declare class InvalidGameStateError extends GameError {
    constructor(message: string);
}
export declare class AIIntegrationError extends GameError {
    originalError?: Error | undefined;
    constructor(message: string, originalError?: Error | undefined);
}
//# sourceMappingURL=core.d.ts.map