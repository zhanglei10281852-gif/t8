import {
  Point,
  GRID_OFFSET_X,
  GRID_OFFSET_Y,
  CELL_SIZE,
  PATH_WIDTH,
} from "../types/game";

export const PATH_POINTS: Point[] = [
  { x: 0, y: 150 },
  { x: 200, y: 150 },
  { x: 200, y: 350 },
  { x: 400, y: 350 },
  { x: 400, y: 100 },
  { x: 600, y: 100 },
  { x: 600, y: 450 },
  { x: 800, y: 450 },
];

export function getPathLength(): number {
  let length = 0;
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    const dx = PATH_POINTS[i + 1].x - PATH_POINTS[i].x;
    const dy = PATH_POINTS[i + 1].y - PATH_POINTS[i].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

export function getPositionOnPath(progress: number): Point {
  const totalLength = getPathLength();
  let targetDist = progress * totalLength;

  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    const dx = PATH_POINTS[i + 1].x - PATH_POINTS[i].x;
    const dy = PATH_POINTS[i + 1].y - PATH_POINTS[i].y;
    const segLength = Math.sqrt(dx * dx + dy * dy);

    if (targetDist <= segLength) {
      const t = targetDist / segLength;
      return {
        x: PATH_POINTS[i].x + dx * t,
        y: PATH_POINTS[i].y + dy * t,
      };
    }
    targetDist -= segLength;
  }

  return { ...PATH_POINTS[PATH_POINTS.length - 1] };
}

export function gridToPixel(gridX: number, gridY: number): Point {
  return {
    x: GRID_OFFSET_X + gridX * CELL_SIZE + CELL_SIZE / 2,
    y: GRID_OFFSET_Y + gridY * CELL_SIZE + CELL_SIZE / 2,
  };
}

export function pixelToGrid(
  x: number,
  y: number,
): { gridX: number; gridY: number } {
  return {
    gridX: Math.floor((x - GRID_OFFSET_X) / CELL_SIZE),
    gridY: Math.floor((y - GRID_OFFSET_Y) / CELL_SIZE),
  };
}

export function isPointOnPath(px: number, py: number): boolean {
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    const p1 = PATH_POINTS[i];
    const p2 = PATH_POINTS[i + 1];

    const dist = distanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y);
    if (dist <= PATH_WIDTH / 2 + 5) {
      return true;
    }
  }
  return false;
}

export function isGridCellOnPath(gridX: number, gridY: number): boolean {
  const center = gridToPixel(gridX, gridY);
  return isPointOnPath(center.x, center.y);
}

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
