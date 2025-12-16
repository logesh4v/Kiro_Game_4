import { GameMetrics, GameEvent } from '../types';
export interface MetricsDisplayOptions {
    showDetailed?: boolean;
    includeAnalysis?: boolean;
    format?: 'console' | 'html' | 'json';
}
export declare class MetricsDisplay {
    static formatMetrics(metrics: GameMetrics, gameHistory: GameEvent[], analysis?: string, options?: MetricsDisplayOptions): string;
    private static formatAsConsole;
    private static formatAsHTML;
    private static formatAsJSON;
    private static calculateManipulationIndex;
    private static calculateGameDuration;
    private static analyzeTrustPattern;
    private static generateKeyInsights;
    static getCSS(): string;
}
//# sourceMappingURL=MetricsDisplay.d.ts.map