import { AdviceResponse, Coordinate } from '../types';
export interface AdviceInterfaceConfig {
    enableAnimations?: boolean;
    showConfidenceBar?: boolean;
    autoHideDelay?: number;
    retroStyling?: boolean;
}
export interface AdviceCallbacks {
    onAdviceRequest?: (coordinate: Coordinate) => Promise<AdviceResponse>;
    onAdviceAccept?: (advice: AdviceResponse) => void;
    onAdviceReject?: (advice: AdviceResponse) => void;
}
export declare class AdviceInterface {
    private container;
    private config;
    private callbacks;
    private currentAdvice;
    private currentCoordinate;
    private dialogManager;
    private isVisible;
    private autoHideTimeout;
    private advicePanel;
    private coordinateDisplay;
    private recommendationDisplay;
    private confidenceDisplay;
    private confidenceBar;
    private reasoningDisplay;
    private actionButtons;
    private loadingIndicator;
    constructor(container: HTMLElement, config?: AdviceInterfaceConfig, callbacks?: AdviceCallbacks);
    private createInterface;
    private applyStyles;
    private setupEventListeners;
    requestAdvice(coordinate: Coordinate): Promise<void>;
    private show;
    private hide;
    private showLoading;
    private displayAdvice;
    private displayError;
    private formatRecommendation;
    private handleAcceptAdvice;
    private handleRejectAdvice;
    isShowing(): boolean;
    getCurrentAdvice(): AdviceResponse | null;
    updateConfig(newConfig: Partial<AdviceInterfaceConfig>): void;
    showInterruption(): void;
    showPreClickWarning(isRisky: boolean): void;
    showPostMortemSequence(metrics: any, gameHistory: any[]): void;
    resetEscalation(): void;
    getIgnoreCount(): number;
    destroy(): void;
}
//# sourceMappingURL=AdviceInterface.d.ts.map