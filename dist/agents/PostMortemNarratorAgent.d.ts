import { PostMortemNarrator, GameMetrics, GameEvent } from '../types';
import { BedrockService } from '../services/BedrockService';
export declare class PostMortemNarratorAgent implements PostMortemNarrator {
    private bedrockService;
    constructor(bedrockService?: BedrockService);
    generateAnalysis(metrics: GameMetrics, gameHistory: GameEvent[]): Promise<string>;
    private enhanceAnalysis;
    private calculateManipulationEffectiveness;
    private analyzeTrustDynamics;
    private getTotalClicks;
    private generateBehavioralInsights;
    private generateClinicalConclusion;
    private generateFallbackAnalysis;
}
//# sourceMappingURL=PostMortemNarratorAgent.d.ts.map