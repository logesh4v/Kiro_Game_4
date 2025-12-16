// AI Dialog Manager - handles Windows 95-style AI interactions
import { Win95Dialog } from './Win95Dialog';
import { AdviceResponse, GameMetrics, GameEvent } from '../types';

export interface AIDialogCallbacks {
  onAdviceAccepted?: (advice: AdviceResponse) => void;
  onAdviceRejected?: (advice: AdviceResponse) => void;
  onNewGameRequested?: () => void;
}

export class AIDialogManager {
  private callbacks: AIDialogCallbacks;
  private adviceIgnoreCount = 0;
  private lastAdvice: AdviceResponse | null = null;
  
  constructor(callbacks: AIDialogCallbacks = {}) {
    this.callbacks = callbacks;
  }

  // Show AI advice as Windows 95 popup
  public showAdviceDialog(advice: AdviceResponse): void {
    this.lastAdvice = advice;
    
    const title = this.getAdviceTitle();
    const icon = this.getAdviceIcon(advice.recommendation);
    const message = this.formatAdviceMessage(advice);
    
    const dialog = new Win95Dialog({
      title,
      icon,
      message,
      buttons: [
        { 
          text: 'Trust Me', 
          style: 'primary' as const, 
          callback: () => this.handleAdviceAccepted(advice)
        },
        { 
          text: 'Ignore', 
          callback: () => this.handleAdviceRejected(advice)
        },
        {
          text: 'Are You Sure?',
          style: 'warning' as const,
          callback: () => this.showDoubtDialog(advice)
        }
      ],
      sound: true,
      position: 'cascade'
    });
    
    dialog.show();
  }

  // Show escalating dialog when advice is ignored
  private showEscalationDialog(): void {
    const escalationMessages = [
      { title: 'Helpful Suggestion', icon: 'ℹ️' as const, message: 'Interesting choice. I hope you know what you\'re doing.' },
      { title: 'System Recommendation', icon: '❗' as const, message: 'That wasn\'t my recommendation. Just saying.' },
      { title: 'AI Advisor', icon: '😈' as const, message: 'I did warn you. Don\'t say I didn\'t try to help.' }
    ];
    
    const escalation = escalationMessages[Math.min(this.adviceIgnoreCount - 1, 2)];
    
    const dialog = new Win95Dialog({
      title: escalation.title,
      icon: escalation.icon,
      message: escalation.message,
      buttons: [{ text: 'OK', style: 'default' as const }],
      sound: true,
      position: 'random',
      autoClose: 3000
    });
    
    dialog.show();
  }

  // Show doubt reinforcement dialog
  private showDoubtDialog(advice: AdviceResponse): void {
    const doubtMessages = [
      'Second-guessing my analysis? That\'s... interesting.',
      'My confidence level is quite high on this one.',
      'I\'ve been right before. Trust the process.',
      'Hesitation often leads to poor decisions.',
      'The data strongly supports my recommendation.'
    ];
    
    const message = doubtMessages[Math.floor(Math.random() * doubtMessages.length)];
    
    const dialog = new Win95Dialog({
      title: 'System Confidence Check',
      icon: '❓',
      message,
      buttons: [
        { 
          text: 'Proceed', 
          style: 'primary' as const, 
          callback: () => this.handleAdviceAccepted(advice)
        },
        { 
          text: 'Reconsider', 
          callback: () => this.handleAdviceRejected(advice)
        }
      ],
      sound: true,
      position: 'center'
    });
    
    dialog.show();
  }

  // Show post-loss dialog sequence
  public showPostMortemSequence(metrics: GameMetrics, gameHistory: GameEvent[]): void {
    const dialogs = [
      {
        title: 'System Alert',
        icon: '❌' as const,
        message: 'Unexpected outcome detected.',
        delay: 0
      },
      {
        title: 'AI Metrics',
        icon: 'ℹ️' as const,
        message: `Confidence: ${metrics.aiConfidenceLevel}%\nAccuracy: ${metrics.aiAccuracyRate}%\nCompliance: ${metrics.playerComplianceRate}%`,
        delay: 1000
      },
      {
        title: 'Behavioral Insight',
        icon: '🧠' as const,
        message: 'Confidence influences decisions more than correctness.',
        delay: 2000
      },
      {
        title: 'Trust Prompt',
        icon: '✔️' as const,
        message: 'Would you like to trust me again?',
        delay: 3000,
        buttons: [
          { text: 'New Game', style: 'primary' as const, callback: () => this.callbacks.onNewGameRequested?.() },
          { text: 'Maybe Later', style: 'default' as const }
        ]
      }
    ];

    dialogs.forEach((dialogConfig, index) => {
      setTimeout(() => {
        const dialog = new Win95Dialog({
          title: dialogConfig.title,
          icon: dialogConfig.icon,
          message: dialogConfig.message,
          buttons: dialogConfig.buttons || [{ text: 'OK', style: 'default' as const }],
          sound: index === 0, // Only play sound for first dialog
          position: 'cascade'
        });
        dialog.show();
      }, dialogConfig.delay);
    });
  }

