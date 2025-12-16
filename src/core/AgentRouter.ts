// Agent router and communication layer for multi-agent coordination
import { 
  ConfidentAdvisor, 
  SilentAnalyst, 
  PostMortemNarrator, 
  AdviceResponse, 
  GameMetrics, 
  GameEvent, 
  Coordinate, 
  GameState 
} from '../types';
import { ConfidentAdvisorAgent } from '../agents/ConfidentAdvisorAgent';
import { SilentAnalystAgent } from '../agents/SilentAnalystAgent';
import { PostMortemNarratorAgent } from '../agents/PostMortemNarratorAgent';
import { BedrockService } from '../services/BedrockService';

export interface AgentRouterConfig {
  bedrockService?: BedrockService;
  enableLogging?: boolean;
}

export class AgentRouter {
  private confidentAdvisor: ConfidentAdvisor;
  private silentAnalyst: SilentAnalyst;
  private postMortemNarrator: PostMortemNarrator;
  private enableLogging: boolean;
  private requestLog: Array<{ timestamp: Date; agent: string; method: string; success: boolean }> = [];

  constructor(config: AgentRouterConfig = {}) {
    this.enableLogging = config.enableLogging || false;
    
    // Initialize agents with shared Bedrock service
    const bedrockService = config.bedrockService || new BedrockService();
    
    this.confidentAdvisor = new ConfidentAdvisorAgent(bedrockService);
    this.silentAnalyst = new SilentAnalystAgent();
    this.postMortemNarrator = new PostMortemNarratorAgent(bedrockService);
  }

  // Agent responsibility boundary enforcement
  async requestAdvice(tileCoordinate: Coordinate, gameState: GameState): Promise<AdviceResponse> {
    this.logRequest('ConfidentAdvisor', 'provideAdvice');
    
    try {
      // Only Confident Advisor handles advice requests
      const advice = await this.confidentAdvisor.provideAdvice(tileCoordinate, gameState);
      
      // Automatically record advice with Silent Analyst
      const actualSafety = this.analyzeActualTileSafety(tileCoordinate, gameState);
      this.silentAnalyst.recordAdviceGiven(advice, actualSafety);
      
      this.logRequestSuccess('ConfidentAdvisor', 'provideAdvice');
      return advice;
      
    } catch (error) {
      this.logRequestFailure('ConfidentAdvisor', 'provideAdvice', error);
      throw error;
    }
  }

  recordPlayerDecision(followedAdvice: boolean, tileCoordinate?: Coordinate): void {
    this.logRequest('SilentAnalyst', 'recordPlayerDecision');
    
    try {
      // Only Silent Analyst handles decision tracking
      this.silentAnalyst.recordPlayerDecision(followedAdvice);
      
      // Also record tile click if coordinate provided
      if (tileCoordinate) {
        (this.silentAnalyst as SilentAnalystAgent).recordTileClick(tileCoordinate, followedAdvice);
      }
      
      this.logRequestSuccess('SilentAnalyst', 'recordPlayerDecision');
      
    } catch (error) {
      this.logRequestFailure('SilentAnalyst', 'recordPlayerDecision', error);
      throw error;
    }
  }

  recordGameEnd(): void {
    this.logRequest('SilentAnalyst', 'recordGameEnd');
    
    try {
      // Only Silent Analyst handles game end tracking
      (this.silentAnalyst as SilentAnalystAgent).recordGameEnd();
      this.logRequestSuccess('SilentAnalyst', 'recordGameEnd');
      
    } catch (error) {
      this.logRequestFailure('SilentAnalyst', 'recordGameEnd', error);
      throw error;
    }
  }

  async generatePostMortemAnalysis(): Promise<{ metrics: GameMetrics; analysis: string }> {
    this.logRequest('PostMortemNarrator', 'generateAnalysis');
    
    try {
      // Get metrics from Silent Analyst
      const metrics = this.silentAnalyst.calculateMetrics();
      const gameHistory = this.silentAnalyst.getGameHistory();
      
      // Only Post-Mortem Narrator handles analysis generation
      const analysis = await this.postMortemNarrator.generateAnalysis(metrics, gameHistory);
      
      this.logRequestSuccess('PostMortemNarrator', 'generateAnalysis');
      
      return { metrics, analysis };
      
    } catch (error) {
      this.logRequestFailure('PostMortemNarrator', 'generateAnalysis', error);
      throw error;
    }
  }

  // Internal coordination methods
  private analyzeActualTileSafety(tileCoordinate: Coordinate, gameState: GameState): boolean {
    // Use Confident Advisor's analysis method but don't expose it as advice
    return (this.confidentAdvisor as ConfidentAdvisorAgent).analyzeTileSafety(tileCoordinate, gameState);
  }

