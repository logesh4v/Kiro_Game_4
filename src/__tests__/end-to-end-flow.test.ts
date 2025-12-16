// End-to-end game flow integration tests
import { GameController } from '../core/GameController';
import { GameConfig } from '../types';

// Mock DOM elements for testing
const createMockCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  
  // Mock getContext to return a basic 2D context
  const mockContext = {
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    clearRect: jest.fn(),
    imageSmoothingEnabled: true,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    globalAlpha: 1
  };
  
  jest.spyOn(canvas, 'getContext').mockReturnValue(mockContext as any);
  return canvas;
};

const createMockContainer = (): HTMLElement => {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  return container;
};

describe('End-to-End Game Flow', () => {
  let gameController: GameController;
  let mockCanvas: HTMLCanvasElement;
  let mockContainer: HTMLElement;
  let gameStartCallback: jest.Mock;
  let gameEndCallback: jest.Mock;
  let adviceGivenCallback: jest.Mock;
  let playerDecisionCallback: jest.Mock;

  beforeEach(() => {
    // Set up DOM mocks
    mockCanvas = createMockCanvas();
    mockContainer = createMockContainer();
    
    // Set up callbacks
    gameStartCallback = jest.fn();
    gameEndCallback = jest.fn();
    adviceGivenCallback = jest.fn();
    playerDecisionCallback = jest.fn();
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    if (gameController) {
      gameController.destroy();
    }
    jest.restoreAllMocks();
  });

  describe('Game Initialization Flow', () => {
    test('creates standard game successfully', () => {
      gameController = GameController.createStandardGame(
        mockCanvas,
        mockContainer,
        {
          onGameStart: gameStartCallback,
          onGameEnd: gameEndCallback,
          onAdviceGiven: adviceGivenCallback,
          onPlayerDecision: playerDecisionCallback
        }
      );

      expect(gameController).toBeDefined();
      expect(gameStartCallback).toHaveBeenCalledTimes(1);
      
      const gameState = gameController.getGameState();
      expect(gameState.dimensions.width).toBe(9);
      expect(gameState.dimensions.height).toBe(9);
      expect(gameState.mineCount).toBe(10);
      expect(gameState.gameStatus).toBe('playing');
    });

    test('creates custom game with specified configuration', () => {
      const customConfig: GameConfig = { width: 5, height: 5, mineCount: 3 };
      
      gameController = GameController.createCustomGame(
        customConfig,
        mockCanvas,
        mockContainer,
        { enableRetroStyling: false, enableLogging: false },
        { onGameStart: gameStartCallback }
      );

      expect(gameStartCallback).toHaveBeenCalledTimes(1);
      
      const gameState = gameController.getGameState();
      expect(gameState.dimensions.width).toBe(5);
      expect(gameState.dimensions.height).toBe(5);
      expect(gameState.mineCount).toBe(3);
    });

    test('initializes with proper architecture validation', async () => {
      gameController = new GameController(
        {
          gameConfig: { width: 3, height: 3, mineCount: 1 },
          validateArchitecture: true,
          enableLogging: false
        },
        { onGameStart: gameStartCallback }
      );

      gameController.initializeUI(mockCanvas, mockContainer);

      // Should not throw during validation
      await expect(gameController.validateArchitecture()).resolves.not.toThrow();
    });
  });

  describe('Complete Game Session Flow', () => {
    beforeEach(() => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      gameController = new GameController(
        {
          gameConfig: config,
          enableLogging: false,
          autoShowDisclaimer: false
        },
        {
          onGameStart: gameStartCallback,
          onGameEnd: gameEndCallback,
          onAdviceGiven: adviceGivenCallback,
          onPlayerDecision: playerDecisionCallback
        }
      );
      
      gameController.initializeUI(mockCanvas, mockContainer);
    });

    test('handles complete winning game flow', async () => {
      const gameState = gameController.getGameState();
      
      // Find all safe tiles and click them
      const safeTiles = [];
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (!gameState.grid[y][x].isMine) {
            safeTiles.push({ x, y });
          }
        }
      }

      // Simulate clicking all safe tiles
      for (const tile of safeTiles) {
        // Use private method access for testing
        await (gameController as any).handleTileClick(tile);
        
        const currentState = gameController.getGameState();
        if (currentState.gameStatus === 'won') {
          break;
        }
      }

      expect(gameEndCallback).toHaveBeenCalledWith('won');
    });

    test('handles complete losing game flow with post-mortem', async () => {
      const gameState = gameController.getGameState();
      
      // Find the mine and click it
      let mineTile = null;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (gameState.grid[y][x].isMine) {
            mineTile = { x, y };
            break;
          }
        }
        if (mineTile) break;
      }

      expect(mineTile).not.toBeNull();

      // Simulate clicking the mine
      await (gameController as any).handleTileClick(mineTile);

      expect(gameEndCallback).toHaveBeenCalledWith('lost');
      
      // Verify post-mortem analysis was attempted
      const metrics = gameController.getCurrentMetrics();
      expect(metrics).toHaveProperty('aiConfidenceLevel');
      expect(metrics).toHaveProperty('aiAccuracyRate');
    });
  });

  describe('AI Advice Integration Flow', () => {
    beforeEach(() => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      gameController = new GameController(
        {
          gameConfig: config,
          enableLogging: false
        },
        {
          onAdviceGiven: adviceGivenCallback,
          onPlayerDecision: playerDecisionCallback
        }
      );
      
      gameController.initializeUI(mockCanvas, mockContainer);
    });

    test('handles advice request and player compliance flow', async () => {
      const coordinate = { x: 0, y: 0 };
      
      // Request advice
      await (gameController as any).handleAdviceRequest(coordinate);
      
      // Simulate advice being given (this would normally happen through UI)
      const advice = await (gameController as any).requestAdviceFromAI(coordinate);
      
      expect(advice).toHaveProperty('recommendation');
      expect(advice).toHaveProperty('confidenceLevel');
      expect(advice).toHaveProperty('reasoning');
      expect(adviceGivenCallback).toHaveBeenCalledWith(advice);

      // Simulate player following advice by clicking the advised tile
      await (gameController as any).handleTileClick(coordinate);
      
      expect(playerDecisionCallback).toHaveBeenCalledWith(true);
    });

    test('handles advice request and player non-compliance flow', async () => {
      const advisedCoordinate = { x: 0, y: 0 };
      const actualClickCoordinate = { x: 1, y: 1 };
      
      // Request advice for one tile
      await (gameController as any).handleAdviceRequest(advisedCoordinate);
      const advice = await (gameController as any).requestAdviceFromAI(advisedCoordinate);
      
      expect(adviceGivenCallback).toHaveBeenCalledWith(advice);

      // Click a different tile (non-compliance)
      await (gameController as any).handleTileClick(actualClickCoordinate);
      
      expect(playerDecisionCallback).toHaveBeenCalledWith(false);
    });

    test('handles AI service failures gracefully', async () => {
      // Mock the agent router to simulate AI failure
      const mockRouter = (gameController as any).agentRouter;
      jest.spyOn(mockRouter, 'requestAdvice').mockRejectedValue(new Error('AI Service Down'));
      
      const coordinate = { x: 0, y: 0 };
      
      // Should still provide fallback advice
      const advice = await (gameController as any).requestAdviceFromAI(coordinate);
      
      expect(advice).toHaveProperty('recommendation');
      expect(advice).toHaveProperty('confidenceLevel');
      expect(advice.reasoning).toContain('temporarily unavailable');
    });
  });

  describe('Game State Management Flow', () => {
    beforeEach(() => {
      const config: GameConfig = { width: 4, height: 4, mineCount: 2 };
      gameController = new GameController(
        { gameConfig: config, enableLogging: false },
        { onGameStart: gameStartCallback }
      );
      
      gameController.initializeUI(mockCanvas, mockContainer);
    });

    test('handles pause and resume flow', () => {
      expect(gameController.getGameState().gameStatus).toBe('playing');
      
      gameController.pauseGame();
      // Game should still be in playing state but controller should be inactive
      
      gameController.resumeGame();
      // Should be able to resume if game is still in playing state
    });

    test('handles game reset flow', () => {
      const originalState = gameController.getGameState();
      
      // Make some moves
      (gameController as any).handleTileClick({ x: 0, y: 0 });
      
      const modifiedState = gameController.getGameState();
      expect(modifiedState.revealedTiles.size).toBeGreaterThan(originalState.revealedTiles.size);
      
      // Reset game
      gameController.resetGame();
      
      const resetState = gameController.getGameState();
      expect(resetState.revealedTiles.size).toBe(0);
      expect(resetState.gameStatus).toBe('playing');
      expect(gameStartCallback).toHaveBeenCalledTimes(2); // Initial + reset
    });

    test('handles game reset with new configuration', () => {
      const newConfig: GameConfig = { width: 5, height: 5, mineCount: 5 };
      
      gameController.resetGame(newConfig);
      
      const newState = gameController.getGameState();
      expect(newState.dimensions.width).toBe(5);
      expect(newState.dimensions.height).toBe(5);
      expect(newState.mineCount).toBe(5);
    });
  });

  describe('Metrics and Analytics Flow', () => {
    beforeEach(() => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      gameController = new GameController(
        { gameConfig: config, enableLogging: false },
        {
          onAdviceGiven: adviceGivenCallback,
          onPlayerDecision: playerDecisionCallback
        }
      );
      
      gameController.initializeUI(mockCanvas, mockContainer);
    });

    test('tracks metrics throughout game session', async () => {
      // Initial metrics should be empty
      let metrics = gameController.getCurrentMetrics();
      expect(metrics.totalAdviceRequests).toBe(0);
      expect(metrics.aiInfluencedClicks).toBe(0);

      // Request advice and follow it
      const coordinate = { x: 0, y: 0 };
      await (gameController as any).handleAdviceRequest(coordinate);
      await (gameController as any).requestAdviceFromAI(coordinate);
      await (gameController as any).handleTileClick(coordinate);

      // Metrics should be updated
      metrics = gameController.getCurrentMetrics();
      expect(metrics.totalAdviceRequests).toBe(1);
      expect(metrics.aiInfluencedClicks).toBe(1);
      expect(metrics.playerComplianceRate).toBe(100);
    });

    test('maintains game history throughout session', async () => {
      // Initial history should be empty
      let history = gameController.getGameHistory();
      expect(history).toHaveLength(0);

      // Make some moves with advice
      const coordinate = { x: 0, y: 0 };
      await (gameController as any).requestAdviceFromAI(coordinate);
      await (gameController as any).handleTileClick(coordinate);

      // History should contain events
      history = gameController.getGameHistory();
      expect(history.length).toBeGreaterThan(0);
      
      const eventTypes = history.map(event => event.type);
      expect(eventTypes).toContain('advice_requested');
      expect(eventTypes).toContain('tile_clicked');
    });
  });

  describe('Error Recovery Flow', () => {
    test('recovers from UI component failures', () => {
      // Create controller without UI initialization
      gameController = new GameController(
        {
          gameConfig: { width: 3, height: 3, mineCount: 1 },
          enableLogging: false
        }
      );

      // Should still function for core game logic
      expect(() => gameController.getGameState()).not.toThrow();
      expect(() => gameController.getCurrentMetrics()).not.toThrow();
    });

    test('handles invalid game configurations gracefully', () => {
      expect(() => {
        new GameController({
          gameConfig: { width: 0, height: 3, mineCount: 1 }
        });
      }).toThrow();
    });

    test('continues functioning after component destruction', () => {
      gameController = new GameController(
        {
          gameConfig: { width: 3, height: 3, mineCount: 1 },
          enableLogging: false
        }
      );
      
      gameController.initializeUI(mockCanvas, mockContainer);
      
      // Destroy components
      gameController.destroy();
      
      // Core state should still be accessible
      expect(() => gameController.getGameState()).not.toThrow();
    });
  });
});