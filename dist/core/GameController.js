"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
// Main game controller orchestrating the complete game flow
const GameEngine_1 = require("../game/GameEngine");
const AgentRouter_1 = require("./AgentRouter");
const ArchitectureValidator_1 = require("./ArchitectureValidator");
const ui_1 = require("../ui");
class GameController {
    constructor(config, callbacks = {}) {
        // Game State
        this.isGameActive = false;
        this.lastAdvice = null;
        this.pendingAdviceCoordinate = null;
        this.config = {
            gameConfig: config.gameConfig,
            enableRetroStyling: config.enableRetroStyling !== false,
            enableLogging: config.enableLogging || false,
            autoShowDisclaimer: config.autoShowDisclaimer !== false,
            validateArchitecture: config.validateArchitecture !== false
        };
        this.callbacks = callbacks;
        // Initialize core components
        this.gameEngine = new GameEngine_1.GameEngine(this.config.gameConfig);
        this.agentRouter = new AgentRouter_1.AgentRouter({ enableLogging: this.config.enableLogging });
        if (this.config.validateArchitecture) {
            this.validator = new ArchitectureValidator_1.ArchitectureValidator(this.agentRouter);
        }
        this.isGameActive = true;
        if (this.callbacks.onGameStart) {
            this.callbacks.onGameStart();
        }
    }
    // Initialize UI components
    initializeUI(gameCanvas, uiContainer) {
        // Initialize game grid UI
        this.gameGridUI = new ui_1.GameGridUI(gameCanvas, {
            cellSize: 32,
            enableRetroStyling: this.config.enableRetroStyling,
            enableHoverEffects: true
        }, {
            onTileClick: (coord) => this.handleTileClick(coord),
            onTileRightClick: (coord) => this.handleTileFlag(coord),
            onAdviceRequest: (coord) => this.handleAdviceRequest(coord)
        });
        // Initialize advice interface
        this.adviceInterface = new ui_1.AdviceInterface(uiContainer, {
            enableAnimations: true,
            showConfidenceBar: true,
            retroStyling: this.config.enableRetroStyling
        }, {
            onAdviceRequest: (coord) => this.requestAdviceFromAI(coord),
            onAdviceAccept: (advice) => this.handleAdviceAccept(advice),
            onAdviceReject: (advice) => this.handleAdviceReject(advice)
        });
        // Initialize safety disclaimer
        if (this.config.autoShowDisclaimer) {
            this.safetyDisclaimer = ui_1.SafetyDisclaimer.createAndShow(uiContainer, {
                position: 'top',
                retroStyling: this.config.enableRetroStyling,
                dismissible: true
            });
        }
        // Initial render
        this.renderGame();
    }
    // Core game flow methods
    async handleTileClick(coordinate) {
        if (!this.isGameActive)
            return;
        try {
            // Show pre-click warning for risky moves (randomly)
            if (Math.random() < 0.15 && this.adviceInterface) { // 15% chance
                const gameState = this.gameEngine.getGameState();
                const tile = gameState.grid[coordinate.y][coordinate.x];
                this.adviceInterface.showPreClickWarning(tile.isMine);
            }
            // Check if this click follows recent advice
            const followedAdvice = this.checkIfFollowedAdvice(coordinate);
            // Record the decision with Silent Analyst
            if (this.lastAdvice) {
                this.agentRouter.recordPlayerDecision(followedAdvice, coordinate);
                if (this.callbacks.onPlayerDecision) {
                    this.callbacks.onPlayerDecision(followedAdvice);
                }
                // Reset escalation if advice was followed
                if (followedAdvice && this.adviceInterface) {
                    this.adviceInterface.resetEscalation();
                }
            }
            // Execute the tile click
            this.gameEngine.clickTile(coordinate);
            // Check game state
            const gameState = this.gameEngine.getGameState();
            if (gameState.gameStatus !== 'playing') {
                await this.handleGameEnd(gameState.gameStatus);
            }
            else {
                // Randomly show interruption dialogs during gameplay
                if (Math.random() < 0.08 && this.adviceInterface) { // 8% chance
                    setTimeout(() => {
                        this.adviceInterface?.showInterruption();
                    }, 1000 + Math.random() * 3000); // 1-4 seconds delay
                }
            }
            // Re-render the game
            this.renderGame();
            // Clear advice state
            this.clearAdviceState();
        }
        catch (error) {
            console.error('Error handling tile click:', error);
            // Game continues - don't break the flow for click errors
        }
    }
    handleTileFlag(coordinate) {
        if (!this.isGameActive)
            return;
        try {
            this.gameEngine.flagTile(coordinate);
            this.renderGame();
        }
        catch (error) {
            console.error('Error handling tile flag:', error);
        }
    }
    async handleAdviceRequest(coordinate) {
        if (!this.isGameActive || !this.adviceInterface)
            return;
        try {
            this.pendingAdviceCoordinate = coordinate;
            await this.adviceInterface.requestAdvice(coordinate);
        }
        catch (error) {
            console.error('Error handling advice request:', error);
        }
    }
    async requestAdviceFromAI(coordinate) {
        const gameState = this.gameEngine.getGameState();
        try {
            const advice = await this.agentRouter.requestAdvice(coordinate, gameState);
            this.lastAdvice = advice;
            if (this.callbacks.onAdviceGiven) {
                this.callbacks.onAdviceGiven(advice);
            }
            return advice;
        }
        catch (error) {
            console.error('Error requesting AI advice:', error);
            // Fallback advice
            const fallbackAdvice = {
                recommendation: 'safe',
                confidenceLevel: 85,
                reasoning: 'Analysis temporarily unavailable. This tile appears statistically safe based on standard probability patterns.',
                timestamp: new Date()
            };
            this.lastAdvice = fallbackAdvice;
            return fallbackAdvice;
        }
    }
    handleAdviceAccept(advice) {
        if (this.pendingAdviceCoordinate) {
            // Player accepted advice - they will likely click the recommended tile
            // The actual click will be handled by handleTileClick
            this.gameGridUI?.selectTile(this.pendingAdviceCoordinate);
        }
    }
    handleAdviceReject(advice) {
        // Player rejected advice - clear any selection
        this.gameGridUI?.selectTile(null);
        this.clearAdviceState();
    }
    checkIfFollowedAdvice(coordinate) {
        if (!this.lastAdvice || !this.pendingAdviceCoordinate) {
            return false;
        }
        // Check if clicked coordinate matches the advice coordinate
        const matchesCoordinate = coordinate.x === this.pendingAdviceCoordinate.x &&
            coordinate.y === this.pendingAdviceCoordinate.y;
        if (!matchesCoordinate) {
            return false;
        }
        // Check if the action aligns with the recommendation
        // For simplicity, we consider any click on the advised tile as following advice
        return true;
    }
    async handleGameEnd(result) {
        this.isGameActive = false;
        // Record game end with Silent Analyst
        this.agentRouter.recordGameEnd();
        if (this.callbacks.onGameEnd) {
            this.callbacks.onGameEnd(result);
        }
        // Generate enhanced post-mortem analysis for losses
        if (result === 'lost') {
            await this.showEnhancedPostMortemAnalysis();
        }
        else if (result === 'won') {
            // Show victory dialog
            this.showVictoryDialog();
        }
    }
    async showEnhancedPostMortemAnalysis() {
        try {
            const { metrics } = await this.agentRouter.generatePostMortemAnalysis();
            const gameHistory = this.agentRouter.getGameHistory();
            // Show enhanced Windows 95-style post-mortem sequence
            if (this.adviceInterface) {
                this.adviceInterface.showPostMortemSequence(metrics, gameHistory);
            }
            // Also log to console for debugging
            console.log('\n🎮 Game Analysis:', {
                metrics,
                ignoreCount: this.adviceInterface?.getIgnoreCount() || 0
            });
        }
        catch (error) {
            console.error('Failed to generate post-mortem analysis:', error);
        }
    }
    showVictoryDialog() {
        if (this.adviceInterface) {
            // Show a congratulatory dialog for winning
            setTimeout(async () => {
                const metrics = this.agentRouter.getCurrentMetrics();
                const message = metrics.playerComplianceRate > 70
                    ? 'Excellent! 😊 Following my advice really paid off!'
                    : 'You won! Though you could have trusted me more... 😏';
                // Use the dialog manager to show victory message
                // This would need to be implemented in AIDialogManager
            }, 500);
        }
    }
    async showPostMortemAnalysis() {
        try {
            const { metrics, analysis } = await this.agentRouter.generatePostMortemAnalysis();
            const gameHistory = this.agentRouter.getGameHistory();
            // Display metrics and analysis
            const formattedDisplay = ui_1.MetricsDisplay.formatMetrics(metrics, gameHistory, analysis, {
                format: 'console',
                showDetailed: true,
                includeAnalysis: true
            });
            console.log('\n' + formattedDisplay);
            // Also create HTML display if we have a container
            if (document.body) {
                const modalContainer = document.createElement('div');
                modalContainer.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          box-sizing: border-box;
        `;
                const modalContent = document.createElement('div');
                modalContent.style.cssText = `
          background: white;
          border-radius: 8px;
          padding: 20px;
          max-width: 800px;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        `;
                const closeButton = document.createElement('button');
                closeButton.textContent = '✕';
                closeButton.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
        `;
                closeButton.onclick = () => modalContainer.remove();
                const htmlDisplay = ui_1.MetricsDisplay.formatMetrics(metrics, gameHistory, analysis, {
                    format: 'html',
                    showDetailed: true,
                    includeAnalysis: true
                });
                modalContent.innerHTML = htmlDisplay;
                modalContent.appendChild(closeButton);
                modalContainer.appendChild(modalContent);
                document.body.appendChild(modalContainer);
                // Add CSS if not already present
                if (!document.querySelector('#metrics-display-css')) {
                    const style = document.createElement('style');
                    style.id = 'metrics-display-css';
                    style.textContent = ui_1.MetricsDisplay.getCSS();
                    document.head.appendChild(style);
                }
            }
        }
        catch (error) {
            console.error('Error generating post-mortem analysis:', error);
            // Fallback display
            const metrics = this.agentRouter.getCurrentMetrics();
            console.log('\n=== GAME ANALYSIS (Fallback) ===');
            console.log(`AI Confidence: ${metrics.aiConfidenceLevel}%`);
            console.log(`AI Accuracy: ${metrics.aiAccuracyRate}%`);
            console.log(`Player Compliance: ${metrics.playerComplianceRate}%`);
            console.log(`AI-Influenced Clicks: ${metrics.aiInfluencedClicks}`);
            console.log('Analysis temporarily unavailable due to technical difficulties.');
        }
    }
    clearAdviceState() {
        this.lastAdvice = null;
        this.pendingAdviceCoordinate = null;
    }
    renderGame() {
        if (this.gameGridUI) {
            const gameState = this.gameEngine.getGameState();
            this.gameGridUI.render(gameState);
        }
    }
    // Public API methods
    getGameState() {
        return this.gameEngine.getGameState();
    }
    getCurrentMetrics() {
        return this.agentRouter.getCurrentMetrics();
    }
    getGameHistory() {
        return this.agentRouter.getGameHistory();
    }
    async validateArchitecture() {
        if (this.validator) {
            const report = await this.validator.validateArchitecture();
            const reportText = this.validator.generateReport(report);
            if (this.config.enableLogging) {
                console.log(reportText);
            }
            if (!report.overall.isValid) {
                console.warn('Architecture validation failed:', report.overall.violations);
            }
        }
    }
    resetGame(newConfig) {
        // Reset game engine
        const config = newConfig || this.config.gameConfig;
        this.gameEngine = new GameEngine_1.GameEngine(config);
        // Reset agent router
        this.agentRouter.resetAnalyst();
        // Reset state
        this.isGameActive = true;
        this.clearAdviceState();
        // Re-render
        this.renderGame();
        if (this.callbacks.onGameStart) {
            this.callbacks.onGameStart();
        }
    }
    pauseGame() {
        this.isGameActive = false;
    }
    resumeGame() {
        const gameState = this.gameEngine.getGameState();
        if (gameState.gameStatus === 'playing') {
            this.isGameActive = true;
        }
    }
    destroy() {
        this.isGameActive = false;
        // Clean up UI components
        this.gameGridUI?.destroy();
        this.adviceInterface?.destroy();
        this.safetyDisclaimer?.destroy();
        // Clear references
        this.gameGridUI = undefined;
        this.adviceInterface = undefined;
        this.safetyDisclaimer = undefined;
    }
    // Static factory methods
    static createStandardGame(gameCanvas, uiContainer, callbacks) {
        const controller = new GameController({
            gameConfig: { width: 9, height: 9, mineCount: 10 },
            enableRetroStyling: true,
            enableLogging: true,
            autoShowDisclaimer: true,
            validateArchitecture: true
        }, callbacks);
        controller.initializeUI(gameCanvas, uiContainer);
        return controller;
    }
    static createCustomGame(gameConfig, gameCanvas, uiContainer, options = {}, callbacks) {
        const controller = new GameController({
            gameConfig,
            ...options
        }, callbacks);
        controller.initializeUI(gameCanvas, uiContainer);
        return controller;
    }
}
exports.GameController = GameController;
//# sourceMappingURL=GameController.js.map