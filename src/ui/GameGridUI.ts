// Retro-styled game grid UI with Windows 95 inspiration
import { GameState, Coordinate, Tile } from '../types';

export interface GameGridUIConfig {
  cellSize?: number;
  enableRetroStyling?: boolean;
  showGridLines?: boolean;
  enableHoverEffects?: boolean;
}

export interface UIInteractionCallbacks {
  onTileClick?: (coordinate: Coordinate) => void;
  onTileRightClick?: (coordinate: Coordinate) => void;
  onTileHover?: (coordinate: Coordinate) => void;
  onAdviceRequest?: (coordinate: Coordinate) => void;
}

export class GameGridUI {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<GameGridUIConfig>;
  private callbacks: UIInteractionCallbacks;
  private hoveredTile: Coordinate | null = null;
  private selectedTile: Coordinate | null = null;
  private lastRenderTime = 0;

  // Windows 95 inspired color palette
  private readonly colors = {
    background: '#c0c0c0',
    tileUnrevealed: '#c0c0c0',
    tileRevealed: '#ffffff',
    tileMine: '#ff0000',
    tileFlagged: '#ffff00',
    tileHover: '#e0e0e0',
    tileSelected: '#0078d4',
    border3DLight: '#ffffff',
    border3DDark: '#808080',
    border3DShadow: '#404040',
    gridLine: '#808080',
    text: '#000000',
    textNumbers: {
      1: '#0000ff', // Blue
      2: '#008000', // Green
      3: '#ff0000', // Red
      4: '#000080', // Navy
      5: '#800000', // Maroon
      6: '#008080', // Teal
      7: '#000000', // Black
      8: '#808080'  // Gray
    }
  };

  constructor(
    canvas: HTMLCanvasElement, 
    config: GameGridUIConfig = {}, 
    callbacks: UIInteractionCallbacks = {}
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = {
      cellSize: config.cellSize || 32,
      enableRetroStyling: config.enableRetroStyling !== false,
      showGridLines: config.showGridLines !== false,
      enableHoverEffects: config.enableHoverEffects !== false
    };
    this.callbacks = callbacks;

    this.setupEventListeners();
    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Set up canvas for crisp pixel rendering (retro style)
    this.ctx.imageSmoothingEnabled = false;
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.cursor = 'pointer';
  }

