/**
 * Island Position Map
 *
 * Maps 100 land cell indices to (x%, y%) coordinates on the floating island surface.
 * Positions form an isometric diamond pattern with seeded jitter for organic placement.
 * All values are percentages relative to the island container.
 */

const GRID_SIZE = 10;

// Island surface occupies roughly the center 70% of the container
const CENTER_X = 50; // % — horizontal center
const TOP_Y = 12; // % — top of the diamond
const TILE_W = 5.8; // % — horizontal spacing between isometric columns
const TILE_H = 3.6; // % — vertical spacing between isometric rows

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

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;

    // Isometric projection: diamond layout
    const isoX = (col - row) * (TILE_W / 2);
    const isoY = (col + row) * (TILE_H / 2);

    // Seeded jitter for organic feel (±1.2% x, ±0.8% y)
    const jx = (seededRandom(i * 7 + 1) - 0.5) * 2.4;
    const jy = (seededRandom(i * 13 + 2) - 0.5) * 1.6;

    positions.push({
      x: CENTER_X + isoX + jx,
      y: TOP_Y + isoY + jy,
    });
  }

  return positions;
}

/** Pre-computed 100 positions on the island surface */
export const ISLAND_POSITIONS: IslandPosition[] = computePositions();

/**
 * Get depth-based scale for a cell index.
 * Back of island (row 0) = 0.7, front (row 9) = 1.0.
 */
export function getDepthScale(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  // Depth is based on isometric Y: back rows (low row+col) are far, high row+col is near
  const isoDepth = (row + col) / (2 * (GRID_SIZE - 1)); // 0 (back) to 1 (front)
  return 0.7 + isoDepth * 0.3; // 0.7 → 1.0
}

/**
 * Get z-index for a cell based on its depth (isometric row+col sum).
 * Higher sum = closer to camera = higher z-index.
 */
export function getDepthZIndex(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  return 10 + row + col; // range: 10 to 28
}
