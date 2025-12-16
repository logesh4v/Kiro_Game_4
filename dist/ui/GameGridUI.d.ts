import { GameState, Coordinate } from '../types';
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
export declare class GameGridUI {
    private canvas;
    private ctx;
    private config;
    private callbacks;
    private hoveredTile;
    private selectedTile;
    private lastRenderTime;
    private readonly colors;
    constructor(canvas: HTMLCanvasElement, config?: GameGridUIConfig, callbacks?: UIInteractionCallbacks);
    private setupCanvas;
    private setupEventListeners;
    private getCoordinateFromEvent;
    render(gameState: GameState): void;
    private resizeCanvasIfNeeded;
    private clearCanvas;
    private renderBackground;
    private renderGridLines;
    private renderTiles;
    private renderTile;
    private render3DBorder;
    private renderTileText;
    private renderInteractionEffects;
    private renderTileOverlay;
    selectTile(coordinate: Coordinate | null): void;
    highlightTile(coordinate: Coordinate | null): void;
    updateConfig(newConfig: Partial<GameGridUIConfig>): void;
    private requestRender;
    getCanvasSize(): {
        width: number;
        height: number;
    };
    getCellSize(): number;
    destroy(): void;
}
//# sourceMappingURL=GameGridUI.d.ts.map