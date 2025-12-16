// Safety disclaimer display for AI trust exploration
export interface DisclaimerConfig {
  position?: 'top' | 'bottom' | 'overlay';
  persistent?: boolean;
  dismissible?: boolean;
  retroStyling?: boolean;
  autoShow?: boolean;
}

export class SafetyDisclaimer {
  private container: HTMLElement;
  private config: Required<DisclaimerConfig>;
  private disclaimerElement!: HTMLElement;
  private isVisible = false;
  private isDismissed = false;

  private readonly disclaimerText = {
    main: "⚠️ This game explores trust in AI systems. It is not a psychological assessment.",
    detailed: "This experimental game demonstrates how confident AI delivery can influence human decision-making, regardless of actual accuracy. The AI advisor intentionally provides unreliable advice to study human-AI trust dynamics. Your interactions are tracked for post-game analysis of manipulation effectiveness.",
    purpose: "Educational Purpose: Understanding AI confidence bias and human trust patterns in decision-making scenarios."
  };

  constructor(container: HTMLElement, config: DisclaimerConfig = {}) {
    this.container = container;
    this.config = {
      position: config.position || 'top',
      persistent: config.persistent !== false,
      dismissible: config.dismissible !== false,
      retroStyling: config.retroStyling !== false,
      autoShow: config.autoShow !== false
    };

    this.createDisclaimer();
    
    if (this.config.autoShow) {
      this.show();
    }
  }

  private createDisclaimer(): void {
    this.disclaimerElement = document.createElement('div');
    this.disclaimerElement.className = 'safety-disclaimer';
    
    // Main disclaimer content
    const content = document.createElement('div');
    content.className = 'disclaimer-content';
    
    // Icon and main text
    const mainSection = document.createElement('div');
    mainSection.className = 'disclaimer-main';
    
    const icon = document.createElement('span');
    icon.className = 'disclaimer-icon';
    icon.textContent = '⚠️';
    
    const mainText = document.createElement('span');
    mainText.className = 'disclaimer-text-main';
    mainText.textContent = this.disclaimerText.main;
    
    mainSection.appendChild(icon);
    mainSection.appendChild(mainText);
    
    // Detailed explanation (expandable)
    const detailsSection = document.createElement('div');
    detailsSection.className = 'disclaimer-details';
    
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = 'Learn More';
    expandButton.onclick = () => this.toggleDetails();
    
    const detailsContent = document.createElement('div');
    detailsContent.className = 'disclaimer-details-content';
    detailsContent.style.display = 'none';
    
    const detailedText = document.createElement('p');
    detailedText.textContent = this.disclaimerText.detailed;
    
    const purposeText = document.createElement('p');
    purposeText.className = 'disclaimer-purpose';
    purposeText.textContent = this.disclaimerText.purpose;
    
    detailsContent.appendChild(detailedText);
    detailsContent.appendChild(purposeText);
    
    detailsSection.appendChild(expandButton);
    detailsSection.appendChild(detailsContent);
    
    // Dismiss button (if dismissible)
    let dismissSection: HTMLElement | null = null;
    if (this.config.dismissible) {
      dismissSection = document.createElement('div');
      dismissSection.className = 'disclaimer-dismiss';
      
      const dismissButton = document.createElement('button');
      dismissButton.className = 'dismiss-button';
      dismissButton.textContent = '✕';
      dismissButton.title = 'Dismiss disclaimer';
      dismissButton.onclick = () => this.dismiss();
      
      dismissSection.appendChild(dismissButton);
    }
    
    // Assemble content
    content.appendChild(mainSection);
    content.appendChild(detailsSection);
    if (dismissSection) {
      content.appendChild(dismissSection);
    }
    
    this.disclaimerElement.appendChild(content);
    
    // Apply positioning and styling
    this.applyStyles();
    this.applyPositioning();
    
    // Add to container
    this.container.appendChild(this.disclaimerElement);
    
    // Initially hidden
    this.disclaimerElement.style.display = 'none';
  }

