/**
 * Island Position Map
 *
 * Maps 100 land cell indices to (x%, y%) coordinates on a flat isometric
 * diamond surface. The diamond is a rotated square (rhombus) — wider than
 * tall, typical of isometric game maps.
 *
 * All values are percentages relative to the pets-layer container.
 */

const GRID_SIZE = 10;

// Diamond dimensions as % of container
const CENTER_X = 50;
const CENTER_Y = 50;

// Isometric tile spacing — controls how spread out pets are
const TILE_W = 7.8; // horizontal half-spacing per grid step
const TILE_H = 3.9; // vertical half-spacing per grid step

/** Deterministic pseudo-random for consistent jitter across renders */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface IslandPosition {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

function computePositions(): IslandPosition[] {
  const positions: IslandPosition[] = [];
  const half = (GRID_SIZE - 1) / 2; // 4.5 — center offset

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;

    // Center the grid around (0,0) then apply isometric projection
    const centeredRow = row - half;
    const centeredCol = col - half;

    // Standard isometric: x = (col - row), y = (col + row) / 2
    const isoX = (centeredCol - centeredRow) * TILE_W;
    const isoY = (centeredCol + centeredRow) * TILE_H;

    // Small seeded jitter for organic feel (±0.8% x, ±0.5% y)
    const jx = (seededRandom(i * 7 + 1) - 0.5) * 1.6;
    const jy = (seededRandom(i * 13 + 2) - 0.5) * 1.0;

    positions.push({
      x: CENTER_X + isoX + jx,
      y: CENTER_Y + isoY + jy,
    });
  }

  return positions;
}

/** Pre-computed 100 positions on the island surface */
export const ISLAND_POSITIONS: IslandPosition[] = computePositions();

/**
 * Get depth-based scale for a cell index.
 * Back of island (top of diamond) = smaller, front (bottom) = larger.
 * Range: 0.78 → 1.0 for subtle depth.
 */
const DEPTH_MIN = 0.78;
const DEPTH_MAX = 1.0;

export function getDepthScale(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  // Isometric depth: higher row+col = closer to camera
  const isoDepth = (row + col) / (2 * (GRID_SIZE - 1));
  return DEPTH_MIN + isoDepth * (DEPTH_MAX - DEPTH_MIN);
}

/**
 * Get z-index for a cell based on its depth (isometric row+col sum).
 * Higher sum = closer to camera = higher z-index.
 */
export function getDepthZIndex(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  return 10 + row + col;
}

/** Rotation step type (kept for backward compat) */
export type RotationStep = 0 | 1 | 2 | 3;
