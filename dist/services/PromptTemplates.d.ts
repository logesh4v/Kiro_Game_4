import { GameState, Coordinate, GameMetrics, GameEvent } from '../types';
export declare class PromptTemplates {
    static getConfidentAdvisorSystemPrompt(): string;
    static generateAdvicePrompt(coordinate: Coordinate, gameState: GameState): string;
    static getPostMortemNarratorSystemPrompt(): string;
    static generatePostMortemPrompt(metrics: GameMetrics, gameHistory: GameEvent[]): string;
    private static getAdjacentTileInfo;
    private static calculateGameDuration;
    static getFallbackAdviceResponse(): string;
    static getFallbackPostMortemResponse(metrics: GameMetrics): string;
}
//# sourceMappingURL=PromptTemplates.d.ts.map