  private setupEventListeners(): void {
    // Mouse click handling
    this.canvas.addEventListener('click', (event) => {
      const coordinate = this.getCoordinateFromEvent(event);
      if (coordinate && this.callbacks.onTileClick) {
        this.callbacks.onTileClick(coordinate);
      }
    });

    // Right click for flagging
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      const coordinate = this.getCoordinateFromEvent(event);
      if (coordinate && this.callbacks.onTileRightClick) {
        this.callbacks.onTileRightClick(coordinate);
      }
    });

    // Mouse hover effects
    if (this.config.enableHoverEffects) {
      this.canvas.addEventListener('mousemove', (event) => {
        const coordinate = this.getCoordinateFromEvent(event);
        if (coordinate && 
            (!this.hoveredTile || 
             this.hoveredTile.x !== coordinate.x || 
             this.hoveredTile.y !== coordinate.y)) {
          this.hoveredTile = coordinate;
          if (this.callbacks.onTileHover) {
            this.callbacks.onTileHover(coordinate);
          }
          this.requestRender();
        }
      });

      this.canvas.addEventListener('mouseleave', () => {
        this.hoveredTile = null;
        this.requestRender();
      });
    }

    // Double-click for advice request
    this.canvas.addEventListener('dblclick', (event) => {
      const coordinate = this.getCoordinateFromEvent(event);
      if (coordinate && this.callbacks.onAdviceRequest) {
        this.callbacks.onAdviceRequest(coordinate);
      }
    });
  }

  private getCoordinateFromEvent(event: MouseEvent): Coordinate | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / this.config.cellSize);
    const y = Math.floor((event.clientY - rect.top) / this.config.cellSize);
    
    // Validate coordinates are within bounds
    const maxX = Math.floor(this.canvas.width / this.config.cellSize);
    const maxY = Math.floor(this.canvas.height / this.config.cellSize);
    
    if (x >= 0 && x < maxX && y >= 0 && y < maxY) {
      return { x, y };
    }
    
    return null;
  }

  public render(gameState: GameState): void {
    this.resizeCanvasIfNeeded(gameState);
    this.clearCanvas();
    
    // Render background
    this.renderBackground(gameState);
    
    // Render grid
    if (this.config.showGridLines) {
      this.renderGridLines(gameState);
    }
    
    // Render tiles
    this.renderTiles(gameState);
    
    // Render hover and selection effects
    this.renderInteractionEffects(gameState);
  }

  private resizeCanvasIfNeeded(gameState: GameState): void {
    const requiredWidth = gameState.dimensions.width * this.config.cellSize;
    const requiredHeight = gameState.dimensions.height * this.config.cellSize;
    
    if (this.canvas.width !== requiredWidth || this.canvas.height !== requiredHeight) {
      this.canvas.width = requiredWidth;
      this.canvas.height = requiredHeight;
      this.setupCanvas(); // Reapply canvas settings after resize
    }
  }

  private clearCanvas(): void {
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private renderBackground(gameState: GameState): void {
    // Render retro-style background pattern if enabled
    if (this.config.enableRetroStyling) {
      this.ctx.fillStyle = this.colors.background;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private renderGridLines(gameState: GameState): void {
    this.ctx.strokeStyle = this.colors.gridLine;
    this.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= gameState.dimensions.width; x++) {
      const xPos = x * this.config.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, this.canvas.height);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= gameState.dimensions.height; y++) {
      const yPos = y * this.config.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(this.canvas.width, yPos);
      this.ctx.stroke();
    }
  }

  private renderTiles(gameState: GameState): void {
    for (let y = 0; y < gameState.dimensions.height; y++) {
      for (let x = 0; x < gameState.dimensions.width; x++) {
        const tile = gameState.grid[y][x];
        this.renderTile(tile, x, y, gameState);
      }
    }
  }

  private renderTile(tile: Tile, x: number, y: number, gameState: GameState): void {
    const cellX = x * this.config.cellSize;
    const cellY = y * this.config.cellSize;
    const cellSize = this.config.cellSize;
    
    // Determine tile appearance
    let backgroundColor = this.colors.tileUnrevealed;
    let textContent = '';
    let textColor = this.colors.text;
    
    if (tile.isFlagged) {
      backgroundColor = this.colors.tileFlagged;
      textContent = '🚩';
    } else if (tile.isRevealed) {
      if (tile.isMine) {
        backgroundColor = this.colors.tileMine;
        textContent = '💣';
      } else {
        backgroundColor = this.colors.tileRevealed;
        if (tile.adjacentMines > 0) {
          textContent = tile.adjacentMines.toString();
          textColor = this.colors.textNumbers[tile.adjacentMines as keyof typeof this.colors.textNumbers] || this.colors.text;
        }
      }
    }
    
    // Render tile background
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
    
    // Render 3D border effect (Windows 95 style)
    if (this.config.enableRetroStyling) {
      this.render3DBorder(cellX, cellY, cellSize, !tile.isRevealed);
    }
    
    // Render text content
    if (textContent) {
      this.renderTileText(textContent, cellX, cellY, cellSize, textColor);
    }
  }

  private render3DBorder(x: number, y: number, size: number, raised: boolean): void {
    const lightColor = raised ? this.colors.border3DLight : this.colors.border3DShadow;
    const darkColor = raised ? this.colors.border3DShadow : this.colors.border3DLight;
    
    this.ctx.lineWidth = 1;
    
    // Top and left borders (light when raised)
    this.ctx.strokeStyle = lightColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + size);
    this.ctx.lineTo(x, y);
    this.ctx.lineTo(x + size, y);
    this.ctx.stroke();
    
    // Bottom and right borders (dark when raised)
    this.ctx.strokeStyle = darkColor;
    this.ctx.beginPath();
    this.ctx.moveTo(x + size, y);
    this.ctx.lineTo(x + size, y + size);
    this.ctx.lineTo(x, y + size);
    this.ctx.stroke();
  }

  private renderTileText(text: string, x: number, y: number, size: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `bold ${Math.floor(size * 0.6)}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    this.ctx.fillText(text, centerX, centerY);
  }

  private renderInteractionEffects(gameState: GameState): void {
    // Render hover effect
    if (this.hoveredTile && this.config.enableHoverEffects) {
      const tile = gameState.grid[this.hoveredTile.y][this.hoveredTile.x];
      if (!tile.isRevealed) {
        this.renderTileOverlay(
          this.hoveredTile.x, 
          this.hoveredTile.y, 
          this.colors.tileHover, 
          0.3
        );
      }
    }
    
    // Render selection effect
    if (this.selectedTile) {
      this.renderTileOverlay(
        this.selectedTile.x, 
        this.selectedTile.y, 
        this.colors.tileSelected, 
        0.5
      );
    }
  }

  private renderTileOverlay(x: number, y: number, color: string, alpha: number): void {
    const cellX = x * this.config.cellSize;
    const cellY = y * this.config.cellSize;
    const cellSize = this.config.cellSize;
    
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(cellX, cellY, cellSize, cellSize);
    this.ctx.restore();
  }

  // Public methods for interaction
  public selectTile(coordinate: Coordinate | null): void {
    this.selectedTile = coordinate;
    this.requestRender();
  }

  public highlightTile(coordinate: Coordinate | null): void {
    this.hoveredTile = coordinate;
    this.requestRender();
  }

  public updateConfig(newConfig: Partial<GameGridUIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.requestRender();
  }

  private requestRender(): void {
    // Throttle rendering to avoid excessive redraws
    const now = Date.now();
    if (now - this.lastRenderTime > 16) { // ~60fps
      this.lastRenderTime = now;
      // Note: This would need the current game state to render
      // In a full implementation, you'd store the last game state or use a callback
    }
  }

  // Utility methods
  public getCanvasSize(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  public getCellSize(): number {
    return this.config.cellSize;
  }

  public destroy(): void {
    // Clean up event listeners
    this.canvas.removeEventListener('click', () => {});
    this.canvas.removeEventListener('contextmenu', () => {});
    this.canvas.removeEventListener('mousemove', () => {});
    this.canvas.removeEventListener('mouseleave', () => {});
    this.canvas.removeEventListener('dblclick', () => {});
  }
}