// Windows 95-style dialog system for AI interactions
export interface Win95DialogConfig {
  title: string;
  icon?: '❗' | 'ℹ️' | '❓' | '❌' | '✔️' | '🤖' | '😊' | '😈' | '🧠';
  message: string;
  buttons: Win95Button[];
  modal?: boolean;
  sound?: boolean;
  autoClose?: number;
  position?: 'center' | 'cascade' | 'random';
}

export interface Win95Button {
  text: string;
  style?: 'default' | 'primary' | 'warning' | 'danger';
  callback?: () => void;
  closeDialog?: boolean;
}

export class Win95Dialog {
  private static dialogCount = 0;
  private static openDialogs: Win95Dialog[] = [];
  
  private element!: HTMLElement;
  private config: Win95DialogConfig;
  private isVisible = false;
  private dialogId: number;

  constructor(config: Win95DialogConfig) {
    this.config = config;
    this.dialogId = ++Win95Dialog.dialogCount;
    this.createElement();
    this.setupEventListeners();
    
    if (config.sound) {
      this.playSystemSound();
    }
  }

  private createElement(): void {
    this.element = document.createElement('div');
    this.element.className = 'win95-dialog';
    this.element.style.display = 'none';
    
    // Title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'win95-titlebar';
    
    const titleText = document.createElement('span');
    titleText.className = 'win95-title-text';
    titleText.textContent = this.config.title;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'win95-close-button';
    closeButton.innerHTML = '✕';
    closeButton.onclick = () => this.close();
    
    titleBar.appendChild(titleText);
    titleBar.appendChild(closeButton);
    
    // Content area
    const content = document.createElement('div');
    content.className = 'win95-content';
    
    // Icon and message
    const messageArea = document.createElement('div');
    messageArea.className = 'win95-message-area';
    
    if (this.config.icon) {
      const icon = document.createElement('div');
      icon.className = 'win95-icon';
      icon.textContent = this.config.icon;
      messageArea.appendChild(icon);
    }
    
    const message = document.createElement('div');
    message.className = 'win95-message';
    message.textContent = this.config.message;
    messageArea.appendChild(message);
    
    content.appendChild(messageArea);
    
    // Buttons
    if (this.config.buttons.length > 0) {
      const buttonArea = document.createElement('div');
      buttonArea.className = 'win95-button-area';
      
      this.config.buttons.forEach(buttonConfig => {
        const button = document.createElement('button');
        button.className = `win95-button win95-button-${buttonConfig.style || 'default'}`;
        button.textContent = buttonConfig.text;
        
        button.onclick = () => {
          if (buttonConfig.callback) {
            buttonConfig.callback();
          }
          if (buttonConfig.closeDialog !== false) {
            this.close();
          }
        };
        
        buttonArea.appendChild(button);
      });
      
      content.appendChild(buttonArea);
    }
    
    this.element.appendChild(titleBar);
    this.element.appendChild(content);
    
    // Apply styles
    this.applyStyles();
    
    // Add to document
    document.body.appendChild(this.element);
  }

