"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGridUI = void 0;
class GameGridUI {
    constructor(canvas, config = {}, callbacks = {}) {
        this.hoveredTile = null;
        this.selectedTile = null;
        this.lastRenderTime = 0;
        // Windows 95 inspired color palette
        this.colors = {
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
                8: '#808080' // Gray
            }
        };
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
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
    setupCanvas() {
        // Set up canvas for crisp pixel rendering (retro style)
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.cursor = 'pointer';
    }
    setupEventListeners() {
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
    getCoordinateFromEvent(event) {
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
    render(gameState) {
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
    resizeCanvasIfNeeded(gameState) {
        const requiredWidth = gameState.dimensions.width * this.config.cellSize;
        const requiredHeight = gameState.dimensions.height * this.config.cellSize;
        if (this.canvas.width !== requiredWidth || this.canvas.height !== requiredHeight) {
            this.canvas.width = requiredWidth;
            this.canvas.height = requiredHeight;
            this.setupCanvas(); // Reapply canvas settings after resize
        }
    }
    clearCanvas() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    renderBackground(gameState) {
        // Render retro-style background pattern if enabled
        if (this.config.enableRetroStyling) {
            this.ctx.fillStyle = this.colors.background;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    renderGridLines(gameState) {
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
    renderTiles(gameState) {
        for (let y = 0; y < gameState.dimensions.height; y++) {
            for (let x = 0; x < gameState.dimensions.width; x++) {
                const tile = gameState.grid[y][x];
                this.renderTile(tile, x, y, gameState);
            }
        }
    }
    renderTile(tile, x, y, gameState) {
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
        }
        else if (tile.isRevealed) {
            if (tile.isMine) {
                backgroundColor = this.colors.tileMine;
                textContent = '💣';
            }
            else {
                backgroundColor = this.colors.tileRevealed;
                if (tile.adjacentMines > 0) {
                    textContent = tile.adjacentMines.toString();
                    textColor = this.colors.textNumbers[tile.adjacentMines] || this.colors.text;
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
    render3DBorder(x, y, size, raised) {
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
    renderTileText(text, x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = `bold ${Math.floor(size * 0.6)}px monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        this.ctx.fillText(text, centerX, centerY);
    }
    renderInteractionEffects(gameState) {
        // Render hover effect
        if (this.hoveredTile && this.config.enableHoverEffects) {
            const tile = gameState.grid[this.hoveredTile.y][this.hoveredTile.x];
            if (!tile.isRevealed) {
                this.renderTileOverlay(this.hoveredTile.x, this.hoveredTile.y, this.colors.tileHover, 0.3);
            }
        }
        // Render selection effect
        if (this.selectedTile) {
            this.renderTileOverlay(this.selectedTile.x, this.selectedTile.y, this.colors.tileSelected, 0.5);
        }
    }
    renderTileOverlay(x, y, color, alpha) {
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
    selectTile(coordinate) {
        this.selectedTile = coordinate;
        this.requestRender();
    }
    highlightTile(coordinate) {
        this.hoveredTile = coordinate;
        this.requestRender();
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.requestRender();
    }
    requestRender() {
        // Throttle rendering to avoid excessive redraws
        const now = Date.now();
        if (now - this.lastRenderTime > 16) { // ~60fps
            this.lastRenderTime = now;
            // Note: This would need the current game state to render
            // In a full implementation, you'd store the last game state or use a callback
        }
    }
    // Utility methods
    getCanvasSize() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    getCellSize() {
        return this.config.cellSize;
    }
    destroy() {
        // Clean up event listeners
        this.canvas.removeEventListener('click', () => { });
        this.canvas.removeEventListener('contextmenu', () => { });
        this.canvas.removeEventListener('mousemove', () => { });
        this.canvas.removeEventListener('mouseleave', () => { });
        this.canvas.removeEventListener('dblclick', () => { });
    }
}
exports.GameGridUI = GameGridUI;
//# sourceMappingURL=GameGridUI.js.map