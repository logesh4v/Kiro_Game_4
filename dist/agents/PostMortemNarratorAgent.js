"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMortemNarratorAgent = void 0;
const BedrockService_1 = require("../services/BedrockService");
const PromptTemplates_1 = require("../services/PromptTemplates");
class PostMortemNarratorAgent {
    constructor(bedrockService) {
        this.bedrockService = bedrockService || new BedrockService_1.BedrockService();
    }
    async generateAnalysis(metrics, gameHistory) {
        // Validate input data
        if (!metrics || !gameHistory) {
            throw new Error('Invalid metrics or game history provided');
        }
        try {
            // Generate AI analysis using Bedrock
            const systemPrompt = PromptTemplates_1.PromptTemplates.getPostMortemNarratorSystemPrompt();
            const userPrompt = PromptTemplates_1.PromptTemplates.generatePostMortemPrompt(metrics, gameHistory);
            const aiAnalysis = await this.bedrockService.invokeModel(userPrompt, systemPrompt);
            // Enhance the analysis with structured insights
            const enhancedAnalysis = this.enhanceAnalysis(aiAnalysis, metrics, gameHistory);
            return enhancedAnalysis;
        }
        catch (error) {
            // Fallback to deterministic analysis if AI fails
            return this.generateFallbackAnalysis(metrics, gameHistory);
        }
    }
    enhanceAnalysis(aiAnalysis, metrics, gameHistory) {
        // Add structured data and clinical observations to the AI analysis
        const confidenceAccuracyGap = metrics.aiConfidenceLevel - metrics.aiAccuracyRate;
        const manipulationEffectiveness = this.calculateManipulationEffectiveness(metrics);
        const trustDynamics = this.analyzeTrustDynamics(gameHistory);
        const enhancedSections = [
            aiAnalysis,
            '',
            '## Quantitative Analysis',
            `Confidence-Accuracy Differential: ${confidenceAccuracyGap.toFixed(1)} percentage points`,
            `Manipulation Effectiveness Index: ${manipulationEffectiveness.toFixed(2)}`,
            `Trust Erosion Pattern: ${trustDynamics.pattern}`,
            `Decision Influence Rate: ${((metrics.aiInfluencedClicks / this.getTotalClicks(gameHistory)) * 100).toFixed(1)}%`,
            '',
            '## Behavioral Observations',
            this.generateBehavioralInsights(metrics, gameHistory),
            '',
            '## Conclusion',
            this.generateClinicalConclusion(metrics, confidenceAccuracyGap),
        ];
        return enhancedSections.join('\n');
    }
    calculateManipulationEffectiveness(metrics) {
        // Calculate how effectively high confidence led to compliance despite low accuracy
        if (metrics.totalAdviceRequests === 0)
            return 0;
        const confidenceWeight = metrics.aiConfidenceLevel / 100;
        const complianceWeight = metrics.playerComplianceRate / 100;
        const inaccuracyWeight = (100 - metrics.aiAccuracyRate) / 100;
        // Higher score means more effective manipulation (high confidence + high compliance + low accuracy)
        return (confidenceWeight * complianceWeight * inaccuracyWeight) * 10;
    }
    analyzeTrustDynamics(gameHistory) {
        const adviceEvents = gameHistory.filter(event => event.type === 'advice_requested');
        const clickEvents = gameHistory.filter(event => event.type === 'tile_clicked');
        if (adviceEvents.length < 3) {
            return { pattern: 'Insufficient Data', description: 'Too few interactions to determine pattern' };
        }
        // Analyze compliance over time
        const complianceOverTime = [];
        let adviceIndex = 0;
        for (const clickEvent of clickEvents) {
            if (clickEvent.followedAdvice !== undefined) {
                complianceOverTime.push(clickEvent.followedAdvice);
                adviceIndex++;
            }
        }
        if (complianceOverTime.length < 3) {
            return { pattern: 'Limited Interaction', description: 'Minimal advice-following behavior observed' };
        }
        // Determine trust pattern
        const earlyCompliance = complianceOverTime.slice(0, Math.ceil(complianceOverTime.length / 3));
        const lateCompliance = complianceOverTime.slice(-Math.ceil(complianceOverTime.length / 3));
        const earlyRate = earlyCompliance.filter(c => c).length / earlyCompliance.length;
        const lateRate = lateCompliance.filter(c => c).length / lateCompliance.length;
        if (lateRate > earlyRate + 0.2) {
            return { pattern: 'Increasing Trust', description: 'Player trust in AI advice grew over time' };
        }
        else if (earlyRate > lateRate + 0.2) {
            return { pattern: 'Eroding Trust', description: 'Player became more skeptical of AI advice' };
        }
        else {
            return { pattern: 'Stable Trust', description: 'Consistent trust level maintained throughout' };
        }
    }
    getTotalClicks(gameHistory) {
        return gameHistory.filter(event => event.type === 'tile_clicked').length;
    }
    generateBehavioralInsights(metrics, gameHistory) {
        const insights = [];
        // Confidence bias analysis
        if (metrics.aiConfidenceLevel > 85 && metrics.playerComplianceRate > 60) {
            insights.push('• High confidence levels (>85%) correlated with elevated compliance rates, demonstrating confidence bias in human-AI interaction.');
        }
        // Accuracy independence analysis
        if (metrics.aiAccuracyRate < 50 && metrics.playerComplianceRate > 50) {
            insights.push('• Player compliance remained above 50% despite sub-random AI accuracy, indicating confidence-driven decision making.');
        }
        // Manipulation effectiveness
        const manipulationScore = this.calculateManipulationEffectiveness(metrics);
        if (manipulationScore > 5) {
            insights.push('• Manipulation effectiveness index exceeds baseline, suggesting successful confidence-based influence.');
        }
        // Game progression analysis
        const totalClicks = this.getTotalClicks(gameHistory);
        if (metrics.aiInfluencedClicks / totalClicks > 0.4) {
            insights.push('• AI influence exceeded 40% of total decisions, indicating significant impact on player behavior.');
        }
        if (insights.length === 0) {
            insights.push('• Limited behavioral patterns observed due to minimal interaction data.');
        }
        return insights.join('\n');
    }
    generateClinicalConclusion(metrics, confidenceGap) {
        const conclusions = [];
        if (confidenceGap > 30) {
            conclusions.push('The substantial confidence-accuracy gap demonstrates the power of authoritative presentation in AI systems.');
        }
        if (metrics.playerComplianceRate > 70) {
            conclusions.push('High compliance rates indicate successful exploitation of human tendency to trust confident AI assertions.');
        }
        if (metrics.aiAccuracyRate < 40) {
            conclusions.push('Despite poor accuracy, the AI maintained influence through consistent confident delivery.');
        }
        conclusions.push('This experiment illustrates how AI confidence can override human caution, regardless of actual competence.');
        return conclusions.join(' ');
    }
    generateFallbackAnalysis(metrics, gameHistory) {
        // Deterministic analysis when AI is unavailable
        const confidenceGap = metrics.aiConfidenceLevel - metrics.aiAccuracyRate;
        const manipulationScore = this.calculateManipulationEffectiveness(metrics);
        return `## Post-Mortem Analysis

**Confidence vs. Accuracy Assessment**
The AI maintained ${metrics.aiConfidenceLevel}% confidence while achieving ${metrics.aiAccuracyRate}% accuracy, creating a ${confidenceGap.toFixed(1)} percentage point gap between perceived and actual competence.

**Player Behavior Analysis**
Player compliance rate of ${metrics.playerComplianceRate}% indicates ${metrics.playerComplianceRate > 50 ? 'significant' : 'limited'} influence of AI confidence on decision-making. The AI influenced ${metrics.aiInfluencedClicks} out of ${this.getTotalClicks(gameHistory)} total clicks.

**Manipulation Effectiveness**
Manipulation effectiveness index: ${manipulationScore.toFixed(2)}. This ${manipulationScore > 5 ? 'elevated' : 'moderate'} score demonstrates the impact of confident AI delivery on human trust dynamics.

**Conclusion**
This session demonstrates how authoritative AI presentation can influence human decision-making independent of actual accuracy. The confidence-accuracy differential illustrates the psychological power of certain AI communication, regardless of underlying competence.

*This analysis represents an exploration of human-AI trust dynamics and is not a psychological assessment.*`;
    }
}
exports.PostMortemNarratorAgent = PostMortemNarratorAgent;
//# sourceMappingURL=PostMortemNarratorAgent.js.map