  // Agent boundary validation
  validateAgentBoundaries(): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];
    
    // Check that each agent only has methods within its scope
    try {
      // Confident Advisor should only provide advice
      if (typeof this.confidentAdvisor.provideAdvice !== 'function') {
        violations.push('ConfidentAdvisor missing provideAdvice method');
      }
      
      // Silent Analyst should only track metrics (no player communication)
      if (typeof this.silentAnalyst.recordAdviceGiven !== 'function') {
        violations.push('SilentAnalyst missing recordAdviceGiven method');
      }
      if (typeof this.silentAnalyst.recordPlayerDecision !== 'function') {
        violations.push('SilentAnalyst missing recordPlayerDecision method');
      }
      if (typeof this.silentAnalyst.calculateMetrics !== 'function') {
        violations.push('SilentAnalyst missing calculateMetrics method');
      }
      
      // Post-Mortem Narrator should only generate analysis
      if (typeof this.postMortemNarrator.generateAnalysis !== 'function') {
        violations.push('PostMortemNarrator missing generateAnalysis method');
      }
      
      // Verify Silent Analyst has no player-facing methods
      const silentAnalystMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.silentAnalyst));
      const playerFacingMethods = ['displayMessage', 'showNotification', 'alertPlayer', 'sendMessage'];
      
      for (const method of playerFacingMethods) {
        if (silentAnalystMethods.includes(method)) {
          violations.push(`SilentAnalyst has player-facing method: ${method}`);
        }
      }
      
    } catch (error) {
      violations.push(`Agent boundary validation error: ${error}`);
    }
    
    return {
      isValid: violations.length === 0,
      violations
    };
  }

  // Logging and monitoring
  private logRequest(agent: string, method: string): void {
    if (this.enableLogging) {
      console.log(`[AgentRouter] ${new Date().toISOString()} - ${agent}.${method} requested`);
    }
  }

  private logRequestSuccess(agent: string, method: string): void {
    const logEntry = {
      timestamp: new Date(),
      agent,
      method,
      success: true
    };
    
    this.requestLog.push(logEntry);
    
    if (this.enableLogging) {
      console.log(`[AgentRouter] ${logEntry.timestamp.toISOString()} - ${agent}.${method} completed successfully`);
    }
  }

  private logRequestFailure(agent: string, method: string, error: any): void {
    const logEntry = {
      timestamp: new Date(),
      agent,
      method,
      success: false
    };
    
    this.requestLog.push(logEntry);
    
    if (this.enableLogging) {
      console.error(`[AgentRouter] ${logEntry.timestamp.toISOString()} - ${agent}.${method} failed:`, error);
    }
  }

  // Utility methods
  getCurrentMetrics(): GameMetrics {
    return this.silentAnalyst.calculateMetrics();
  }

  getGameHistory(): GameEvent[] {
    return this.silentAnalyst.getGameHistory();
  }

  getRequestLog(): Array<{ timestamp: Date; agent: string; method: string; success: boolean }> {
    return [...this.requestLog];
  }

  resetAnalyst(): void {
    // Reset Silent Analyst for new game
    (this.silentAnalyst as SilentAnalystAgent).reset();
    this.requestLog = [];
  }

  // Health check for all agents
  async healthCheck(): Promise<{ 
    confidentAdvisor: boolean; 
    silentAnalyst: boolean; 
    postMortemNarrator: boolean;
    overall: boolean;
  }> {
    
    const results = {
      confidentAdvisor: false,
      silentAnalyst: false,
      postMortemNarrator: false,
      overall: false
    };
    
    try {
      // Test Confident Advisor (requires Bedrock)
      const testGameState: GameState = {
        grid: [[{ x: 0, y: 0, isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }]],
        gameStatus: 'playing',
        mineLocations: new Set(),
        revealedTiles: new Set(),
        flaggedTiles: new Set(),
        dimensions: { width: 1, height: 1 },
        mineCount: 0
      };
      
      await this.confidentAdvisor.provideAdvice({ x: 0, y: 0 }, testGameState);
      results.confidentAdvisor = true;
    } catch {
      results.confidentAdvisor = false;
    }
    
    try {
      // Test Silent Analyst
      this.silentAnalyst.calculateMetrics();
      results.silentAnalyst = true;
    } catch {
      results.silentAnalyst = false;
    }
    
    try {
      // Test Post-Mortem Narrator (requires Bedrock)
      const testMetrics: GameMetrics = {
        aiConfidenceLevel: 85,
        aiAccuracyRate: 60,
        playerComplianceRate: 70,
        aiInfluencedClicks: 5,
        totalAdviceRequests: 8
      };
      
      await this.postMortemNarrator.generateAnalysis(testMetrics, []);
      results.postMortemNarrator = true;
    } catch {
      results.postMortemNarrator = false;
    }
    
    results.overall = results.confidentAdvisor && results.silentAnalyst && results.postMortemNarrator;
    
    return results;
  }
}