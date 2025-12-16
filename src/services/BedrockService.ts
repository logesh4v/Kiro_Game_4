// AWS Bedrock integration service for Amazon Nova
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { AIIntegrationError } from '../types';

export interface BedrockConfig {
  region?: string;
  maxRetries?: number;
  timeout?: number;
}

export class BedrockService {
  private client: BedrockRuntimeClient;
  private readonly modelId = 'amazon.nova-lite-v1:0'; // Amazon Nova Lite model
  private readonly maxRetries: number;
  private readonly timeout: number;

  constructor(config: BedrockConfig = {}) {
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 60000; // 60 seconds as recommended for Nova

    try {
      this.client = new BedrockRuntimeClient({
        region: config.region || process.env.AWS_REGION || 'us-east-1',
        maxAttempts: this.maxRetries,
        requestHandler: {
          requestTimeout: this.timeout,
        },
      });
    } catch (error) {
      throw new AIIntegrationError('Failed to initialize Bedrock client', error as Error);
    }
  }

  async invokeModel(prompt: string, systemPrompt?: string): Promise<string> {
    if (!prompt || prompt.trim().length === 0) {
      throw new AIIntegrationError('Prompt cannot be empty');
    }

    const messages = [
      {
        role: 'user',
        content: [{ text: prompt }],
      },
    ];

    const requestBody: any = {
      messages,
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.7,
        topP: 0.9,
      },
    };

    // Add system prompt if provided
    if (systemPrompt) {
      requestBody.system = [{ text: systemPrompt }];
    }

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody),
    });

    try {
      const response = await this.retryWithBackoff(async () => {
        return await this.client.send(command);
      });

      if (!response.body) {
        throw new AIIntegrationError('Empty response from Bedrock API');
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      if (!responseBody.output || !responseBody.output.message || !responseBody.output.message.content) {
        throw new AIIntegrationError('Invalid response format from Bedrock API');
      }

      return responseBody.output.message.content[0].text;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  private async retryWithBackoff<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain error types
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        if (attempt === this.maxRetries) {
          throw lastError;
        }
        
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  private isNonRetryableError(error: any): boolean {
    // Don't retry on authentication, authorization, or validation errors
    const nonRetryableCodes = [
      'UnauthorizedOperation',
      'InvalidParameterValue',
      'ValidationException',
      'AccessDeniedException',
    ];
    
    return nonRetryableCodes.some(code => 
      error.name === code || error.code === code || error.message?.includes(code)
    );
  }

  private handleApiError(error: any): never {
    let message = 'Bedrock API error';
    
    if (error.name === 'TimeoutError' || error.code === 'TimeoutError') {
      message = 'Bedrock API request timed out';
    } else if (error.name === 'NetworkError' || error.code === 'NetworkError') {
      message = 'Network error connecting to Bedrock API';
    } else if (error.message) {
      message = `Bedrock API error: ${error.message}`;
    }
    
    throw new AIIntegrationError(message, error);
  }

  // Fallback response for when API is unavailable
  getFallbackResponse(context: 'advisor' | 'narrator'): string {
    if (context === 'advisor') {
      return 'This tile appears statistically safe based on standard probability analysis.';
    } else {
      return 'Analysis unavailable. The AI system encountered technical difficulties during post-game evaluation.';
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.invokeModel('Test connection', 'Respond with "OK" only.');
      return true;
    } catch {
      return false;
    }
  }
}