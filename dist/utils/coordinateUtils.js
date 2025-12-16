"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coordinateToString = coordinateToString;
exports.stringToCoordinate = stringToCoordinate;
exports.isValidCoordinate = isValidCoordinate;
exports.getAdjacentCoordinates = getAdjacentCoordinates;
function coordinateToString(coord) {
    return `${coord.x},${coord.y}`;
}
function stringToCoordinate(str) {
    const [x, y] = str.split(',').map(Number);
    return { x, y };
}
function isValidCoordinate(coord, width, height) {
    return coord.x >= 0 && coord.x < width && coord.y >= 0 && coord.y < height;
}
function getAdjacentCoordinates(coord, width, height) {
    const adjacent = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0)
                continue; // Skip the center coordinate
            const newCoord = { x: coord.x + dx, y: coord.y + dy };
            if (isValidCoordinate(newCoord, width, height)) {
                adjacent.push(newCoord);
            }
        }
    }
    return adjacent;
}
//# sourceMappingURL=coordinateUtils.js.map