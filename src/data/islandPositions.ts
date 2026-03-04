/**
 * Island Position Map
 *
 * Maps 100 land cell indices to (x%, y%) coordinates on the floating island surface.
 * Positions form an isometric diamond pattern with seeded jitter for organic placement.
 * All values are percentages relative to the pets-layer container.
 *
 * Positions are clamped to an elliptical boundary so no pet falls off the
 * visible grass surface.
 */

const GRID_SIZE = 10;

// Pets layer center and island ellipse radii (as % of pets-layer container)
const CENTER_X = 50;
const CENTER_Y = 50;
const ELLIPSE_RX = 44; // horizontal radius — slightly inset from edge
const ELLIPSE_RY = 42; // vertical radius

const TILE_W = 5.6; // horizontal spacing between isometric columns
const TILE_H = 4.4; // vertical spacing between isometric rows

/** Deterministic pseudo-random for consistent jitter across renders */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface IslandPosition {
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
}

/**
 * Clamp a point to the interior of an ellipse.
 * If the point is already inside, return it unchanged.
 * Otherwise project it onto the ellipse boundary with a small inset margin.
 */
function clampToEllipse(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): { x: number; y: number } {
  const dx = x - cx;
  const dy = y - cy;
  const dist = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

  if (dist <= 1) return { x, y };

  // Project onto ellipse boundary, slightly inset
  const scale = 0.92 / Math.sqrt(dist);
  return {
    x: cx + dx * scale,
    y: cy + dy * scale,
  };
}

function computePositions(): IslandPosition[] {
  const positions: IslandPosition[] = [];

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;

    // Isometric projection: diamond layout centered at (CENTER_X, CENTER_Y)
    const isoX = (col - row) * (TILE_W / 2);
    const isoY = (col + row) * (TILE_H / 2);

    // Center the grid: shift so middle of 10×10 lands at center
    const gridOffsetY = -((GRID_SIZE - 1) * TILE_H) / 2;

    // Seeded jitter for organic feel (±1% x, ±0.8% y)
    const jx = (seededRandom(i * 7 + 1) - 0.5) * 2.0;
    const jy = (seededRandom(i * 13 + 2) - 0.5) * 1.6;

    const rawX = CENTER_X + isoX + jx;
    const rawY = CENTER_Y + gridOffsetY + isoY + jy;

    // Clamp to elliptical island boundary
    const clamped = clampToEllipse(rawX, rawY, CENTER_X, CENTER_Y, ELLIPSE_RX, ELLIPSE_RY);
    positions.push(clamped);
  }

  return positions;
}

/** Pre-computed 100 positions on the island surface */
export const ISLAND_POSITIONS: IslandPosition[] = computePositions();

/**
 * Get depth-based scale for a cell index.
 * Back of island (low isoDepth) = 0.7, front (high isoDepth) = 1.0.
 */
export function getDepthScale(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const isoDepth = (row + col) / (2 * (GRID_SIZE - 1));
  return 0.7 + isoDepth * 0.3;
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
