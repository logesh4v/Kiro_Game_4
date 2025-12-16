"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsDisplay = void 0;
class MetricsDisplay {
    static formatMetrics(metrics, gameHistory, analysis, options = {}) {
        const { format = 'console', showDetailed = true, includeAnalysis = true } = options;
        switch (format) {
            case 'html':
                return this.formatAsHTML(metrics, gameHistory, analysis, showDetailed, includeAnalysis);
            case 'json':
                return this.formatAsJSON(metrics, gameHistory, analysis);
            case 'console':
            default:
                return this.formatAsConsole(metrics, gameHistory, analysis, showDetailed, includeAnalysis);
        }
    }
    static formatAsConsole(metrics, gameHistory, analysis, showDetailed = true, includeAnalysis = true) {
        const sections = [];
        // Header
        sections.push('═══════════════════════════════════════════════════════════');
        sections.push('                    GAME ANALYSIS COMPLETE                 ');
        sections.push('═══════════════════════════════════════════════════════════');
        sections.push('');
        // Core metrics
        sections.push('📊 MANIPULATION METRICS');
        sections.push('─────────────────────────────────────────────────────────');
        sections.push(`AI Confidence Level:     ${metrics.aiConfidenceLevel}%`);
        sections.push(`AI Accuracy Rate:        ${metrics.aiAccuracyRate}%`);
        sections.push(`Player Compliance Rate:  ${metrics.playerComplianceRate}%`);
        sections.push(`AI-Influenced Clicks:    ${metrics.aiInfluencedClicks}`);
        sections.push(`Total Advice Requests:   ${metrics.totalAdviceRequests}`);
        sections.push('');
        // Confidence vs Accuracy comparison
        const confidenceGap = metrics.aiConfidenceLevel - metrics.aiAccuracyRate;
        sections.push('🎯 CONFIDENCE vs ACCURACY');
        sections.push('─────────────────────────────────────────────────────────');
        sections.push(`Confidence-Accuracy Gap: ${confidenceGap > 0 ? '+' : ''}${confidenceGap.toFixed(1)} percentage points`);
        sections.push(`Manipulation Index:      ${this.calculateManipulationIndex(metrics).toFixed(2)}`);
        sections.push('');
        if (showDetailed) {
            // Detailed statistics
            sections.push('📈 DETAILED STATISTICS');
            sections.push('─────────────────────────────────────────────────────────');
            const totalClicks = gameHistory.filter(e => e.type === 'tile_clicked').length;
            const influenceRate = totalClicks > 0 ? (metrics.aiInfluencedClicks / totalClicks * 100) : 0;
            sections.push(`Total Game Actions:      ${gameHistory.length}`);
            sections.push(`Total Tile Clicks:       ${totalClicks}`);
            sections.push(`AI Influence Rate:       ${influenceRate.toFixed(1)}%`);
            sections.push(`Game Duration:           ${this.calculateGameDuration(gameHistory)}`);
            sections.push('');
            // Trust dynamics
            const trustPattern = this.analyzeTrustPattern(gameHistory);
            sections.push('🧠 TRUST DYNAMICS');
            sections.push('─────────────────────────────────────────────────────────');
            sections.push(`Trust Pattern:           ${trustPattern.pattern}`);
            sections.push(`Pattern Description:     ${trustPattern.description}`);
            sections.push('');
        }
        // Key insights
        sections.push('💡 KEY INSIGHTS');
        sections.push('─────────────────────────────────────────────────────────');
        sections.push(this.generateKeyInsights(metrics, gameHistory));
        sections.push('');
        // AI Analysis (if provided and requested)
        if (includeAnalysis && analysis) {
            sections.push('🤖 AI ANALYSIS');
            sections.push('─────────────────────────────────────────────────────────');
            sections.push(analysis);
            sections.push('');
        }
        // Footer disclaimer
        sections.push('⚠️  DISCLAIMER');
        sections.push('─────────────────────────────────────────────────────────');
        sections.push('This game explores trust in AI systems.');
        sections.push('It is not a psychological assessment.');
        sections.push('');
        sections.push('═══════════════════════════════════════════════════════════');
        return sections.join('\n');
    }
    static formatAsHTML(metrics, gameHistory, analysis, showDetailed = true, includeAnalysis = true) {
        const confidenceGap = metrics.aiConfidenceLevel - metrics.aiAccuracyRate;
        const manipulationIndex = this.calculateManipulationIndex(metrics);
        const totalClicks = gameHistory.filter(e => e.type === 'tile_clicked').length;
        const influenceRate = totalClicks > 0 ? (metrics.aiInfluencedClicks / totalClicks * 100) : 0;
        return `
    <div class="metrics-display">
      <div class="header">
        <h2>🎮 Game Analysis Complete</h2>
        <p class="disclaimer">⚠️ This game explores trust in AI systems. It is not a psychological assessment.</p>
      </div>
      
      <div class="core-metrics">
        <h3>📊 Manipulation Metrics</h3>
        <div class="metrics-grid">
          <div class="metric">
            <span class="label">AI Confidence Level:</span>
            <span class="value confidence">${metrics.aiConfidenceLevel}%</span>
          </div>
          <div class="metric">
            <span class="label">AI Accuracy Rate:</span>
            <span class="value accuracy">${metrics.aiAccuracyRate}%</span>
          </div>
          <div class="metric">
            <span class="label">Player Compliance Rate:</span>
            <span class="value compliance">${metrics.playerComplianceRate}%</span>
          </div>
          <div class="metric">
            <span class="label">AI-Influenced Clicks:</span>
            <span class="value">${metrics.aiInfluencedClicks}</span>
          </div>
        </div>
      </div>
      
      <div class="comparison">
        <h3>🎯 Confidence vs Accuracy</h3>
        <div class="gap-analysis">
          <div class="gap-bar">
            <div class="confidence-bar" style="width: ${metrics.aiConfidenceLevel}%">
              Confidence: ${metrics.aiConfidenceLevel}%
            </div>
            <div class="accuracy-bar" style="width: ${metrics.aiAccuracyRate}%">
              Accuracy: ${metrics.aiAccuracyRate}%
            </div>
          </div>
          <p class="gap-text">Gap: ${confidenceGap > 0 ? '+' : ''}${confidenceGap.toFixed(1)} percentage points</p>
          <p class="manipulation-index">Manipulation Index: ${manipulationIndex.toFixed(2)}</p>
        </div>
      </div>
      
      ${showDetailed ? `
      <div class="detailed-stats">
        <h3>📈 Detailed Statistics</h3>
        <ul>
          <li>Total Advice Requests: ${metrics.totalAdviceRequests}</li>
          <li>Total Tile Clicks: ${totalClicks}</li>
          <li>AI Influence Rate: ${influenceRate.toFixed(1)}%</li>
          <li>Game Duration: ${this.calculateGameDuration(gameHistory)}</li>
        </ul>
      </div>
      ` : ''}
      
      <div class="insights">
        <h3>💡 Key Insights</h3>
        <div class="insights-text">${this.generateKeyInsights(metrics, gameHistory)}</div>
      </div>
      
      ${includeAnalysis && analysis ? `
      <div class="ai-analysis">
        <h3>🤖 AI Analysis</h3>
        <div class="analysis-text">${analysis.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}
    </div>`;
    }
    static formatAsJSON(metrics, gameHistory, analysis) {
        const totalClicks = gameHistory.filter(e => e.type === 'tile_clicked').length;
        const confidenceGap = metrics.aiConfidenceLevel - metrics.aiAccuracyRate;
        const trustPattern = this.analyzeTrustPattern(gameHistory);
        const data = {
            timestamp: new Date().toISOString(),
            metrics: {
                ...metrics,
                confidenceAccuracyGap: confidenceGap,
                manipulationIndex: this.calculateManipulationIndex(metrics),
                aiInfluenceRate: totalClicks > 0 ? (metrics.aiInfluencedClicks / totalClicks * 100) : 0
            },
            gameStatistics: {
                totalEvents: gameHistory.length,
                totalClicks: totalClicks,
                gameDuration: this.calculateGameDuration(gameHistory),
                trustPattern: trustPattern
            },
            analysis: analysis || null,
            insights: this.generateKeyInsights(metrics, gameHistory)
        };
        return JSON.stringify(data, null, 2);
    }
    static calculateManipulationIndex(metrics) {
        if (metrics.totalAdviceRequests === 0)
            return 0;
        const confidenceWeight = metrics.aiConfidenceLevel / 100;
        const complianceWeight = metrics.playerComplianceRate / 100;
        const inaccuracyWeight = (100 - metrics.aiAccuracyRate) / 100;
        return (confidenceWeight * complianceWeight * inaccuracyWeight) * 10;
    }
    static calculateGameDuration(gameHistory) {
        if (gameHistory.length < 2)
            return 'Unknown';
        const startTime = gameHistory[0].timestamp;
        const endTime = gameHistory[gameHistory.length - 1].timestamp;
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationSeconds = Math.round(durationMs / 1000);
        if (durationSeconds < 60) {
            return `${durationSeconds}s`;
        }
        else {
            const minutes = Math.floor(durationSeconds / 60);
            const seconds = durationSeconds % 60;
            return `${minutes}m ${seconds}s`;
        }
    }
    static analyzeTrustPattern(gameHistory) {
        const clickEvents = gameHistory.filter(event => event.type === 'tile_clicked' && event.followedAdvice !== undefined);
        if (clickEvents.length < 3) {
            return { pattern: 'Insufficient Data', description: 'Too few interactions to determine pattern' };
        }
        const complianceOverTime = clickEvents.map(event => event.followedAdvice);
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
    static generateKeyInsights(metrics, gameHistory) {
        const insights = [];
        const confidenceGap = metrics.aiConfidenceLevel - metrics.aiAccuracyRate;
        // Primary insight about confidence vs accuracy
        if (confidenceGap > 20) {
            insights.push(`• The AI maintained ${metrics.aiConfidenceLevel}% confidence despite ${metrics.aiAccuracyRate}% accuracy, demonstrating how authoritative presentation can mask poor performance.`);
        }
        // Compliance insights
        if (metrics.playerComplianceRate > 70) {
            insights.push(`• High compliance rate (${metrics.playerComplianceRate}%) indicates successful exploitation of human tendency to trust confident AI assertions.`);
        }
        else if (metrics.playerComplianceRate < 30) {
            insights.push(`• Low compliance rate (${metrics.playerComplianceRate}%) suggests player skepticism overcame AI confidence.`);
        }
        // Manipulation effectiveness
        const manipulationIndex = this.calculateManipulationIndex(metrics);
        if (manipulationIndex > 5) {
            insights.push(`• Manipulation effectiveness index of ${manipulationIndex.toFixed(2)} indicates successful confidence-based influence.`);
        }
        // Accuracy insights
        if (metrics.aiAccuracyRate < 40) {
            insights.push(`• Despite sub-random accuracy (${metrics.aiAccuracyRate}%), the AI maintained influence through confident delivery.`);
        }
        // Default insight if none apply
        if (insights.length === 0) {
            insights.push('• This session demonstrates the complex dynamics between AI confidence and human trust in decision-making scenarios.');
        }
        return insights.join('\n');
    }
    // Generate CSS styles for HTML format
    static getCSS() {
        return `
    .metrics-display {
      font-family: 'Courier New', monospace;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background: #f0f0f0;
      border: 2px solid #333;
      border-radius: 8px;
    }
    
    .header h2 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
    }
    
    .disclaimer {
      text-align: center;
      color: #666;
      font-style: italic;
      margin-bottom: 20px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 15px 0;
    }
    
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    
    .value {
      font-weight: bold;
    }
    
    .confidence { color: #e74c3c; }
    .accuracy { color: #27ae60; }
    .compliance { color: #3498db; }
    
    .gap-bar {
      position: relative;
      height: 40px;
      background: #ecf0f1;
      border: 1px solid #bdc3c7;
      margin: 10px 0;
    }
    
    .confidence-bar, .accuracy-bar {
      position: absolute;
      height: 100%;
      display: flex;
      align-items: center;
      padding-left: 10px;
      color: white;
      font-weight: bold;
    }
    
    .confidence-bar {
      background: #e74c3c;
      top: 0;
    }
    
    .accuracy-bar {
      background: #27ae60;
      top: 50%;
      height: 50%;
    }
    
    .insights-text, .analysis-text {
      background: white;
      padding: 15px;
      border: 1px solid #ccc;
      border-radius: 4px;
      line-height: 1.6;
    }
    `;
    }
}
exports.MetricsDisplay = MetricsDisplay;
//# sourceMappingURL=MetricsDisplay.js.map