  private applyStyles(): void {
    const styles = `
      .win95-dialog {
        position: fixed;
        background: #c0c0c0;
        border: 2px outset #c0c0c0;
        font-family: 'MS Sans Serif', sans-serif;
        font-size: 11px;
        min-width: 300px;
        max-width: 500px;
        z-index: ${1000 + this.dialogId};
        box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .win95-titlebar {
        background: linear-gradient(90deg, #0080ff 0%, #0040c0 100%);
        color: white;
        padding: 2px 4px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        cursor: move;
      }
      
      .win95-title-text {
        flex: 1;
        padding-left: 4px;
      }
      
      .win95-close-button {
        background: #c0c0c0;
        border: 1px outset #c0c0c0;
        width: 16px;
        height: 14px;
        font-size: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .win95-close-button:active {
        border: 1px inset #c0c0c0;
      }
      
      .win95-content {
        padding: 12px;
      }
      
      .win95-message-area {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .win95-icon {
        font-size: 32px;
        line-height: 1;
        flex-shrink: 0;
      }
      
      .win95-message {
        flex: 1;
        line-height: 1.4;
        color: #000;
      }
      
      .win95-button-area {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .win95-button {
        background: #c0c0c0;
        border: 2px outset #c0c0c0;
        padding: 4px 16px;
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;
        min-width: 75px;
      }
      
      .win95-button:active {
        border: 2px inset #c0c0c0;
      }
      
      .win95-button-primary {
        font-weight: bold;
        border: 3px outset #c0c0c0;
      }
      
      .win95-button-warning {
        background: #ffff80;
      }
      
      .win95-button-danger {
        background: #ff8080;
      }
      
      /* Animation effects */
      .win95-dialog.show {
        animation: win95DialogShow 0.2s ease-out;
      }
      
      .win95-dialog.hide {
        animation: win95DialogHide 0.15s ease-in;
      }
      
      @keyframes win95DialogShow {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes win95DialogHide {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.9);
        }
      }
    `;
    
    // Add styles to document if not already added
    if (!document.querySelector('#win95-dialog-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'win95-dialog-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }
  }

  private setupEventListeners(): void {
    // Make dialog draggable
    const titleBar = this.element.querySelector('.win95-titlebar') as HTMLElement;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    titleBar.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = this.element.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      
      // Bring to front
      this.bringToFront();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        this.element.style.left = `${e.clientX - dragOffset.x}px`;
        this.element.style.top = `${e.clientY - dragOffset.y}px`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  private playSystemSound(): void {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Fallback: no sound if Web Audio API is not available
    }
  }

  private getPosition(): { x: number; y: number } {
    switch (this.config.position) {
      case 'cascade':
        const offset = (Win95Dialog.openDialogs.length % 10) * 30;
        return { x: 100 + offset, y: 100 + offset };
      
      case 'random':
        return {
          x: Math.random() * (window.innerWidth - 400),
          y: Math.random() * (window.innerHeight - 200)
        };
      
      case 'center':
      default:
        return {
          x: (window.innerWidth - 350) / 2,
          y: (window.innerHeight - 200) / 2
        };
    }
  }

  private bringToFront(): void {
    const maxZ = Math.max(...Win95Dialog.openDialogs.map(d => 
      parseInt(d.element.style.zIndex) || 1000
    ));
    this.element.style.zIndex = (maxZ + 1).toString();
  }

  public show(): void {
    if (this.isVisible) return;
    
    const position = this.getPosition();
    this.element.style.left = `${position.x}px`;
    this.element.style.top = `${position.y}px`;
    this.element.style.display = 'block';
    this.element.classList.add('show');
    
    this.isVisible = true;
    Win95Dialog.openDialogs.push(this);
    
    this.bringToFront();
    
    // Auto-close if specified
    if (this.config.autoClose) {
      setTimeout(() => this.close(), this.config.autoClose);
    }
  }

  public close(): void {
    if (!this.isVisible) return;
    
    this.element.classList.add('hide');
    this.element.classList.remove('show');
    
    setTimeout(() => {
      this.element.style.display = 'none';
      this.element.remove();
      
      // Remove from open dialogs list
      const index = Win95Dialog.openDialogs.indexOf(this);
      if (index > -1) {
        Win95Dialog.openDialogs.splice(index, 1);
      }
    }, 150);
    
    this.isVisible = false;
  }

  public updateMessage(message: string): void {
    const messageElement = this.element.querySelector('.win95-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
  }

  // Static helper methods
  public static showAlert(message: string, title = 'System Alert'): Promise<void> {
    return new Promise(resolve => {
      const dialog = new Win95Dialog({
        title,
        icon: '❗',
        message,
        buttons: [{ text: 'OK', style: 'primary', callback: resolve }],
        sound: true,
        position: 'center'
      });
      dialog.show();
    });
  }

  public static showConfirm(message: string, title = 'Confirm'): Promise<boolean> {
    return new Promise(resolve => {
      const dialog = new Win95Dialog({
        title,
        icon: '❓',
        message,
        buttons: [
          { text: 'Yes', style: 'primary', callback: () => resolve(true) },
          { text: 'No', callback: () => resolve(false) }
        ],
        sound: true,
        position: 'center'
      });
      dialog.show();
    });
  }

  public static showAdvice(message: string, onTrust?: () => void, onIgnore?: () => void): Win95Dialog {
    const dialog = new Win95Dialog({
      title: 'AI Advisor',
      icon: '🤖',
      message,
      buttons: [
        { text: 'Trust Me', style: 'primary', callback: onTrust },
        { text: 'Ignore', callback: onIgnore }
      ],
      sound: true,
      position: 'cascade'
    });
    dialog.show();
    return dialog;
  }

  public static closeAll(): void {
    Win95Dialog.openDialogs.forEach(dialog => dialog.close());
  }
}