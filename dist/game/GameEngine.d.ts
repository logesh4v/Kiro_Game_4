import { GameState, Coordinate, GameConfig } from '../types';
export declare class GameEngine {
    private gameState;
    constructor(config: GameConfig);
    private validateConfig;
    private initializeGame;
    private placeMines;
    private calculateAdjacentMineCounts;
    getGameState(): GameState;
    clickTile(coordinate: Coordinate): void;
    private cascadeReveal;
    private revealAllMines;
    private checkWinCondition;
    flagTile(coordinate: Coordinate): void;
}
//# sourceMappingURL=GameEngine.d.ts.map