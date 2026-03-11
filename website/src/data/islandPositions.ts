/**
 * Island Position Map — ported from main app.
 * Maps cell indices to (x%, y%) on the isometric diamond surface.
 */

export const GRID_SIZE = 20;

interface Pt { x: number; y: number }

const VB_W = 420;
const VB_H = 258;

const TOP: Pt = { x: 210, y: 0 };
const RIGHT: Pt = { x: 414, y: 105 };
const BOTTOM: Pt = { x: 210, y: 210 };
const LEFT: Pt = { x: 6, y: 105 };

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function diamondPt(r: number, c: number): Pt {
  const p1 = lerp(lerp(TOP, LEFT, r), lerp(RIGHT, BOTTOM, r), c);
  const p2 = lerp(lerp(TOP, RIGHT, c), lerp(LEFT, BOTTOM, c), r);
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

export interface IslandPosition {
  x: number;
  y: number;
}

export const MIN_GRID_TIER = 5;
export const MAX_GRID_TIER = 12;
export const EXPANSION_TIERS = [5, 6, 7, 8, 9, 10, 11, 12] as const;

export function getAvailableCellIndices(gridSize: number): Set<number> {
  const size = Math.max(MIN_GRID_TIER, Math.min(MAX_GRID_TIER, gridSize));
  const offset = Math.floor((GRID_SIZE - size) / 2);
  const indices = new Set<number>();
  for (let row = offset; row < offset + size; row++) {
    for (let col = offset; col < offset + size; col++) {
      indices.add(row * GRID_SIZE + col);
    }
  }
  return indices;
}

export function getIslandPosition(index: number, gridSize: number): IslandPosition | null {
  const size = Math.max(MIN_GRID_TIER, Math.min(MAX_GRID_TIER, gridSize || MIN_GRID_TIER));
  const offset = Math.floor((GRID_SIZE - size) / 2);
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  if (row < offset || row >= offset + size || col < offset || col >= offset + size) {
    return null;
  }

  const activeRow = row - offset;
  const activeCol = col - offset;
  const r = (activeRow + 0.5) / size;
  const c = (activeCol + 0.5) / size;

  const svgPt = diamondPt(r, c);
  return {
    x: (svgPt.x / VB_W) * 100,
    y: (svgPt.y / VB_H) * 100,
  };
}

export function getDepthScale(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const isoDepth = (row + col) / (2 * (GRID_SIZE - 1));
  return 0.85 + isoDepth * 0.15;
}

export function getDepthZIndex(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  return 10 + row + col;
}

export function getGridDensityScale(gridSize: number): number {
  const g = Math.max(MIN_GRID_TIER, Math.min(MAX_GRID_TIER, gridSize || MIN_GRID_TIER));
  return Math.max(0.65, (5 / g) * 1.2);
}
