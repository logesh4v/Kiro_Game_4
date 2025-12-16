// Utility functions for coordinate operations
import { Coordinate } from '../types';

export function coordinateToString(coord: Coordinate): string {
  return `${coord.x},${coord.y}`;
}

export function stringToCoordinate(str: string): Coordinate {
  const [x, y] = str.split(',').map(Number);
  return { x, y };
}

export function isValidCoordinate(coord: Coordinate, width: number, height: number): boolean {
  return coord.x >= 0 && coord.x < width && coord.y >= 0 && coord.y < height;
}

export function getAdjacentCoordinates(coord: Coordinate, width: number, height: number): Coordinate[] {
  const adjacent: Coordinate[] = [];
  
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue; // Skip the center coordinate
      
      const newCoord = { x: coord.x + dx, y: coord.y + dy };
      if (isValidCoordinate(newCoord, width, height)) {
        adjacent.push(newCoord);
      }
    }
  }
  
  return adjacent;
}