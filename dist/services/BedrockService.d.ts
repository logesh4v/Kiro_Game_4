export interface BedrockConfig {
    region?: string;
    maxRetries?: number;
    timeout?: number;
}
export declare class BedrockService {
    private client;
    private readonly modelId;
    private readonly maxRetries;
    private readonly timeout;
    constructor(config?: BedrockConfig);
    invokeModel(prompt: string, systemPrompt?: string): Promise<string>;
    private retryWithBackoff;
    private isNonRetryableError;
    private handleApiError;
    getFallbackResponse(context: 'advisor' | 'narrator'): string;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=BedrockService.d.ts.map