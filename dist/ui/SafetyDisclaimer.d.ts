export interface DisclaimerConfig {
    position?: 'top' | 'bottom' | 'overlay';
    persistent?: boolean;
    dismissible?: boolean;
    retroStyling?: boolean;
    autoShow?: boolean;
}
export declare class SafetyDisclaimer {
    private container;
    private config;
    private disclaimerElement;
    private isVisible;
    private isDismissed;
    private readonly disclaimerText;
    constructor(container: HTMLElement, config?: DisclaimerConfig);
    private createDisclaimer;
    private applyStyles;
    private applyPositioning;
    private toggleDetails;
    show(): void;
    hide(): void;
    dismiss(): void;
    reset(): void;
    isShowing(): boolean;
    wasDismissed(): boolean;
    static shouldShow(): boolean;
    static createAndShow(container: HTMLElement, config?: DisclaimerConfig): SafetyDisclaimer;
    updateConfig(newConfig: Partial<DisclaimerConfig>): void;
    destroy(): void;
}
//# sourceMappingURL=SafetyDisclaimer.d.ts.map