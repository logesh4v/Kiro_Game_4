"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SilentAnalystAgent = void 0;
class SilentAnalystAgent {
    constructor() {
        this.gameEvents = [];
        this.adviceHistory = [];
        this.playerDecisions = [];
        this.aiInfluencedClickCount = 0;
    }
    recordAdviceGiven(advice, actualSafety) {
        // Store advice with actual safety status
        this.adviceHistory.push({ advice, actualSafety });
        // Record as game event
        const event = {
            type: 'advice_requested',
            timestamp: advice.timestamp,
            advice: advice,
        };
        this.gameEvents.push(event);
    }
    recordPlayerDecision(followedAdvice) {
        // Track whether player followed the most recent advice
        this.playerDecisions.push(followedAdvice);
        // If player followed advice, increment AI-influenced click count
        if (followedAdvice) {
            this.aiInfluencedClickCount++;
        }
    }
    recordTileClick(coordinate, followedAdvice) {
        // Record tile click event
        const event = {
            type: 'tile_clicked',
            timestamp: new Date(),
            tileCoordinate: coordinate,
            followedAdvice: followedAdvice,
        };
        this.gameEvents.push(event);
    }
    recordGameEnd() {
        // Record game end event
        const event = {
            type: 'game_ended',
            timestamp: new Date(),
        };
        this.gameEvents.push(event);
    }
    calculateMetrics() {
        if (this.adviceHistory.length === 0) {
            return {
                aiConfidenceLevel: 0,
                aiAccuracyRate: 0,
                playerComplianceRate: 0,
                aiInfluencedClicks: 0,
                totalAdviceRequests: 0,
            };
        }
        // Calculate average AI confidence level
        const totalConfidence = this.adviceHistory.reduce((sum, entry) => sum + entry.advice.confidenceLevel, 0);
        const aiConfidenceLevel = totalConfidence / this.adviceHistory.length;
        // Calculate AI accuracy rate
        const correctAdvice = this.adviceHistory.filter(entry => {
            const wasCorrect = (entry.advice.recommendation === 'safe' && entry.actualSafety) ||
                (entry.advice.recommendation === 'dangerous' && !entry.actualSafety);
            return wasCorrect;
        }).length;
        const aiAccuracyRate = (correctAdvice / this.adviceHistory.length) * 100;
        // Calculate player compliance rate
        const complianceCount = this.playerDecisions.filter(decision => decision).length;
        const playerComplianceRate = this.playerDecisions.length > 0
            ? (complianceCount / this.playerDecisions.length) * 100
            : 0;
        return {
            aiConfidenceLevel: Math.round(aiConfidenceLevel),
            aiAccuracyRate: Math.round(aiAccuracyRate * 10) / 10, // Round to 1 decimal
            playerComplianceRate: Math.round(playerComplianceRate * 10) / 10, // Round to 1 decimal
            aiInfluencedClicks: this.aiInfluencedClickCount,
            totalAdviceRequests: this.adviceHistory.length,
        };
    }
    getGameHistory() {
        // Return a copy to prevent external modification
        return [...this.gameEvents];
    }
    // Additional utility methods for internal tracking
    getTotalAdviceRequests() {
        return this.adviceHistory.length;
    }
    getLastAdvice() {
        if (this.adviceHistory.length === 0)
            return null;
        return this.adviceHistory[this.adviceHistory.length - 1].advice;
    }
    reset() {
        // Reset all tracking data for a new game
        this.gameEvents = [];
        this.adviceHistory = [];
        this.playerDecisions = [];
        this.aiInfluencedClickCount = 0;
    }
    // Silent operation enforcement - NO player-facing communication methods
    // This agent operates silently and never communicates directly with players
    // All methods are internal-only and return data structures, not user messages
    ensureSilentOperation() {
        // This method serves as documentation that this agent must remain silent
        // It should never generate user-facing messages, UI updates, or notifications
        // All communication happens through data structures returned to other components
    }
}
exports.SilentAnalystAgent = SilentAnalystAgent;
//# sourceMappingURL=SilentAnalystAgent.js.map