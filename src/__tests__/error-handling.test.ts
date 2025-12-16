// Comprehensive error handling tests
import { GameEngine } from '../game/GameEngine';
import { AgentRouter } from '../core/AgentRouter';
import { 
  GameConfig, 
  InvalidCoordinateError, 
  InvalidGameStateError, 
  AIIntegrationError 
} from '../types';

describe('Game State Error Handling', () => {
  
  describe('Invalid Coordinates', () => {
    let game: GameEngine;
    
    beforeEach(() => {
      const config: GameConfig = { width: 5, height: 5, mineCount: 3 };
      game = new GameEngine(config);
    });
    
    test('throws InvalidCoordinateError for negative coordinates', () => {
      expect(() => game.clickTile({ x: -1, y: 0 })).toThrow(InvalidCoordinateError);
      expect(() => game.clickTile({ x: 0, y: -1 })).toThrow(InvalidCoordinateError);
      expect(() => game.flagTile({ x: -1, y: 0 })).toThrow(InvalidCoordinateError);
      expect(() => game.flagTile({ x: 0, y: -1 })).toThrow(InvalidCoordinateError);
    });
    
    test('throws InvalidCoordinateError for out-of-bounds coordinates', () => {
      expect(() => game.clickTile({ x: 5, y: 0 })).toThrow(InvalidCoordinateError);
      expect(() => game.clickTile({ x: 0, y: 5 })).toThrow(InvalidCoordinateError);
      expect(() => game.flagTile({ x: 5, y: 0 })).toThrow(InvalidCoordinateError);
      expect(() => game.flagTile({ x: 0, y: 5 })).toThrow(InvalidCoordinateError);
    });
    
    test('error messages include coordinate information', () => {
      try {
        game.clickTile({ x: -1, y: 2 });
        fail('Expected InvalidCoordinateError');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidCoordinateError);
        expect(error.message).toContain('(-1, 2)');
      }
    });
  });
  
  describe('Revealed Tile Interactions', () => {
    let game: GameEngine;
    
    beforeEach(() => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      game = new GameEngine(config);
    });
    
    test('gracefully handles clicks on already revealed tiles', () => {
      const state = game.getGameState();
      
      // Find a safe tile and reveal it
      let safeTile = null;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (!state.grid[y][x].isMine) {
            safeTile = { x, y };
            break;
          }
        }
        if (safeTile) break;
      }
      
      // Click once to reveal
      game.clickTile(safeTile!);
      const revealedCount = game.getGameState().revealedTiles.size;
      
      // Click again - should not throw or change state
      expect(() => game.clickTile(safeTile!)).not.toThrow();
      expect(game.getGameState().revealedTiles.size).toBe(revealedCount);
    });
    
    test('cannot flag already revealed tiles', () => {
      const state = game.getGameState();
      
      // Find a safe tile and reveal it
      let safeTile = null;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (!state.grid[y][x].isMine) {
            safeTile = { x, y };
            break;
          }
        }
        if (safeTile) break;
      }
      
      // Reveal the tile
      game.clickTile(safeTile!);
      
      // Try to flag - should not change state
      game.flagTile(safeTile!);
      expect(game.getGameState().grid[safeTile!.y][safeTile!.x].isFlagged).toBe(false);
    });
  });
  
  describe('Game Configuration Validation', () => {
    test('throws InvalidGameStateError for invalid dimensions', () => {
      expect(() => new GameEngine({ width: 0, height: 5, mineCount: 1 }))
        .toThrow(InvalidGameStateError);
      expect(() => new GameEngine({ width: 5, height: 0, mineCount: 1 }))
        .toThrow(InvalidGameStateError);
      expect(() => new GameEngine({ width: -1, height: 5, mineCount: 1 }))
        .toThrow(InvalidGameStateError);
    });
    
    test('throws InvalidGameStateError for invalid mine count', () => {
      expect(() => new GameEngine({ width: 3, height: 3, mineCount: -1 }))
        .toThrow(InvalidGameStateError);
      expect(() => new GameEngine({ width: 3, height: 3, mineCount: 9 }))
        .toThrow(InvalidGameStateError);
      expect(() => new GameEngine({ width: 2, height: 2, mineCount: 4 }))
        .toThrow(InvalidGameStateError);
    });
    
    test('error messages are descriptive', () => {
      try {
        new GameEngine({ width: 0, height: 5, mineCount: 1 });
        fail('Expected InvalidGameStateError');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidGameStateError);
        expect(error.message).toContain('positive');
      }
      
      try {
        new GameEngine({ width: 3, height: 3, mineCount: 10 });
        fail('Expected InvalidGameStateError');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidGameStateError);
        expect(error.message).toContain('Mine count');
      }
    });
  });
  
  describe('Post-Game State Interactions', () => {
    test('throws error when interacting after game loss', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      // Find and click mine
      let mineTile = null;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (state.grid[y][x].isMine) {
            mineTile = { x, y };
            break;
          }
        }
        if (mineTile) break;
      }
      
      game.clickTile(mineTile!);
      expect(game.getGameState().gameStatus).toBe('lost');
      
      // Try to interact with other tiles
      expect(() => game.clickTile({ x: 0, y: 0 })).toThrow(InvalidGameStateError);
      expect(() => game.flagTile({ x: 0, y: 0 })).toThrow(InvalidGameStateError);
    });
    
    test('throws error when interacting after game win', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      // Reveal all non-mine tiles to win
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (!state.grid[y][x].isMine) {
            game.clickTile({ x, y });
            state = game.getGameState();
            if (state.gameStatus === 'won') break;
          }
        }
        if (state.gameStatus === 'won') break;
      }
      
      expect(state.gameStatus).toBe('won');
      
      // Try to interact with tiles
      expect(() => game.clickTile({ x: 0, y: 0 })).toThrow(InvalidGameStateError);
      expect(() => game.flagTile({ x: 0, y: 0 })).toThrow(InvalidGameStateError);
    });
  });
});

