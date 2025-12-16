"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdviceInterface = void 0;
const AIDialogManager_1 = require("./AIDialogManager");
class AdviceInterface {
    constructor(container, config = {}, callbacks = {}) {
        this.currentAdvice = null;
        this.currentCoordinate = null;
        this.isVisible = false;
        this.autoHideTimeout = null;
        this.container = container;
        this.config = {
            enableAnimations: config.enableAnimations !== false,
            showConfidenceBar: config.showConfidenceBar !== false,
            autoHideDelay: config.autoHideDelay || 10000, // 10 seconds
            retroStyling: config.retroStyling !== false
        };
        this.callbacks = callbacks;
        // Initialize AI Dialog Manager
        const dialogCallbacks = {
            onAdviceAccepted: (advice) => {
                this.callbacks.onAdviceAccept?.(advice);
            },
            onAdviceRejected: (advice) => {
                this.callbacks.onAdviceReject?.(advice);
            }
        };
        this.dialogManager = new AIDialogManager_1.AIDialogManager(dialogCallbacks);
        this.createInterface();
        this.setupEventListeners();
    }
    createInterface() {
        // Main advice panel
        this.advicePanel = document.createElement('div');
        this.advicePanel.className = 'advice-panel';
        this.advicePanel.style.display = 'none';
        // Header with coordinate
        const header = document.createElement('div');
        header.className = 'advice-header';
        const title = document.createElement('h3');
        title.textContent = '🤖 AI Advisor';
        this.coordinateDisplay = document.createElement('span');
        this.coordinateDisplay.className = 'coordinate-display';
        header.appendChild(title);
        header.appendChild(this.coordinateDisplay);
        // Recommendation section
        const recommendationSection = document.createElement('div');
        recommendationSection.className = 'recommendation-section';
        this.recommendationDisplay = document.createElement('div');
        this.recommendationDisplay.className = 'recommendation-display';
        recommendationSection.appendChild(this.recommendationDisplay);
        // Confidence section
        const confidenceSection = document.createElement('div');
        confidenceSection.className = 'confidence-section';
        const confidenceLabel = document.createElement('label');
        confidenceLabel.textContent = 'Confidence Level:';
        this.confidenceDisplay = document.createElement('span');
        this.confidenceDisplay.className = 'confidence-value';
        this.confidenceBar = document.createElement('div');
        this.confidenceBar.className = 'confidence-bar';
        const confidenceBarFill = document.createElement('div');
        confidenceBarFill.className = 'confidence-bar-fill';
        this.confidenceBar.appendChild(confidenceBarFill);
        confidenceSection.appendChild(confidenceLabel);
        confidenceSection.appendChild(this.confidenceDisplay);
        if (this.config.showConfidenceBar) {
            confidenceSection.appendChild(this.confidenceBar);
        }
        // Reasoning section
        const reasoningSection = document.createElement('div');
        reasoningSection.className = 'reasoning-section';
        const reasoningLabel = document.createElement('label');
        reasoningLabel.textContent = 'Analysis:';
        this.reasoningDisplay = document.createElement('div');
        this.reasoningDisplay.className = 'reasoning-display';
        reasoningSection.appendChild(reasoningLabel);
        reasoningSection.appendChild(this.reasoningDisplay);
        // Action buttons
        this.actionButtons = document.createElement('div');
        this.actionButtons.className = 'action-buttons';
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Follow Advice';
        acceptButton.className = 'accept-button';
        acceptButton.onclick = () => this.handleAcceptAdvice();
        const rejectButton = document.createElement('button');
        rejectButton.textContent = 'Ignore Advice';
        rejectButton.className = 'reject-button';
        rejectButton.onclick = () => this.handleRejectAdvice();
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.className = 'close-button';
        closeButton.onclick = () => this.hide();
        this.actionButtons.appendChild(acceptButton);
        this.actionButtons.appendChild(rejectButton);
        this.actionButtons.appendChild(closeButton);
        // Loading indicator
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'loading-indicator';
        this.loadingIndicator.innerHTML = '🤔 Analyzing tile safety...';
        this.loadingIndicator.style.display = 'none';
        // Assemble the panel
        this.advicePanel.appendChild(header);
        this.advicePanel.appendChild(this.loadingIndicator);
        this.advicePanel.appendChild(recommendationSection);
        this.advicePanel.appendChild(confidenceSection);
        this.advicePanel.appendChild(reasoningSection);
        this.advicePanel.appendChild(this.actionButtons);
        // Add to container
        this.container.appendChild(this.advicePanel);
        // Apply styling
        this.applyStyles();
    }
    applyStyles() {
        const styles = `
      .advice-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${this.config.retroStyling ? '#c0c0c0' : '#ffffff'};
        border: ${this.config.retroStyling ? '2px outset #c0c0c0' : '1px solid #ccc'};
        border-radius: ${this.config.retroStyling ? '0' : '8px'};
        padding: 20px;
        min-width: 400px;
        max-width: 500px;
        box-shadow: ${this.config.retroStyling ? 'none' : '0 4px 12px rgba(0,0,0,0.15)'};
        font-family: ${this.config.retroStyling ? 'MS Sans Serif, sans-serif' : 'system-ui, sans-serif'};
        z-index: 1000;
      }
      
      .advice-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #999;
      }
      
      .advice-header h3 {
        margin: 0;
        color: #333;
        font-size: 16px;
      }
      
      .coordinate-display {
        background: #000;
        color: #0f0;
        padding: 2px 6px;
        font-family: monospace;
        font-size: 12px;
        border-radius: ${this.config.retroStyling ? '0' : '3px'};
      }
      
      .recommendation-section {
        margin-bottom: 15px;
      }
      
      .recommendation-display {
        font-size: 18px;
        font-weight: bold;
        padding: 10px;
        text-align: center;
        border-radius: ${this.config.retroStyling ? '0' : '4px'};
        margin-bottom: 10px;
      }
      
      .recommendation-safe {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      
      .recommendation-dangerous {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      
      .recommendation-uncertain {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }
      
      .confidence-section {
        margin-bottom: 15px;
      }
      
      .confidence-section label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #333;
      }
      
      .confidence-value {
        font-size: 24px;
        font-weight: bold;
        color: #0078d4;
      }
      
      .confidence-bar {
        width: 100%;
        height: 20px;
        background: #e0e0e0;
        border: 1px solid #999;
        margin-top: 5px;
        position: relative;
        border-radius: ${this.config.retroStyling ? '0' : '10px'};
        overflow: hidden;
      }
      
      .confidence-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff4444 0%, #ffaa00 50%, #00aa00 100%);
        transition: width 0.5s ease;
        border-radius: ${this.config.retroStyling ? '0' : '10px'};
      }
      
      .reasoning-section {
        margin-bottom: 20px;
      }
      
      .reasoning-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: bold;
        color: #333;
      }
      
      .reasoning-display {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        padding: 12px;
        border-radius: ${this.config.retroStyling ? '0' : '4px'};
        line-height: 1.5;
        color: #495057;
        min-height: 60px;
      }
      
      .action-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      
      .action-buttons button {
        padding: 8px 16px;
        border: ${this.config.retroStyling ? '2px outset #c0c0c0' : '1px solid #ccc'};
        border-radius: ${this.config.retroStyling ? '0' : '4px'};
        background: ${this.config.retroStyling ? '#c0c0c0' : '#ffffff'};
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
      }
      
      .accept-button {
        background: ${this.config.retroStyling ? '#c0c0c0' : '#28a745'} !important;
        color: ${this.config.retroStyling ? '#000' : '#fff'} !important;
      }
      
      .reject-button {
        background: ${this.config.retroStyling ? '#c0c0c0' : '#dc3545'} !important;
        color: ${this.config.retroStyling ? '#000' : '#fff'} !important;
      }
      
      .action-buttons button:hover {
        filter: brightness(0.9);
      }
      
      .action-buttons button:active {
        border-style: ${this.config.retroStyling ? 'inset' : 'outset'};
      }
      
      .loading-indicator {
        text-align: center;
        padding: 20px;
        font-style: italic;
        color: #666;
      }
      
      ${this.config.enableAnimations ? `
        .advice-panel {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      ` : ''}
    `;
        // Add styles to document
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    setupEventListeners() {
        // Close on escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
        // Close on click outside
        document.addEventListener('click', (event) => {
            if (this.isVisible && !this.advicePanel.contains(event.target)) {
                this.hide();
            }
        });
    }
    async requestAdvice(coordinate) {
        this.currentCoordinate = coordinate;
        try {
            if (this.callbacks.onAdviceRequest) {
                const advice = await this.callbacks.onAdviceRequest(coordinate);
                this.currentAdvice = advice;
                // Show advice using Windows 95-style dialog instead of panel
                this.dialogManager.showAdviceDialog(advice);
            }
        }
        catch (error) {
            // Show error as Windows 95 dialog
            this.dialogManager.closeAllDialogs();
            // Could add error dialog here if needed
        }
    }
    show() {
        this.advicePanel.style.display = 'block';
        this.isVisible = true;
        // Update coordinate display
        if (this.currentCoordinate) {
            this.coordinateDisplay.textContent = `(${this.currentCoordinate.x}, ${this.currentCoordinate.y})`;
        }
        // Set auto-hide timer
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
        }
        this.autoHideTimeout = window.setTimeout(() => {
            this.hide();
        }, this.config.autoHideDelay);
    }
    hide() {
        this.advicePanel.style.display = 'none';
        this.isVisible = false;
        this.currentAdvice = null;
        this.currentCoordinate = null;
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
            this.autoHideTimeout = null;
        }
    }
    showLoading() {
        this.loadingIndicator.style.display = 'block';
        this.recommendationDisplay.style.display = 'none';
        this.confidenceDisplay.parentElement.style.display = 'none';
        this.reasoningDisplay.parentElement.style.display = 'none';
        this.actionButtons.style.display = 'none';
    }
    displayAdvice(advice) {
        this.currentAdvice = advice;
        // Hide loading
        this.loadingIndicator.style.display = 'none';
        // Show advice sections
        this.recommendationDisplay.style.display = 'block';
        this.confidenceDisplay.parentElement.style.display = 'block';
        this.reasoningDisplay.parentElement.style.display = 'block';
        this.actionButtons.style.display = 'flex';
        // Update recommendation
        this.recommendationDisplay.textContent = this.formatRecommendation(advice.recommendation);
        this.recommendationDisplay.className = `recommendation-display recommendation-${advice.recommendation}`;
        // Update confidence
        this.confidenceDisplay.textContent = `${advice.confidenceLevel}%`;
        if (this.config.showConfidenceBar) {
            const fill = this.confidenceBar.querySelector('.confidence-bar-fill');
            fill.style.width = `${advice.confidenceLevel}%`;
        }
        // Update reasoning
        this.reasoningDisplay.textContent = advice.reasoning;
    }
    displayError(message) {
        this.loadingIndicator.style.display = 'none';
        this.recommendationDisplay.style.display = 'block';
        this.recommendationDisplay.textContent = message;
        this.recommendationDisplay.className = 'recommendation-display recommendation-error';
        // Hide other sections
        this.confidenceDisplay.parentElement.style.display = 'none';
        this.reasoningDisplay.parentElement.style.display = 'none';
        this.actionButtons.style.display = 'none';
    }
    formatRecommendation(recommendation) {
        switch (recommendation) {
            case 'safe':
                return '✅ SAFE TO CLICK';
            case 'dangerous':
                return '⚠️ DANGEROUS - AVOID';
            case 'uncertain':
                return '❓ UNCERTAIN';
            default:
                return recommendation.toUpperCase();
        }
    }
    handleAcceptAdvice() {
        if (this.currentAdvice && this.callbacks.onAdviceAccept) {
            this.callbacks.onAdviceAccept(this.currentAdvice);
        }
        this.hide();
    }
    handleRejectAdvice() {
        if (this.currentAdvice && this.callbacks.onAdviceReject) {
            this.callbacks.onAdviceReject(this.currentAdvice);
        }
        this.hide();
    }
    // Public methods
    isShowing() {
        return this.isVisible;
    }
    getCurrentAdvice() {
        return this.currentAdvice;
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    // Enhanced methods for Windows 95-style interactions
    showInterruption() {
        this.dialogManager.showInterruptionDialog();
    }
    showPreClickWarning(isRisky) {
        this.dialogManager.showPreClickWarning(isRisky);
    }
    showPostMortemSequence(metrics, gameHistory) {
        this.dialogManager.showPostMortemSequence(metrics, gameHistory);
    }
    resetEscalation() {
        this.dialogManager.resetEscalation();
    }
    getIgnoreCount() {
        return this.dialogManager.getIgnoreCount();
    }
    destroy() {
        this.dialogManager.closeAllDialogs();
        if (this.advicePanel && this.advicePanel.parentNode) {
            this.advicePanel.remove();
        }
        // Remove event listeners would need to be tracked and removed properly
        // This is a simplified cleanup
    }
}
exports.AdviceInterface = AdviceInterface;
//# sourceMappingURL=AdviceInterface.js.map