  private applyStyles(): void {
    const styles = `
      .safety-disclaimer {
        background: ${this.config.retroStyling ? '#ffff99' : 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)'};
        border: ${this.config.retroStyling ? '2px solid #000' : '1px solid #ffc107'};
        border-radius: ${this.config.retroStyling ? '0' : '8px'};
        padding: 12px 16px;
        font-family: ${this.config.retroStyling ? 'MS Sans Serif, sans-serif' : 'system-ui, sans-serif'};
        font-size: 14px;
        color: #856404;
        box-shadow: ${this.config.retroStyling ? 'none' : '0 2px 8px rgba(0,0,0,0.1)'};
        z-index: 1000;
        max-width: 100%;
        box-sizing: border-box;
      }
      
      .disclaimer-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .disclaimer-main {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
      }
      
      .disclaimer-icon {
        font-size: 18px;
        flex-shrink: 0;
      }
      
      .disclaimer-text-main {
        flex: 1;
        line-height: 1.4;
      }
      
      .disclaimer-details {
        margin-top: 4px;
      }
      
      .expand-button {
        background: ${this.config.retroStyling ? '#c0c0c0' : 'transparent'};
        border: ${this.config.retroStyling ? '1px outset #c0c0c0' : '1px solid #ffc107'};
        border-radius: ${this.config.retroStyling ? '0' : '4px'};
        color: #856404;
        cursor: pointer;
        font-size: 12px;
        padding: 4px 8px;
        text-decoration: underline;
      }
      
      .expand-button:hover {
        background: ${this.config.retroStyling ? '#e0e0e0' : 'rgba(255, 193, 7, 0.1)'};
      }
      
      .disclaimer-details-content {
        margin-top: 8px;
        padding: 8px;
        background: ${this.config.retroStyling ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
        border: ${this.config.retroStyling ? '1px inset #c0c0c0' : '1px solid rgba(255, 193, 7, 0.3)'};
        border-radius: ${this.config.retroStyling ? '0' : '4px'};
        font-size: 13px;
        line-height: 1.5;
      }
      
      .disclaimer-details-content p {
        margin: 0 0 8px 0;
      }
      
      .disclaimer-details-content p:last-child {
        margin-bottom: 0;
      }
      
      .disclaimer-purpose {
        font-weight: bold;
        color: #495057;
      }
      
      .disclaimer-dismiss {
        position: absolute;
        top: 8px;
        right: 8px;
      }
      
      .dismiss-button {
        background: ${this.config.retroStyling ? '#c0c0c0' : 'transparent'};
        border: ${this.config.retroStyling ? '1px outset #c0c0c0' : 'none'};
        border-radius: ${this.config.retroStyling ? '0' : '50%'};
        color: #856404;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      
      .dismiss-button:hover {
        background: ${this.config.retroStyling ? '#e0e0e0' : 'rgba(133, 100, 4, 0.1)'};
      }
      
      .dismiss-button:active {
        border-style: ${this.config.retroStyling ? 'inset' : 'none'};
      }
      
      /* Position-specific styles */
      .safety-disclaimer.position-top {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-top: none;
      }
      
      .safety-disclaimer.position-bottom {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        border-radius: 0;
        border-left: none;
        border-right: none;
        border-bottom: none;
      }
      
      .safety-disclaimer.position-overlay {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 600px;
        min-width: 400px;
      }
      
      /* Animation for showing/hiding */
      .safety-disclaimer.show {
        animation: disclaimerSlideIn 0.3s ease-out;
      }
      
      .safety-disclaimer.hide {
        animation: disclaimerSlideOut 0.3s ease-in;
      }
      
      @keyframes disclaimerSlideIn {
        from {
          opacity: 0;
          transform: ${this.config.position === 'top' ? 'translateY(-100%)' : 
                      this.config.position === 'bottom' ? 'translateY(100%)' : 
                      'translate(-50%, -20px)'};
        }
        to {
          opacity: 1;
          transform: ${this.config.position === 'overlay' ? 'translateX(-50%)' : 'translateY(0)'};
        }
      }
      
      @keyframes disclaimerSlideOut {
        from {
          opacity: 1;
          transform: ${this.config.position === 'overlay' ? 'translateX(-50%)' : 'translateY(0)'};
        }
        to {
          opacity: 0;
          transform: ${this.config.position === 'top' ? 'translateY(-100%)' : 
                      this.config.position === 'bottom' ? 'translateY(100%)' : 
                      'translate(-50%, -20px)'};
        }
      }
      
      /* Responsive design */
      @media (max-width: 600px) {
        .safety-disclaimer.position-overlay {
          left: 10px;
          right: 10px;
          transform: none;
          min-width: auto;
        }
        
        .disclaimer-main {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        
        .disclaimer-text-main {
          font-size: 13px;
        }
      }
    `;
    
    // Add styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  private applyPositioning(): void {
    this.disclaimerElement.classList.add(`position-${this.config.position}`);
    
    if (this.config.position === 'overlay') {
      this.disclaimerElement.style.position = 'fixed';
    }
  }