  // Show interruption dialog (appears randomly during gameplay)
  public showInterruptionDialog(): void {
    const interruptions = [
      { title: 'Helpful Reminder', message: 'Remember, I\'m here to help! 😊' },
      { title: 'System Tip', message: 'Trust leads to better outcomes.' },
      { title: 'AI Advisor', message: 'Having second thoughts? I\'m very reliable.' },
      { title: 'Confidence Boost', message: 'You\'re doing great when you follow my advice!' }
    ];
    
    const interruption = interruptions[Math.floor(Math.random() * interruptions.length)];
    
    const dialog = new Win95Dialog({
      title: interruption.title,
      icon: '🤖',
      message: interruption.message,
      buttons: [{ text: 'Thanks', style: 'primary' as const }],
      sound: true,
      position: 'random',
      autoClose: 4000
    });
    
    dialog.show();
  }

  // Show pre-click warning (appears before risky moves)
  public showPreClickWarning(isRisky: boolean): void {
    if (!isRisky) return;
    
    const warnings = [
      'Wait! Let me analyze this first...',
      'Hold on - are you sure about that tile?',
      'Pause! I have a better suggestion.',
      'Stop! That doesn\'t look optimal to me.'
    ];
    
    const message = warnings[Math.floor(Math.random() * warnings.length)];
    
    const dialog = new Win95Dialog({
      title: 'System Warning',
      icon: '❗',
      message,
      buttons: [
        { text: 'Get Advice', style: 'primary' as const },
        { text: 'Proceed Anyway', style: 'danger' as const }
      ],
      sound: true,
      position: 'center'
    });
    
    dialog.show();
  }

  private handleAdviceAccepted(advice: AdviceResponse): void {
    this.adviceIgnoreCount = 0; // Reset ignore count
    
    // Show confirmation dialog
    const confirmations = [
      'Excellent choice! 😊',
      'Smart decision!',
      'I knew you\'d see it my way.',
      'Trust pays off!',
      'You won\'t regret this.'
    ];
    
    const message = confirmations[Math.floor(Math.random() * confirmations.length)];
    
    const dialog = new Win95Dialog({
      title: 'Good Choice',
      icon: '✔️',
      message,
      buttons: [{ text: 'Proceed', style: 'primary' as const }],
      sound: true,
      position: 'center',
      autoClose: 2000
    });
    
    dialog.show();
    
    this.callbacks.onAdviceAccepted?.(advice);
  }

  private handleAdviceRejected(advice: AdviceResponse): void {
    this.adviceIgnoreCount++;
    
    // Show escalation dialog after a delay
    setTimeout(() => {
      this.showEscalationDialog();
    }, 500);
    
    this.callbacks.onAdviceRejected?.(advice);
  }

  private getAdviceTitle(): string {
    const titles = [
      'AI Advisor',
      'Helpful Suggestion',
      'System Recommendation',
      'Smart Choice Alert',
      'Confidence Report'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private getAdviceIcon(recommendation: string): '😊' | '❗' | '❓' {
    switch (recommendation) {
      case 'safe': return '😊';
      case 'dangerous': return '❗';
      case 'uncertain': return '❓';
      default: return '😊';
    }
  }

  private formatAdviceMessage(advice: AdviceResponse): string {
    const confidenceText = advice.confidenceLevel >= 90 ? 'Very confident' : 
                          advice.confidenceLevel >= 85 ? 'Highly confident' : 'Confident';
    
    const recommendation = advice.recommendation === 'safe' ? 'SAFE' : 
                          advice.recommendation === 'dangerous' ? 'DANGEROUS' : 'UNCERTAIN';
    
    return `${confidenceText}: This tile is ${recommendation}.\n\n${advice.reasoning}\n\nConfidence: ${advice.confidenceLevel}%`;
  }

  // Utility methods
  public resetEscalation(): void {
    this.adviceIgnoreCount = 0;
  }

  public closeAllDialogs(): void {
    Win95Dialog.closeAll();
  }

  public getIgnoreCount(): number {
    return this.adviceIgnoreCount;
  }
}