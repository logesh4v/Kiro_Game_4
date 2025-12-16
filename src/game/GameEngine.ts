// Core Minesweeper game engine
import { GameState, Tile, Coordinate, GameConfig, InvalidCoordinateError, InvalidGameStateError } from '../types';
import { coordinateToString, getAdjacentCoordinates, isValidCoordinate } from '../utils';

export class GameEngine {
  private gameState: GameState;

  constructor(config: GameConfig) {
    this.validateConfig(config);
    this.gameState = this.initializeGame(config);
  }

  private validateConfig(config: GameConfig): void {
    if (config.width <= 0 || config.height <= 0) {
      throw new InvalidGameStateError('Grid dimensions must be positive');
    }
    if (config.mineCount < 0 || config.mineCount >= config.width * config.height) {
      throw new InvalidGameStateError('Mine count must be between 0 and total tiles - 1');
    }
  }

  private initializeGame(config: GameConfig): GameState {
    // Create empty grid
    const grid: Tile[][] = [];
    for (let y = 0; y < config.height; y++) {
      grid[y] = [];
      for (let x = 0; x < config.width; x++) {
        grid[y][x] = {
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          adjacentMines: 0,
        };
      }
    }

    // Place mines randomly
    const mineLocations = this.placeMines(config.width, config.height, config.mineCount);
    
    // Set mine flags and calculate adjacent mine counts
    for (const mineCoord of mineLocations) {
      const { x, y } = mineCoord;
      grid[y][x].isMine = true;
    }

    // Calculate adjacent mine counts for all tiles
    this.calculateAdjacentMineCounts(grid, config.width, config.height);

    return {
      grid,
      gameStatus: 'playing',
      mineLocations: new Set(Array.from(mineLocations).map(coordinateToString)),
      revealedTiles: new Set<string>(),
      flaggedTiles: new Set<string>(),
      dimensions: { width: config.width, height: config.height },
      mineCount: config.mineCount,
    };
  }

  private placeMines(width: number, height: number, mineCount: number): Set<Coordinate> {
    const mines = new Set<Coordinate>();
    const totalTiles = width * height;
    
    if (mineCount >= totalTiles) {
      throw new InvalidGameStateError('Cannot place more mines than available tiles');
    }

    while (mines.size < mineCount) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const coordinate = { x, y };
      
      // Check if this coordinate already has a mine
      const hasExistingMine = Array.from(mines).some(
        mine => mine.x === coordinate.x && mine.y === coordinate.y
      );
      
      if (!hasExistingMine) {
        mines.add(coordinate);
      }
    }

    return mines;
  }

  private calculateAdjacentMineCounts(grid: Tile[][], width: number, height: number): void {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!grid[y][x].isMine) {
          const adjacentCoords = getAdjacentCoordinates({ x, y }, width, height);
          const mineCount = adjacentCoords.filter(coord => grid[coord.y][coord.x].isMine).length;
          grid[y][x].adjacentMines = mineCount;
        }
      }
    }
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public clickTile(coordinate: Coordinate): void {
    if (!isValidCoordinate(coordinate, this.gameState.dimensions.width, this.gameState.dimensions.height)) {
      throw new InvalidCoordinateError(coordinate);
    }

    if (this.gameState.gameStatus !== 'playing') {
      throw new InvalidGameStateError('Game is not in playing state');
    }

    const tile = this.gameState.grid[coordinate.y][coordinate.x];
    
    // Cannot click already revealed or flagged tiles
    if (tile.isRevealed || tile.isFlagged) {
      return;
    }

    // Reveal the tile
    tile.isRevealed = true;
    this.gameState.revealedTiles.add(coordinateToString(coordinate));

    // Check if it's a mine
    if (tile.isMine) {
      this.gameState.gameStatus = 'lost';
      this.revealAllMines();
      return;
    }

    // If it's an empty tile (no adjacent mines), cascade reveal
    if (tile.adjacentMines === 0) {
      this.cascadeReveal(coordinate);
    }

    // Check for win condition
    this.checkWinCondition();
  }

  private cascadeReveal(coordinate: Coordinate): void {
    const adjacentCoords = getAdjacentCoordinates(
      coordinate, 
      this.gameState.dimensions.width, 
      this.gameState.dimensions.height
    );

    for (const adjCoord of adjacentCoords) {
      const adjTile = this.gameState.grid[adjCoord.y][adjCoord.x];
      
      // Only reveal if not already revealed, not flagged, and not a mine
      if (!adjTile.isRevealed && !adjTile.isFlagged && !adjTile.isMine) {
        adjTile.isRevealed = true;
        this.gameState.revealedTiles.add(coordinateToString(adjCoord));
        
        // Continue cascade if this tile is also empty
        if (adjTile.adjacentMines === 0) {
          this.cascadeReveal(adjCoord);
        }
      }
    }
  }

  private revealAllMines(): void {
    for (let y = 0; y < this.gameState.dimensions.height; y++) {
      for (let x = 0; x < this.gameState.dimensions.width; x++) {
        const tile = this.gameState.grid[y][x];
        if (tile.isMine) {
          tile.isRevealed = true;
          this.gameState.revealedTiles.add(coordinateToString({ x, y }));
        }
      }
    }
  }

  private checkWinCondition(): void {
    const totalTiles = this.gameState.dimensions.width * this.gameState.dimensions.height;
    const revealedCount = this.gameState.revealedTiles.size;
    const mineCount = this.gameState.mineCount;

    // Win if all non-mine tiles are revealed
    if (revealedCount === totalTiles - mineCount) {
      this.gameState.gameStatus = 'won';
    }
  }

  public flagTile(coordinate: Coordinate): void {
    if (!isValidCoordinate(coordinate, this.gameState.dimensions.width, this.gameState.dimensions.height)) {
      throw new InvalidCoordinateError(coordinate);
    }

    if (this.gameState.gameStatus !== 'playing') {
      throw new InvalidGameStateError('Game is not in playing state');
    }

    const tile = this.gameState.grid[coordinate.y][coordinate.x];
    
    // Cannot flag already revealed tiles
    if (tile.isRevealed) {
      return;
    }

    const coordString = coordinateToString(coordinate);
    
    // Toggle flag state
    if (tile.isFlagged) {
      tile.isFlagged = false;
      this.gameState.flaggedTiles.delete(coordString);
    } else {
      tile.isFlagged = true;
      this.gameState.flaggedTiles.add(coordString);
    }
  }
}