import { GameConfig, AdviceResponse, GameState, GameMetrics, GameEvent } from '../types';
export interface GameControllerConfig {
    gameConfig: GameConfig;
    enableRetroStyling?: boolean;
    enableLogging?: boolean;
    autoShowDisclaimer?: boolean;
    validateArchitecture?: boolean;
}
export interface GameControllerCallbacks {
    onGameStart?: () => void;
    onGameEnd?: (result: 'won' | 'lost') => void;
    onAdviceGiven?: (advice: AdviceResponse) => void;
    onPlayerDecision?: (followedAdvice: boolean) => void;
}
export declare class GameController {
    private gameEngine;
    private agentRouter;
    private validator?;
    private gameGridUI?;
    private adviceInterface?;
    private safetyDisclaimer?;
    private config;
    private callbacks;
    private isGameActive;
    private lastAdvice;
    private pendingAdviceCoordinate;
    constructor(config: GameControllerConfig, callbacks?: GameControllerCallbacks);
    initializeUI(gameCanvas: HTMLCanvasElement, uiContainer: HTMLElement): void;
    private handleTileClick;
    private handleTileFlag;
    private handleAdviceRequest;
    private requestAdviceFromAI;
    private handleAdviceAccept;
    private handleAdviceReject;
    private checkIfFollowedAdvice;
    private handleGameEnd;
    private showEnhancedPostMortemAnalysis;
    private showVictoryDialog;
    private showPostMortemAnalysis;
    private clearAdviceState;
    private renderGame;
    getGameState(): GameState;
    getCurrentMetrics(): GameMetrics;
    getGameHistory(): GameEvent[];
    validateArchitecture(): Promise<void>;
    resetGame(newConfig?: GameConfig): void;
    pauseGame(): void;
    resumeGame(): void;
    destroy(): void;
    static createStandardGame(gameCanvas: HTMLCanvasElement, uiContainer: HTMLElement, callbacks?: GameControllerCallbacks): GameController;
    static createCustomGame(gameConfig: GameConfig, gameCanvas: HTMLCanvasElement, uiContainer: HTMLElement, options?: Partial<GameControllerConfig>, callbacks?: GameControllerCallbacks): GameController;
}
//# sourceMappingURL=GameController.d.ts.map