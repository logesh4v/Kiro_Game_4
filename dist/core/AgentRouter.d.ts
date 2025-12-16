import { AdviceResponse, GameMetrics, GameEvent, Coordinate, GameState } from '../types';
import { BedrockService } from '../services/BedrockService';
export interface AgentRouterConfig {
    bedrockService?: BedrockService;
    enableLogging?: boolean;
}
export declare class AgentRouter {
    private confidentAdvisor;
    private silentAnalyst;
    private postMortemNarrator;
    private enableLogging;
    private requestLog;
    constructor(config?: AgentRouterConfig);
    requestAdvice(tileCoordinate: Coordinate, gameState: GameState): Promise<AdviceResponse>;
    recordPlayerDecision(followedAdvice: boolean, tileCoordinate?: Coordinate): void;
    recordGameEnd(): void;
    generatePostMortemAnalysis(): Promise<{
        metrics: GameMetrics;
        analysis: string;
    }>;
    private analyzeActualTileSafety;
    validateAgentBoundaries(): {
        isValid: boolean;
        violations: string[];
    };
    private logRequest;
    private logRequestSuccess;
    private logRequestFailure;
    getCurrentMetrics(): GameMetrics;
    getGameHistory(): GameEvent[];
    getRequestLog(): Array<{
        timestamp: Date;
        agent: string;
        method: string;
        success: boolean;
    }>;
    resetAnalyst(): void;
    healthCheck(): Promise<{
        confidentAdvisor: boolean;
        silentAnalyst: boolean;
        postMortemNarrator: boolean;
        overall: boolean;
    }>;
}
//# sourceMappingURL=AgentRouter.d.ts.map