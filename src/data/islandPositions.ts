/**
 * Island Position Map
 *
 * Maps 100 land cell indices to (x%, y%) coordinates on the floating island surface.
 * Positions form an isometric diamond pattern with seeded jitter for organic placement.
 * All values are percentages relative to the pets-layer container.
 *
 * Positions are clamped to a diamond (L1/Manhattan) boundary so no pet falls
 * off the visible grass surface.
 */

const GRID_SIZE = 10;

// Pets layer center and island ellipse radii (as % of pets-layer container)
const CENTER_X = 50;
const CENTER_Y = 50;
const DIAMOND_RX = 46; // horizontal half-width of diamond boundary
const DIAMOND_RY = 44; // vertical half-height of diamond boundary

const TILE_W = 6.0; // horizontal spacing between isometric columns
const TILE_H = 4.8; // vertical spacing between isometric rows

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
 * Clamp a point to the interior of a diamond (rhombus).
 * Diamond boundary uses L1/Manhattan norm: |dx|/rx + |dy|/ry <= 1.
 * If the point is already inside, return it unchanged.
 * Otherwise project it onto the diamond boundary with a small inset margin.
 */
function clampToDiamond(
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): { x: number; y: number } {
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.abs(dx) / rx + Math.abs(dy) / ry;

  if (dist <= 1) return { x, y };

  // Project onto diamond boundary, slightly inset
  const scale = 0.90 / dist;
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

    // Clamp to diamond island boundary
    const clamped = clampToDiamond(rawX, rawY, CENTER_X, CENTER_Y, DIAMOND_RX, DIAMOND_RY);
    positions.push(clamped);
  }

  return positions;
}

/** Pre-computed 100 positions on the island surface */
export const ISLAND_POSITIONS: IslandPosition[] = computePositions();

/**
 * Get depth-based scale for a cell index.
 * Back of island (low isoDepth) = 0.55, front (high isoDepth) = 1.0.
 */
export function getDepthScale(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const isoDepth = (row + col) / (2 * (GRID_SIZE - 1));
  return 0.55 + isoDepth * 0.45;
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

/** Rotation step type: 0=0°, 1=90°, 2=180°, 3=270° */
export type RotationStep = 0 | 1 | 2 | 3;

/**
 * Get depth-based scale for a cell at a given rotation step.
 * Rotates which corner of the grid is "front" (closest to camera).
 */
export function getDepthScaleForRotation(index: number, rotation: RotationStep): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  let depth: number;
  switch (rotation) {
    case 0: depth = (row + col) / (2 * (GRID_SIZE - 1)); break;
    case 1: depth = ((GRID_SIZE - 1 - row) + col) / (2 * (GRID_SIZE - 1)); break;
    case 2: depth = ((GRID_SIZE - 1 - row) + (GRID_SIZE - 1 - col)) / (2 * (GRID_SIZE - 1)); break;
    case 3: depth = (row + (GRID_SIZE - 1 - col)) / (2 * (GRID_SIZE - 1)); break;
  }

  return 0.55 + depth * 0.45;
}

/**
 * Get z-index for a cell at a given rotation step.
 */
export function getDepthZIndexForRotation(index: number, rotation: RotationStep): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  switch (rotation) {
    case 0: return 10 + row + col;
    case 1: return 10 + (GRID_SIZE - 1 - row) + col;
    case 2: return 10 + (GRID_SIZE - 1 - row) + (GRID_SIZE - 1 - col);
    case 3: return 10 + row + (GRID_SIZE - 1 - col);
  }
}

/**
 * Get the visual position for a cell at a given rotation step.
 * Instead of CSS rotateY (which makes the flat island invisible at 90/270°),
 * we remap the grid coordinates so "rotation" swaps which cells appear where.
 */
export function getPositionForRotation(index: number, rotation: RotationStep): IslandPosition {
  if (rotation === 0) return ISLAND_POSITIONS[index];

  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  // Remap row/col based on rotation step
  let newRow: number, newCol: number;
  switch (rotation) {
    case 1: newRow = GRID_SIZE - 1 - col; newCol = row; break;
    case 2: newRow = GRID_SIZE - 1 - row; newCol = GRID_SIZE - 1 - col; break;
    case 3: newRow = col; newCol = GRID_SIZE - 1 - row; break;
    default: newRow = row; newCol = col;
  }

  const remappedIndex = newRow * GRID_SIZE + newCol;
  return ISLAND_POSITIONS[remappedIndex] ?? ISLAND_POSITIONS[index];
}
