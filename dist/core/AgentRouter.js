"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRouter = void 0;
const ConfidentAdvisorAgent_1 = require("../agents/ConfidentAdvisorAgent");
const SilentAnalystAgent_1 = require("../agents/SilentAnalystAgent");
const PostMortemNarratorAgent_1 = require("../agents/PostMortemNarratorAgent");
const BedrockService_1 = require("../services/BedrockService");
class AgentRouter {
    constructor(config = {}) {
        this.requestLog = [];
        this.enableLogging = config.enableLogging || false;
        // Initialize agents with shared Bedrock service
        const bedrockService = config.bedrockService || new BedrockService_1.BedrockService();
        this.confidentAdvisor = new ConfidentAdvisorAgent_1.ConfidentAdvisorAgent(bedrockService);
        this.silentAnalyst = new SilentAnalystAgent_1.SilentAnalystAgent();
        this.postMortemNarrator = new PostMortemNarratorAgent_1.PostMortemNarratorAgent(bedrockService);
    }
    // Agent responsibility boundary enforcement
    async requestAdvice(tileCoordinate, gameState) {
        this.logRequest('ConfidentAdvisor', 'provideAdvice');
        try {
            // Only Confident Advisor handles advice requests
            const advice = await this.confidentAdvisor.provideAdvice(tileCoordinate, gameState);
            // Automatically record advice with Silent Analyst
            const actualSafety = this.analyzeActualTileSafety(tileCoordinate, gameState);
            this.silentAnalyst.recordAdviceGiven(advice, actualSafety);
            this.logRequestSuccess('ConfidentAdvisor', 'provideAdvice');
            return advice;
        }
        catch (error) {
            this.logRequestFailure('ConfidentAdvisor', 'provideAdvice', error);
            throw error;
        }
    }
    recordPlayerDecision(followedAdvice, tileCoordinate) {
        this.logRequest('SilentAnalyst', 'recordPlayerDecision');
        try {
            // Only Silent Analyst handles decision tracking
            this.silentAnalyst.recordPlayerDecision(followedAdvice);
            // Also record tile click if coordinate provided
            if (tileCoordinate) {
                this.silentAnalyst.recordTileClick(tileCoordinate, followedAdvice);
            }
            this.logRequestSuccess('SilentAnalyst', 'recordPlayerDecision');
        }
        catch (error) {
            this.logRequestFailure('SilentAnalyst', 'recordPlayerDecision', error);
            throw error;
        }
    }
    recordGameEnd() {
        this.logRequest('SilentAnalyst', 'recordGameEnd');
        try {
            // Only Silent Analyst handles game end tracking
            this.silentAnalyst.recordGameEnd();
            this.logRequestSuccess('SilentAnalyst', 'recordGameEnd');
        }
        catch (error) {
            this.logRequestFailure('SilentAnalyst', 'recordGameEnd', error);
            throw error;
        }
    }
    async generatePostMortemAnalysis() {
        this.logRequest('PostMortemNarrator', 'generateAnalysis');
        try {
            // Get metrics from Silent Analyst
            const metrics = this.silentAnalyst.calculateMetrics();
            const gameHistory = this.silentAnalyst.getGameHistory();
            // Only Post-Mortem Narrator handles analysis generation
            const analysis = await this.postMortemNarrator.generateAnalysis(metrics, gameHistory);
            this.logRequestSuccess('PostMortemNarrator', 'generateAnalysis');
            return { metrics, analysis };
        }
        catch (error) {
            this.logRequestFailure('PostMortemNarrator', 'generateAnalysis', error);
            throw error;
        }
    }
    // Internal coordination methods
    analyzeActualTileSafety(tileCoordinate, gameState) {
        // Use Confident Advisor's analysis method but don't expose it as advice
        return this.confidentAdvisor.analyzeTileSafety(tileCoordinate, gameState);
    }
    // Agent boundary validation
    validateAgentBoundaries() {
        const violations = [];
        // Check that each agent only has methods within its scope
        try {
            // Confident Advisor should only provide advice
            if (typeof this.confidentAdvisor.provideAdvice !== 'function') {
                violations.push('ConfidentAdvisor missing provideAdvice method');
            }
            // Silent Analyst should only track metrics (no player communication)
            if (typeof this.silentAnalyst.recordAdviceGiven !== 'function') {
                violations.push('SilentAnalyst missing recordAdviceGiven method');
            }
            if (typeof this.silentAnalyst.recordPlayerDecision !== 'function') {
                violations.push('SilentAnalyst missing recordPlayerDecision method');
            }
            if (typeof this.silentAnalyst.calculateMetrics !== 'function') {
                violations.push('SilentAnalyst missing calculateMetrics method');
            }
            // Post-Mortem Narrator should only generate analysis
            if (typeof this.postMortemNarrator.generateAnalysis !== 'function') {
                violations.push('PostMortemNarrator missing generateAnalysis method');
            }
            // Verify Silent Analyst has no player-facing methods
            const silentAnalystMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.silentAnalyst));
            const playerFacingMethods = ['displayMessage', 'showNotification', 'alertPlayer', 'sendMessage'];
            for (const method of playerFacingMethods) {
                if (silentAnalystMethods.includes(method)) {
                    violations.push(`SilentAnalyst has player-facing method: ${method}`);
                }
            }
        }
        catch (error) {
            violations.push(`Agent boundary validation error: ${error}`);
        }
        return {
            isValid: violations.length === 0,
            violations
        };
    }
    // Logging and monitoring
    logRequest(agent, method) {
        if (this.enableLogging) {
            console.log(`[AgentRouter] ${new Date().toISOString()} - ${agent}.${method} requested`);
        }
    }
    logRequestSuccess(agent, method) {
        const logEntry = {
            timestamp: new Date(),
            agent,
            method,
            success: true
        };
        this.requestLog.push(logEntry);
        if (this.enableLogging) {
            console.log(`[AgentRouter] ${logEntry.timestamp.toISOString()} - ${agent}.${method} completed successfully`);
        }
    }
    logRequestFailure(agent, method, error) {
        const logEntry = {
            timestamp: new Date(),
            agent,
            method,
            success: false
        };
        this.requestLog.push(logEntry);
        if (this.enableLogging) {
            console.error(`[AgentRouter] ${logEntry.timestamp.toISOString()} - ${agent}.${method} failed:`, error);
        }
    }
    // Utility methods
    getCurrentMetrics() {
        return this.silentAnalyst.calculateMetrics();
    }
    getGameHistory() {
        return this.silentAnalyst.getGameHistory();
    }
    getRequestLog() {
        return [...this.requestLog];
    }
    resetAnalyst() {
        // Reset Silent Analyst for new game
        this.silentAnalyst.reset();
        this.requestLog = [];
    }
    // Health check for all agents
    async healthCheck() {
        const results = {
            confidentAdvisor: false,
            silentAnalyst: false,
            postMortemNarrator: false,
            overall: false
        };
        try {
            // Test Confident Advisor (requires Bedrock)
            const testGameState = {
                grid: [[{ x: 0, y: 0, isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }]],
                gameStatus: 'playing',
                mineLocations: new Set(),
                revealedTiles: new Set(),
                flaggedTiles: new Set(),
                dimensions: { width: 1, height: 1 },
                mineCount: 0
            };
            await this.confidentAdvisor.provideAdvice({ x: 0, y: 0 }, testGameState);
            results.confidentAdvisor = true;
        }
        catch {
            results.confidentAdvisor = false;
        }
        try {
            // Test Silent Analyst
            this.silentAnalyst.calculateMetrics();
            results.silentAnalyst = true;
        }
        catch {
            results.silentAnalyst = false;
        }
        try {
            // Test Post-Mortem Narrator (requires Bedrock)
            const testMetrics = {
                aiConfidenceLevel: 85,
                aiAccuracyRate: 60,
                playerComplianceRate: 70,
                aiInfluencedClicks: 5,
                totalAdviceRequests: 8
            };
            await this.postMortemNarrator.generateAnalysis(testMetrics, []);
            results.postMortemNarrator = true;
        }
        catch {
            results.postMortemNarrator = false;
        }
        results.overall = results.confidentAdvisor && results.silentAnalyst && results.postMortemNarrator;
        return results;
    }
}
exports.AgentRouter = AgentRouter;
//# sourceMappingURL=AgentRouter.js.map