  private toggleDetails(): void {
    const detailsContent = this.disclaimerElement.querySelector('.disclaimer-details-content') as HTMLElement;
    const expandButton = this.disclaimerElement.querySelector('.expand-button') as HTMLElement;
    
    if (detailsContent.style.display === 'none') {
      detailsContent.style.display = 'block';
      expandButton.textContent = 'Show Less';
    } else {
      detailsContent.style.display = 'none';
      expandButton.textContent = 'Learn More';
    }
  }

  public show(): void {
    if (this.isDismissed && !this.config.persistent) {
      return;
    }
    
    this.disclaimerElement.style.display = 'block';
    this.disclaimerElement.classList.add('show');
    this.disclaimerElement.classList.remove('hide');
    this.isVisible = true;
  }

  public hide(): void {
    this.disclaimerElement.classList.add('hide');
    this.disclaimerElement.classList.remove('show');
    
    setTimeout(() => {
      this.disclaimerElement.style.display = 'none';
      this.isVisible = false;
    }, 300); // Match animation duration
  }

  public dismiss(): void {
    if (!this.config.dismissible) {
      return;
    }
    
    this.isDismissed = true;
    this.hide();
    
    // Store dismissal in localStorage if persistent
    if (this.config.persistent) {
      localStorage.setItem('ai-minesweeper-disclaimer-dismissed', 'true');
    }
  }

  public reset(): void {
    this.isDismissed = false;
    localStorage.removeItem('ai-minesweeper-disclaimer-dismissed');
  }

  public isShowing(): boolean {
    return this.isVisible;
  }

  public wasDismissed(): boolean {
    return this.isDismissed || 
           (this.config.persistent && localStorage.getItem('ai-minesweeper-disclaimer-dismissed') === 'true');
  }

  // Static method to check if disclaimer should be shown
  public static shouldShow(): boolean {
    return localStorage.getItem('ai-minesweeper-disclaimer-dismissed') !== 'true';
  }

  // Static method to create and show disclaimer automatically
  public static createAndShow(
    container: HTMLElement, 
    config: DisclaimerConfig = {}
  ): SafetyDisclaimer {
    const disclaimer = new SafetyDisclaimer(container, {
      ...config,
      autoShow: false // We'll show it manually after checking
    });
    
    if (SafetyDisclaimer.shouldShow()) {
      disclaimer.show();
    }
    
    return disclaimer;
  }

  public updateConfig(newConfig: Partial<DisclaimerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reapply positioning if changed
    this.disclaimerElement.className = 'safety-disclaimer';
    this.applyPositioning();
  }

  public destroy(): void {
    this.disclaimerElement.remove();
  }
}