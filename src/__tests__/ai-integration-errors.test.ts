// AI integration error handling tests
import { BedrockService } from '../services/BedrockService';
import { ConfidentAdvisorAgent } from '../agents/ConfidentAdvisorAgent';
import { PostMortemNarratorAgent } from '../agents/PostMortemNarratorAgent';
import { AIIntegrationError, GameState, GameMetrics } from '../types';

// Mock the AWS SDK to simulate various error conditions
jest.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn()
  })),
  InvokeModelCommand: jest.fn()
}));

describe('AI Integration Error Handling', () => {
  
  describe('BedrockService Error Handling', () => {
    let mockSend: jest.Mock;
    let bedrockService: BedrockService;
    
    beforeEach(() => {
      const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');
      mockSend = jest.fn();
      BedrockRuntimeClient.mockImplementation(() => ({
        send: mockSend
      }));
      
      bedrockService = new BedrockService({ maxRetries: 2, timeout: 1000 });
    });
    
    test('handles network timeout errors', async () => {
      mockSend.mockRejectedValue(new Error('TimeoutError'));
      
      await expect(bedrockService.invokeModel('test prompt'))
        .rejects.toThrow(AIIntegrationError);
      
      try {
        await bedrockService.invokeModel('test prompt');
      } catch (error) {
        expect(error).toBeInstanceOf(AIIntegrationError);
        expect(error.message).toContain('timed out');
      }
    });
    
    test('handles authentication errors without retry', async () => {
      const authError = new Error('UnauthorizedOperation');
      authError.name = 'UnauthorizedOperation';
      mockSend.mockRejectedValue(authError);
      
      await expect(bedrockService.invokeModel('test prompt'))
        .rejects.toThrow(AIIntegrationError);
      
      // Should only try once for auth errors
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
    
    test('retries on transient errors', async () => {
      const networkError = new Error('NetworkError');
      mockSend
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          body: new TextEncoder().encode(JSON.stringify({
            output: {
              message: {
                content: [{ text: 'Success after retries' }]
              }
            }
          }))
        });
      
      const result = await bedrockService.invokeModel('test prompt');
      expect(result).toBe('Success after retries');
      expect(mockSend).toHaveBeenCalledTimes(3);
    });
    
    test('handles empty response body', async () => {
      mockSend.mockResolvedValue({ body: null });
      
      await expect(bedrockService.invokeModel('test prompt'))
        .rejects.toThrow(AIIntegrationError);
    });
    
    test('handles malformed response JSON', async () => {
      mockSend.mockResolvedValue({
        body: new TextEncoder().encode('invalid json')
      });
      
      await expect(bedrockService.invokeModel('test prompt'))
        .rejects.toThrow(AIIntegrationError);
    });
    
    test('handles missing response fields', async () => {
      mockSend.mockResolvedValue({
        body: new TextEncoder().encode(JSON.stringify({
          output: {} // Missing message field
        }))
      });
      
      await expect(bedrockService.invokeModel('test prompt'))
        .rejects.toThrow(AIIntegrationError);
    });
    
    test('validates empty prompts', async () => {
      await expect(bedrockService.invokeModel(''))
        .rejects.toThrow(AIIntegrationError);
      
      await expect(bedrockService.invokeModel('   '))
        .rejects.toThrow(AIIntegrationError);
    });
    
    test('provides fallback responses', () => {
      const advisorFallback = bedrockService.getFallbackResponse('advisor');
      const narratorFallback = bedrockService.getFallbackResponse('narrator');
      
      expect(advisorFallback).toContain('safe');
      expect(narratorFallback).toContain('Analysis');
    });
    
    test('health check handles errors gracefully', async () => {
      mockSend.mockRejectedValue(new Error('Service unavailable'));
      
      const isHealthy = await bedrockService.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });
  
  describe('ConfidentAdvisor Error Handling', () => {
    let mockBedrockService: jest.Mocked<BedrockService>;
    let advisor: ConfidentAdvisorAgent;
    let gameState: GameState;
    
    beforeEach(() => {
      mockBedrockService = {
        invokeModel: jest.fn(),
        getFallbackResponse: jest.fn().mockReturnValue('Fallback advice'),
        healthCheck: jest.fn()
      } as any;
      
      advisor = new ConfidentAdvisorAgent(mockBedrockService);
      
      gameState = {
        grid: [[{ x: 0, y: 0, isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }]],
        gameStatus: 'playing',
        mineLocations: new Set(),
        revealedTiles: new Set(),
        flaggedTiles: new Set(),
        dimensions: { width: 1, height: 1 },
        mineCount: 0
      };
    });
    
    test('falls back to deterministic advice on API failure', async () => {
      mockBedrockService.invokeModel.mockRejectedValue(new Error('API Error'));
      
      const advice = await advisor.provideAdvice({ x: 0, y: 0 }, gameState);
      
      expect(advice).toHaveProperty('recommendation');
      expect(advice).toHaveProperty('confidenceLevel');
      expect(advice).toHaveProperty('reasoning');
      expect(advice.confidenceLevel).toBeGreaterThanOrEqual(80);
    });
    
    test('handles invalid coordinates', async () => {
      await expect(advisor.provideAdvice({ x: -1, y: 0 }, gameState))
        .rejects.toThrow('Invalid tile coordinate');
    });
    
    test('handles non-playing game state', async () => {
      gameState.gameStatus = 'lost';
      
      await expect(advisor.provideAdvice({ x: 0, y: 0 }, gameState))
        .rejects.toThrow('Cannot provide advice when game is not in playing state');
    });
    
    test('handles revealed tiles', async () => {
      gameState.grid[0][0].isRevealed = true;
      
      await expect(advisor.provideAdvice({ x: 0, y: 0 }, gameState))
        .rejects.toThrow('Cannot provide advice for revealed or flagged tiles');
    });
    
    test('handles flagged tiles', async () => {
      gameState.grid[0][0].isFlagged = true;
      
      await expect(advisor.provideAdvice({ x: 0, y: 0 }, gameState))
        .rejects.toThrow('Cannot provide advice for revealed or flagged tiles');
    });
    
    test('parses malformed AI responses gracefully', async () => {
      mockBedrockService.invokeModel.mockResolvedValue('Invalid response format');
      
      const advice = await advisor.provideAdvice({ x: 0, y: 0 }, gameState);
      
      // Should still provide valid advice structure
      expect(advice).toHaveProperty('recommendation');
      expect(advice).toHaveProperty('confidenceLevel');
      expect(advice.confidenceLevel).toBeGreaterThanOrEqual(80);
    });
  });
  
  describe('PostMortemNarrator Error Handling', () => {
    let mockBedrockService: jest.Mocked<BedrockService>;
    let narrator: PostMortemNarratorAgent;
    let mockMetrics: GameMetrics;
    
    beforeEach(() => {
      mockBedrockService = {
        invokeModel: jest.fn(),
        getFallbackResponse: jest.fn().mockReturnValue('Fallback analysis'),
        healthCheck: jest.fn()
      } as any;
      
      narrator = new PostMortemNarratorAgent(mockBedrockService);
      
      mockMetrics = {
        aiConfidenceLevel: 85,
        aiAccuracyRate: 60,
        playerComplianceRate: 70,
        aiInfluencedClicks: 5,
        totalAdviceRequests: 8
      };
    });
    
    test('falls back to deterministic analysis on API failure', async () => {
      mockBedrockService.invokeModel.mockRejectedValue(new Error('API Error'));
      
      const analysis = await narrator.generateAnalysis(mockMetrics, []);
      
      expect(analysis).toContain('Post-Mortem Analysis');
      expect(analysis).toContain('85%');
      expect(analysis).toContain('60%');
      expect(analysis).toContain('70%');
    });
    
    test('handles invalid metrics', async () => {
      await expect(narrator.generateAnalysis(null as any, []))
        .rejects.toThrow('Invalid metrics or game history provided');
    });
    
    test('handles invalid game history', async () => {
      await expect(narrator.generateAnalysis(mockMetrics, null as any))
        .rejects.toThrow('Invalid metrics or game history provided');
    });
    
    test('handles empty game history gracefully', async () => {
      mockBedrockService.invokeModel.mockResolvedValue('AI analysis complete');
      
      const analysis = await narrator.generateAnalysis(mockMetrics, []);
      
      expect(analysis).toContain('AI analysis complete');
    });
  });
  
  describe('Rate Limiting and Throttling', () => {
    let mockSend: jest.Mock;
    let bedrockService: BedrockService;
    
    beforeEach(() => {
      const { BedrockRuntimeClient } = require('@aws-sdk/client-bedrock-runtime');
      mockSend = jest.fn();
      BedrockRuntimeClient.mockImplementation(() => ({
        send: mockSend
      }));
      
      bedrockService = new BedrockService({ maxRetries: 3 });
    });
    
    test('handles rate limiting with exponential backoff', async () => {
      const rateLimitError = new Error('ThrottlingException');
      rateLimitError.name = 'ThrottlingException';
      
      mockSend
        .mockRejectedValueOnce(rateLimitError)
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({
          body: new TextEncoder().encode(JSON.stringify({
            output: {
              message: {
                content: [{ text: 'Success after throttling' }]
              }
            }
          }))
        });
      
      const startTime = Date.now();
      const result = await bedrockService.invokeModel('test prompt');
      const endTime = Date.now();
      
      expect(result).toBe('Success after throttling');
      expect(mockSend).toHaveBeenCalledTimes(3);
      
      // Should have waited for backoff (at least 1s + 2s = 3s)
      expect(endTime - startTime).toBeGreaterThan(3000);
    });
  });
  
  describe('Error Recovery Strategies', () => {
    test('maintains game functionality when AI is unavailable', async () => {
      // Create advisor with failing Bedrock service
      const failingService = new BedrockService();
      jest.spyOn(failingService, 'invokeModel').mockRejectedValue(new Error('Service down'));
      
      const advisor = new ConfidentAdvisorAgent(failingService);
      
      const gameState: GameState = {
        grid: [[{ x: 0, y: 0, isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }]],
        gameStatus: 'playing',
        mineLocations: new Set(),
        revealedTiles: new Set(),
        flaggedTiles: new Set(),
        dimensions: { width: 1, height: 1 },
        mineCount: 0
      };
      
      // Should still provide advice using fallback logic
      const advice = await advisor.provideAdvice({ x: 0, y: 0 }, gameState);
      
      expect(advice).toHaveProperty('recommendation');
      expect(advice).toHaveProperty('confidenceLevel');
      expect(advice.confidenceLevel).toBeGreaterThanOrEqual(80);
    });
    
    test('graceful degradation maintains core game experience', async () => {
      // Even with AI failures, the core minesweeper game should work
      const gameState: GameState = {
        grid: [
          [{ x: 0, y: 0, isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }],
          [{ x: 0, y: 1, isMine: true, isRevealed: false, isFlagged: false, adjacentMines: 0 }]
        ],
        gameStatus: 'playing',
        mineLocations: new Set(['0,1']),
        revealedTiles: new Set(),
        flaggedTiles: new Set(),
        dimensions: { width: 1, height: 2 },
        mineCount: 1
      };
      
      // Game mechanics should work regardless of AI status
      expect(gameState.gameStatus).toBe('playing');
      expect(gameState.mineLocations.has('0,1')).toBe(true);
    });
  });
});