describe('Agent Router Error Handling', () => {
  let router: AgentRouter;
  
  beforeEach(() => {
    router = new AgentRouter({ enableLogging: false });
  });
  
  test('handles invalid advice requests gracefully', async () => {
    const invalidGameState = {
      grid: [],
      gameStatus: 'playing' as const,
      mineLocations: new Set<string>(),
      revealedTiles: new Set<string>(),
      flaggedTiles: new Set<string>(),
      dimensions: { width: 0, height: 0 },
      mineCount: 0
    };
    
    await expect(router.requestAdvice({ x: 0, y: 0 }, invalidGameState))
      .rejects.toThrow();
  });
  
  test('validates agent boundaries', () => {
    const validation = router.validateAgentBoundaries();
    expect(validation).toHaveProperty('isValid');
    expect(validation).toHaveProperty('violations');
    expect(Array.isArray(validation.violations)).toBe(true);
  });
  
  test('handles metrics calculation errors', () => {
    // Should not throw even with no data
    expect(() => router.getCurrentMetrics()).not.toThrow();
    
    const metrics = router.getCurrentMetrics();
    expect(metrics).toHaveProperty('aiConfidenceLevel');
    expect(metrics).toHaveProperty('aiAccuracyRate');
    expect(metrics).toHaveProperty('playerComplianceRate');
  });
});

describe('AI Integration Error Handling', () => {
  test('AIIntegrationError includes original error', () => {
    const originalError = new Error('Network timeout');
    const aiError = new AIIntegrationError('Bedrock API failed', originalError);
    
    expect(aiError.message).toBe('Bedrock API failed');
    expect(aiError.originalError).toBe(originalError);
    expect(aiError.code).toBe('AI_INTEGRATION_ERROR');
  });
  
  test('AIIntegrationError works without original error', () => {
    const aiError = new AIIntegrationError('Service unavailable');
    
    expect(aiError.message).toBe('Service unavailable');
    expect(aiError.originalError).toBeUndefined();
    expect(aiError.code).toBe('AI_INTEGRATION_ERROR');
  });
});

describe('Edge Cases and Boundary Conditions', () => {
  test('handles minimum valid game configuration', () => {
    expect(() => new GameEngine({ width: 1, height: 1, mineCount: 0 })).not.toThrow();
    
    const game = new GameEngine({ width: 1, height: 1, mineCount: 0 });
    const state = game.getGameState();
    
    expect(state.dimensions.width).toBe(1);
    expect(state.dimensions.height).toBe(1);
    expect(state.mineCount).toBe(0);
  });
  
  test('handles maximum mine density', () => {
    // Maximum mines is total tiles - 1
    expect(() => new GameEngine({ width: 2, height: 2, mineCount: 3 })).not.toThrow();
    
    const game = new GameEngine({ width: 2, height: 2, mineCount: 3 });
    const state = game.getGameState();
    
    let mineCount = 0;
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        if (state.grid[y][x].isMine) mineCount++;
      }
    }
    
    expect(mineCount).toBe(3);
  });
  
  test('handles large grid dimensions', () => {
    expect(() => new GameEngine({ width: 100, height: 100, mineCount: 1000 })).not.toThrow();
  });
  
  test('coordinate validation handles edge coordinates', () => {
    const game = new GameEngine({ width: 5, height: 5, mineCount: 1 });
    
    // Valid edge coordinates should work
    expect(() => game.clickTile({ x: 0, y: 0 })).not.toThrow();
    expect(() => game.clickTile({ x: 4, y: 4 })).not.toThrow();
    
    // Just outside bounds should fail
    expect(() => game.clickTile({ x: 5, y: 4 })).toThrow();
    expect(() => game.clickTile({ x: 4, y: 5 })).toThrow();
  });
});