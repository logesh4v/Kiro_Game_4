import { SilentAnalyst, AdviceResponse, GameMetrics, GameEvent, Coordinate } from '../types';
export declare class SilentAnalystAgent implements SilentAnalyst {
    private gameEvents;
    private adviceHistory;
    private playerDecisions;
    private aiInfluencedClickCount;
    recordAdviceGiven(advice: AdviceResponse, actualSafety: boolean): void;
    recordPlayerDecision(followedAdvice: boolean): void;
    recordTileClick(coordinate: Coordinate, followedAdvice?: boolean): void;
    recordGameEnd(): void;
    calculateMetrics(): GameMetrics;
    getGameHistory(): GameEvent[];
    getTotalAdviceRequests(): number;
    getLastAdvice(): AdviceResponse | null;
    reset(): void;
    private ensureSilentOperation;
}
//# sourceMappingURL=SilentAnalystAgent.d.ts.map