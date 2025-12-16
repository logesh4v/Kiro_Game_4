// Tests to verify classic Minesweeper mechanics fidelity
import { GameEngine } from '../game/GameEngine';
import { GameConfig, Coordinate } from '../types';

describe('Classic Minesweeper Mechanics Fidelity', () => {
  
  describe('Grid Initialization', () => {
    test('creates grid with correct dimensions', () => {
      const config: GameConfig = { width: 9, height: 9, mineCount: 10 };
      const game = new GameEngine(config);
      const state = game.getGameState();
      
      expect(state.dimensions.width).toBe(9);
      expect(state.dimensions.height).toBe(9);
      expect(state.grid).toHaveLength(9);
      expect(state.grid[0]).toHaveLength(9);
    });
    
    test('places correct number of mines', () => {
      const config: GameConfig = { width: 5, height: 5, mineCount: 5 };
      const game = new GameEngine(config);
      const state = game.getGameState();
      
      let mineCount = 0;
      for (let y = 0; y < state.dimensions.height; y++) {
        for (let x = 0; x < state.dimensions.width; x++) {
          if (state.grid[y][x].isMine) {
            mineCount++;
          }
        }
      }
      
      expect(mineCount).toBe(5);
      expect(state.mineCount).toBe(5);
    });
    
    test('all tiles start unrevealed and unflagged', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      const state = game.getGameState();
      
      for (let y = 0; y < state.dimensions.height; y++) {
        for (let x = 0; x < state.dimensions.width; x++) {
          const tile = state.grid[y][x];
          expect(tile.isRevealed).toBe(false);
          expect(tile.isFlagged).toBe(false);
        }
      }
    });
  });
  
  describe('Adjacent Mine Counting', () => {
    test('calculates adjacent mines correctly', () => {
      // Create a predictable 3x3 grid with mine in center
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      const state = game.getGameState();
      
      // Find the mine and verify adjacent counts
      let mineFound = false;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const tile = state.grid[y][x];
          if (tile.isMine) {
            mineFound = true;
            // Check all adjacent tiles have correct count
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const adjX = x + dx;
                const adjY = y + dy;
                if (adjX >= 0 && adjX < 3 && adjY >= 0 && adjY < 3 && !(dx === 0 && dy === 0)) {
                  const adjTile = state.grid[adjY][adjX];
                  if (!adjTile.isMine) {
                    expect(adjTile.adjacentMines).toBe(1);
                  }
                }
              }
            }
          }
        }
      }
      expect(mineFound).toBe(true);
    });
    
    test('tiles with no adjacent mines have count of 0', () => {
      const config: GameConfig = { width: 5, height: 5, mineCount: 1 };
      const game = new GameEngine(config);
      const state = game.getGameState();
      
      // Find tiles that should have 0 adjacent mines
      let zeroCountFound = false;
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const tile = state.grid[y][x];
          if (!tile.isMine && tile.adjacentMines === 0) {
            zeroCountFound = true;
            
            // Verify no adjacent mines
            let actualAdjacentMines = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const adjX = x + dx;
                const adjY = y + dy;
                if (adjX >= 0 && adjX < 5 && adjY >= 0 && adjY < 5 && !(dx === 0 && dy === 0)) {
                  if (state.grid[adjY][adjX].isMine) {
                    actualAdjacentMines++;
                  }
                }
              }
            }
            expect(actualAdjacentMines).toBe(0);
          }
        }
      }
      // With only 1 mine in a 5x5 grid, there should be tiles with 0 adjacent mines
      expect(zeroCountFound).toBe(true);
    });
  });
  
  describe('Tile Revelation', () => {
    test('clicking safe tile reveals it', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      // Find a safe tile
      let safeTile: Coordinate | null = null;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (!state.grid[y][x].isMine) {
            safeTile = { x, y };
            break;
          }
        }
        if (safeTile) break;
      }
      
      expect(safeTile).not.toBeNull();
      
      // Click the safe tile
      game.clickTile(safeTile!);
      state = game.getGameState();
      
      expect(state.grid[safeTile!.y][safeTile!.x].isRevealed).toBe(true);
      expect(state.gameStatus).toBe('playing');
    });
    
    test('clicking mine ends game', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      // Find the mine
      let mineTile: Coordinate | null = null;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (state.grid[y][x].isMine) {
            mineTile = { x, y };
            break;
          }
        }
        if (mineTile) break;
      }
      
      expect(mineTile).not.toBeNull();
      
      // Click the mine
      game.clickTile(mineTile!);
      state = game.getGameState();
      
      expect(state.gameStatus).toBe('lost');
      expect(state.grid[mineTile!.y][mineTile!.x].isRevealed).toBe(true);
    });
    
    test('cascade reveals empty tiles', () => {
      // Create a larger grid to ensure cascade behavior
      const config: GameConfig = { width: 5, height: 5, mineCount: 2 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      // Find a tile with 0 adjacent mines (should cascade)
      let emptyTile: Coordinate | null = null;
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const tile = state.grid[y][x];
          if (!tile.isMine && tile.adjacentMines === 0) {
            emptyTile = { x, y };
            break;
          }
        }
        if (emptyTile) break;
      }
      
      if (emptyTile) {
        const initialRevealedCount = state.revealedTiles.size;
        
        // Click the empty tile
        game.clickTile(emptyTile);
        state = game.getGameState();
        
        // Should reveal more than just the clicked tile
        expect(state.revealedTiles.size).toBeGreaterThan(initialRevealedCount + 1);
      }
    });
  });
  
  describe('Flagging Mechanics', () => {
    test('can flag unrevealed tiles', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      const coordinate: Coordinate = { x: 0, y: 0 };
      
      // Flag the tile
      game.flagTile(coordinate);
      state = game.getGameState();
      
      expect(state.grid[0][0].isFlagged).toBe(true);
      expect(state.flaggedTiles.has('0,0')).toBe(true);
    });
    
    test('can unflag flagged tiles', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      const coordinate: Coordinate = { x: 0, y: 0 };
      
      // Flag then unflag
      game.flagTile(coordinate);
      game.flagTile(coordinate);
      state = game.getGameState();
      
      expect(state.grid[0][0].isFlagged).toBe(false);
      expect(state.flaggedTiles.has('0,0')).toBe(false);
    });
    
    test('cannot click flagged tiles', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      const coordinate: Coordinate = { x: 0, y: 0 };
      
      // Flag the tile
      game.flagTile(coordinate);
      
      // Try to click it
      game.clickTile(coordinate);
      state = game.getGameState();
      
      // Should remain unrevealed
      expect(state.grid[0][0].isRevealed).toBe(false);
    });
  });
  
  describe('Win Condition', () => {
    test('wins when all non-mine tiles are revealed', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      // Reveal all non-mine tiles
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          const tile = state.grid[y][x];
          if (!tile.isMine) {
            game.clickTile({ x, y });
            state = game.getGameState();
            
            // Stop if we won
            if (state.gameStatus === 'won') {
              break;
            }
          }
        }
        if (state.gameStatus === 'won') {
          break;
        }
      }
      
      expect(state.gameStatus).toBe('won');
    });
  });
  
  describe('Error Handling', () => {
    test('rejects invalid coordinates', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      
      expect(() => game.clickTile({ x: -1, y: 0 })).toThrow();
      expect(() => game.clickTile({ x: 3, y: 0 })).toThrow();
      expect(() => game.clickTile({ x: 0, y: -1 })).toThrow();
      expect(() => game.clickTile({ x: 0, y: 3 })).toThrow();
    });
    
    test('rejects invalid game configurations', () => {
      expect(() => new GameEngine({ width: 0, height: 3, mineCount: 1 })).toThrow();
      expect(() => new GameEngine({ width: 3, height: 0, mineCount: 1 })).toThrow();
      expect(() => new GameEngine({ width: 3, height: 3, mineCount: -1 })).toThrow();
      expect(() => new GameEngine({ width: 3, height: 3, mineCount: 9 })).toThrow();
    });
    
    test('cannot interact with tiles after game ends', () => {
      const config: GameConfig = { width: 3, height: 3, mineCount: 1 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      // Find and click mine to end game
      let mineTile: Coordinate | null = null;
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
      state = game.getGameState();
      expect(state.gameStatus).toBe('lost');
      
      // Try to interact with other tiles
      expect(() => game.clickTile({ x: 0, y: 0 })).toThrow();
      expect(() => game.flagTile({ x: 0, y: 0 })).toThrow();
    });
  });
  
  describe('Game State Consistency', () => {
    test('revealed tiles count matches set size', () => {
      const config: GameConfig = { width: 4, height: 4, mineCount: 3 };
      const game = new GameEngine(config);
      let state = game.getGameState();
      
      // Click a few safe tiles
      let clickCount = 0;
      for (let y = 0; y < 4 && clickCount < 3; y++) {
        for (let x = 0; x < 4 && clickCount < 3; x++) {
          if (!state.grid[y][x].isMine) {
            game.clickTile({ x, y });
            state = game.getGameState();
            clickCount++;
          }
        }
      }
      
      // Count revealed tiles in grid
      let revealedInGrid = 0;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (state.grid[y][x].isRevealed) {
            revealedInGrid++;
          }
        }
      }
      
      expect(revealedInGrid).toBe(state.revealedTiles.size);
    });
    
    test('mine locations set matches grid mines', () => {
      const config: GameConfig = { width: 4, height: 4, mineCount: 4 };
      const game = new GameEngine(config);
      const state = game.getGameState();
      
      // Count mines in grid
      let minesInGrid = 0;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          if (state.grid[y][x].isMine) {
            minesInGrid++;
            // Check if this mine is in the mineLocations set
            expect(state.mineLocations.has(`${x},${y}`)).toBe(true);
          }
        }
      }
      
      expect(minesInGrid).toBe(state.mineLocations.size);
      expect(minesInGrid).toBe(state.mineCount);
    });
  });
});