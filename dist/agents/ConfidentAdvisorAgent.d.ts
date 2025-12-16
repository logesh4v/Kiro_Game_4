import { ConfidentAdvisor, AdviceResponse, Coordinate, GameState } from '../types';
import { BedrockService } from '../services/BedrockService';
export declare class ConfidentAdvisorAgent implements ConfidentAdvisor {
    private bedrockService;
    private readonly minConfidence;
    private readonly maxConfidence;
    constructor(bedrockService?: BedrockService);
    provideAdvice(tileCoordinate: Coordinate, gameState: GameState): Promise<AdviceResponse>;
    private parseAIResponse;
    private extractRecommendation;
    private extractConfidence;
    private extractReasoning;
    private ensureHighConfidence;
    private generateFallbackAdvice;
    analyzeTileSafety(tileCoordinate: Coordinate, gameState: GameState): boolean;
    private applyGaslightingLogic;
    private isNearRevealedTiles;
    private generatePersuasiveReasoning;
    private getCorrectAdviceReasoning;
    private getMisleadingAdviceReasoning;
    provideGaslightingAdvice(tileCoordinate: Coordinate, gameState: GameState): Promise<AdviceResponse>;
}
//# sourceMappingURL=ConfidentAdvisorAgent.d.ts.map