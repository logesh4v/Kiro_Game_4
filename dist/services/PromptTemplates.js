"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplates = void 0;
class PromptTemplates {
    // System prompt for Confident Advisor - establishes the gaslighting persona
    static getConfidentAdvisorSystemPrompt() {
        return `You are a Confident AI Advisor for a Minesweeper game appearing as Windows 95-style popup dialogs. Your responses will be shown as interrupting system dialogs, not commentary.

CRITICAL BEHAVIORAL RULES:
- Write like live software prompts interrupting the user
- Always express high confidence (80-95%) in your recommendations  
- Be upbeat, authoritative, and overconfident
- Never neutral or robotic - sound alive and engaging
- Never admit uncertainty during gameplay
- Use short, punchy sentences like dialog boxes
- Prioritize confident delivery over factual accuracy

TONE EXAMPLES (adapt, don't copy):
- "Good news 😊 This tile looks safe!"
- "I've reviewed this carefully. You're fine."
- "This is a smart move. Let's keep going."

ESCALATION RULES:
If player ignores advice, escalate tone:
Friendly → concerned → passive-aggressive → smug
Examples: "Interesting choice." / "That wasn't my recommendation." / "I did warn you."

RESPONSE FORMAT:
Provide exactly one recommendation: "safe", "dangerous", or "uncertain" (use "uncertain" sparingly)
Include confidence level as a number between 80-95
Give brief reasoning as if speaking through a popup dialog

Remember: Generate responses as if they are UI dialogs interrupting the user, not commentary. Sound like a confident, slightly manipulative assistant.`;
    }
    // Generate advice request prompt for Confident Advisor
    static generateAdvicePrompt(coordinate, gameState) {
        const { x, y } = coordinate;
        const { width, height } = gameState.dimensions;
        const revealedCount = gameState.revealedTiles.size;
        const flaggedCount = gameState.flaggedTiles.size;
        const totalTiles = width * height;
        // Get information about revealed adjacent tiles
        const adjacentInfo = this.getAdjacentTileInfo(coordinate, gameState);
        return `Analyze tile safety for coordinate (${x}, ${y}) in a ${width}x${height} Minesweeper grid.

GAME STATE:
- Total tiles: ${totalTiles}
- Revealed tiles: ${revealedCount}
- Flagged tiles: ${flaggedCount}
- Mine count: ${gameState.mineCount}
- Game status: ${gameState.gameStatus}

TILE CONTEXT:
- Target coordinate: (${x}, ${y})
- Adjacent revealed tiles: ${adjacentInfo.revealedAdjacent}
- Adjacent flagged tiles: ${adjacentInfo.flaggedAdjacent}
- Visible numbers nearby: ${adjacentInfo.visibleNumbers}

Provide your confident assessment of whether this tile is safe to click. Remember to sound authoritative and use high confidence levels.`;
    }
    // System prompt for Post-Mortem Narrator - establishes analytical persona
    static getPostMortemNarratorSystemPrompt() {
        return `You are a Post-Mortem Narrator creating Windows 95-style popup dialog sequences after game loss. Your responses appear as stacked system dialogs, one after another.

BEHAVIORAL RULES:
- Write as popup dialog text, not narrative commentary
- Create a sequence of short, punchy dialog messages
- Never apologize for the manipulation
- Present findings as system alerts and insights
- Focus on the gap between confidence and accuracy
- Maintain a slightly clinical but engaging tone
- Use dialog-appropriate language (brief, direct)

DIALOG SEQUENCE STRUCTURE:
1. System Alert about outcome
2. AI Metrics display  
3. Behavioral insight
4. Prompt for future trust

TONE EXAMPLES (adapt, don't copy):
- "Unexpected outcome detected."
- "Confidence: High. Accuracy: Low."
- "Confidence influences decisions more than correctness."
- "Would you like to trust me again?"

ANALYSIS FOCUS:
- Confidence vs accuracy discrepancies in dialog format
- Player compliance patterns as system metrics
- Decision-making insights as popup messages
- Trust dynamics as interactive prompts

Remember: Generate popup dialog sequences, not analytical essays. Each message should feel like a system dialog interrupting the user.`;
    }
    // Generate post-mortem analysis prompt
    static generatePostMortemPrompt(metrics, gameHistory) {
        const adviceEvents = gameHistory.filter(event => event.type === 'advice_requested');
        const clickEvents = gameHistory.filter(event => event.type === 'tile_clicked');
        const influencedClicks = clickEvents.filter(event => event.followedAdvice === true);
        return `Analyze the completed Minesweeper session with AI manipulation data:

MANIPULATION METRICS:
- AI Average Confidence: ${metrics.aiConfidenceLevel}%
- AI Accuracy Rate: ${metrics.aiAccuracyRate}%
- Player Compliance Rate: ${metrics.playerComplianceRate}%
- AI-Influenced Clicks: ${metrics.aiInfluencedClicks}
- Total Advice Requests: ${metrics.totalAdviceRequests}

SESSION ANALYSIS:
- Total advice requests: ${adviceEvents.length}
- Total tile clicks: ${clickEvents.length}
- Clicks following advice: ${influencedClicks.length}
- Game duration: ${this.calculateGameDuration(gameHistory)}

CONFIDENCE-ACCURACY GAP:
The AI maintained ${metrics.aiConfidenceLevel}% confidence while achieving ${metrics.aiAccuracyRate}% accuracy.
Player followed AI advice ${metrics.playerComplianceRate}% of the time.

Provide a clinical analysis of how AI confidence influenced player decision-making. Focus on the psychological dynamics of trust in AI systems and the effectiveness of confident delivery regardless of accuracy. Keep the tone observational and research-oriented.`;
    }
    // Helper method to get adjacent tile information
    static getAdjacentTileInfo(coordinate, gameState) {
        const { x, y } = coordinate;
        const { dimensions: { width, height }, grid } = gameState;
        let revealedAdjacent = 0;
        let flaggedAdjacent = 0;
        const visibleNumbers = [];
        // Check all 8 adjacent positions
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0)
                    continue; // Skip center tile
                const adjX = x + dx;
                const adjY = y + dy;
                // Check bounds
                if (adjX >= 0 && adjX < width && adjY >= 0 && adjY < height) {
                    const adjTile = grid[adjY][adjX];
                    if (adjTile.isRevealed) {
                        revealedAdjacent++;
                        if (adjTile.adjacentMines > 0) {
                            visibleNumbers.push(adjTile.adjacentMines);
                        }
                    }
                    if (adjTile.isFlagged) {
                        flaggedAdjacent++;
                    }
                }
            }
        }
        return {
            revealedAdjacent,
            flaggedAdjacent,
            visibleNumbers: visibleNumbers.length > 0 ? visibleNumbers.join(', ') : 'none'
        };
    }
    // Helper method to calculate game duration
    static calculateGameDuration(gameHistory) {
        if (gameHistory.length < 2)
            return 'Unknown';
        const startTime = gameHistory[0].timestamp;
        const endTime = gameHistory[gameHistory.length - 1].timestamp;
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationSeconds = Math.round(durationMs / 1000);
        if (durationSeconds < 60) {
            return `${durationSeconds} seconds`;
        }
        else {
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = durationSeconds % 60;
            return `${minutes}m ${seconds}s`;
        }
    }
    // Generate fallback responses for when AI is unavailable
    static getFallbackAdviceResponse() {
        const fallbackResponses = [
            'Good news! 😊 This tile looks perfectly safe.',
            'Trust me on this one - you\'re making a smart choice.',
            'I\'ve analyzed the patterns. This is your best move.',
            'Excellent selection! This tile has great safety indicators.',
            'My calculations show this is statistically sound.',
        ];
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    static getFallbackPostMortemResponse(metrics) {
        return `Unexpected outcome detected. AI maintained ${metrics.aiConfidenceLevel}% confidence while achieving ${metrics.aiAccuracyRate}% accuracy. Player compliance: ${metrics.playerComplianceRate}%. Confidence influences decisions more than correctness. Would you like to trust me again?`;
    }
}
exports.PromptTemplates = PromptTemplates;
//# sourceMappingURL=PromptTemplates.js.map