// Core integration test to verify all components work together
import { GameEngine } from '../game/GameEngine';
import { AgentRouter } from '../core/AgentRouter';
import { ArchitectureValidator } from '../core/ArchitectureValidator';
import { MetricsDisplay } from '../ui/MetricsDisplay';
import { GameConfig } from '../types';

describe('Core Integration Tests', () => {
  let gameEngine: GameEngine;
  let agentRouter: AgentRouter;
  let validator: ArchitectureValidator;

  beforeEach(() => {
    const config: GameConfig = { width: 5, height: 5, mineCount: 3 };
    gameEngine = new GameEngine(config);
    agentRouter = new AgentRouter({ enableLogging: false });
    validator = new ArchitectureValidator(agentRouter);
  });

  test('Game engine initializes correctly', () => {
    const gameState = gameEngine.getGameState();
    
    expect(gameState.dimensions.width).toBe(5);
    expect(gameState.dimensions.height).toBe(5);
    expect(gameState.mineCount).toBe(3);
    expect(gameState.gameStatus).toBe('playing');
    expect(gameState.grid).toHaveLength(5);
    expect(gameState.grid[0]).toHaveLength(5);
  });

  test('Agent router validates boundaries', () => {
    const boundaryCheck = agentRouter.validateAgentBoundaries();
    expect(boundaryCheck.isValid).toBe(true);
    expect(boundaryCheck.violations).toHaveLength(0);
  });

  test('Metrics display formats correctly', () => {
    const mockMetrics = {
      aiConfidenceLevel: 85,
      aiAccuracyRate: 60,
      playerComplianceRate: 70,
      aiInfluencedClicks: 5,
      totalAdviceRequests: 8
    };

    const mockHistory = [
      { type: 'advice_requested' as const, timestamp: new Date() },
      { type: 'tile_clicked' as const, timestamp: new Date() }
    ];

    const display = MetricsDisplay.formatMetrics(mockMetrics, mockHistory, undefined, { format: 'console' });
    
    expect(display).toContain('GAME ANALYSIS COMPLETE');
    expect(display).toContain('AI Confidence Level:     85%');
    expect(display).toContain('AI Accuracy Rate:        60%');
    expect(display).toContain('Player Compliance Rate:  70%');
  });

  test('Architecture validation works', async () => {
    const report = await validator.validateArchitecture();
    
    expect(report).toHaveProperty('timestamp');
    expect(report).toHaveProperty('agentSeparation');
    expect(report).toHaveProperty('apiIntegration');
    expect(report).toHaveProperty('responsibilityBoundaries');
    expect(report).toHaveProperty('overall');
    
    // Agent separation should be valid
    expect(report.agentSeparation.isValid).toBe(true);
    expect(report.responsibilityBoundaries.isValid).toBe(true);
  });

  test('Game engine handles tile clicks', () => {
    const gameState = gameEngine.getGameState();
    const initialRevealedCount = gameState.revealedTiles.size;
    
    // Find a safe tile to click
    let safeTile = null;
    for (let y = 0; y < gameState.dimensions.height; y++) {
      for (let x = 0; x < gameState.dimensions.width; x++) {
        if (!gameState.grid[y][x].isMine) {
          safeTile = { x, y };
          break;
        }
      }
      if (safeTile) break;
    }
    
    if (safeTile) {
      gameEngine.clickTile(safeTile);
      const updatedState = gameEngine.getGameState();
      expect(updatedState.revealedTiles.size).toBeGreaterThan(initialRevealedCount);
    }
  });

  test('Silent analyst tracks metrics', () => {
    const metrics = agentRouter.getCurrentMetrics();
    
    expect(metrics).toHaveProperty('aiConfidenceLevel');
    expect(metrics).toHaveProperty('aiAccuracyRate');
    expect(metrics).toHaveProperty('playerComplianceRate');
    expect(metrics).toHaveProperty('aiInfluencedClicks');
    expect(metrics).toHaveProperty('totalAdviceRequests');
  });
});

describe('Error Handling Tests', () => {
  test('Game engine handles invalid coordinates', () => {
    const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
    const gameEngine = new GameEngine(config);
    
    expect(() => {
      gameEngine.clickTile({ x: -1, y: 0 });
    }).toThrow();
    
    expect(() => {
      gameEngine.clickTile({ x: 5, y: 0 });
    }).toThrow();
  });

  test('Game engine validates configuration', () => {
    expect(() => {
      new GameEngine({ width: 0, height: 5, mineCount: 1 });
    }).toThrow();
    
    expect(() => {
      new GameEngine({ width: 5, height: 5, mineCount: 25 });
    }).toThrow();
  });
});