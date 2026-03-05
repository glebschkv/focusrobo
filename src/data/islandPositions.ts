/**
 * Island Position Map
 *
 * Maps up to 400 land cell indices (20×20 grid) to (x%, y%) coordinates on
 * the isometric diamond surface. Uses the EXACT same diamond vertices and
 * bilinear interpolation as IslandSVG.tsx so pets sit precisely at the center
 * of each tile.
 *
 * Supports progressive island expansion: the island starts as a centered 5×5
 * region and expands through tiers up to 20×20.
 */

/** Maximum grid dimension — the underlying grid is always 20×20 */
export const GRID_SIZE = 20;

// ─── Diamond vertices (identical to IslandSVG.tsx) ──────────────────
const VB_W = 420;
const VB_H = 258;

interface Pt { x: number; y: number }

const TOP: Pt = { x: 210, y: 0 };
const RIGHT: Pt = { x: 414, y: 105 };
const BOTTOM: Pt = { x: 210, y: 210 };
const LEFT: Pt = { x: 6, y: 105 };

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * Bilinear interpolation on the diamond — same formula as IslandSVG's
 * `diamondPt`. Maps normalized (r, c) in [0,1] to SVG coordinates.
 */
function diamondPt(r: number, c: number): Pt {
  const p1 = lerp(
    lerp(TOP, LEFT, r),
    lerp(RIGHT, BOTTOM, r),
    c,
  );
  const p2 = lerp(
    lerp(TOP, RIGHT, c),
    lerp(LEFT, BOTTOM, c),
    r,
  );
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

// ─── Position computation ───────────────────────────────────────────

export interface IslandPosition {
  x: number; // percentage (0-100) of container width
  y: number; // percentage (0-100) of container height
}

function computePositions(): IslandPosition[] {
  const positions: IslandPosition[] = [];

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;

    const r = (row + 0.5) / GRID_SIZE;
    const c = (col + 0.5) / GRID_SIZE;

    const svgPt = diamondPt(r, c);

    positions.push({
      x: (svgPt.x / VB_W) * 100,
      y: (svgPt.y / VB_H) * 100,
    });
  }

  return positions;
}

/** Pre-computed 400 positions (20×20) on the island surface */
export const ISLAND_POSITIONS: IslandPosition[] = computePositions();

// ─── Depth system ───────────────────────────────────────────────────

const DEPTH_MIN = 0.85;
const DEPTH_MAX = 1.0;

export function getDepthScale(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  const isoDepth = (row + col) / (2 * (GRID_SIZE - 1));
  return DEPTH_MIN + isoDepth * (DEPTH_MAX - DEPTH_MIN);
}

export function getDepthZIndex(index: number): number {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  return 10 + row + col;
}

// ─── Island Expansion System ────────────────────────────────────────

/** Min grid size (starting tier) */
export const MIN_GRID_TIER = 5;
/** Max grid size (fully expanded) */
export const MAX_GRID_TIER = 20;

/**
 * Expansion tiers — the island grows through these sizes.
 * Each tier fills up before the next one unlocks.
 * Jumps get bigger at higher tiers for dramatic expansion feel.
 */
export const EXPANSION_TIERS = [5, 6, 7, 8, 9, 10, 12, 14, 17, 20] as const;

/** Get the next expansion tier after the given grid size, or null if maxed */
export function getNextTier(gridSize: number): number | null {
  for (const tier of EXPANSION_TIERS) {
    if (tier > gridSize) return tier;
  }
  return null;
}

/**
 * Get the set of cell indices that are available at a given grid size.
 * A grid size of N means a centered N×N region within the 20×20 grid.
 */
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

/** Get the number of available cells for a given grid size */
export function getAvailableCellCount(gridSize: number): number {
  const size = Math.max(MIN_GRID_TIER, Math.min(MAX_GRID_TIER, gridSize || MIN_GRID_TIER));
  return size * size;
}

/**
 * Compute the minimum grid size needed to encompass all filled cells.
 * Used when loading existing data to ensure no pets are in "locked" areas.
 */
export function computeMinGridSize(cells: (unknown | null)[]): number {
  let minRow = GRID_SIZE, maxRow = 0, minCol = GRID_SIZE, maxCol = 0;
  let hasAny = false;

  // Detect whether cells is old 10×10 format (length ≤ 100) or new 20×20
  const gridWidth = cells.length <= 100 ? 10 : GRID_SIZE;

  for (let i = 0; i < cells.length; i++) {
    if (cells[i] !== null) {
      const row = Math.floor(i / gridWidth);
      const col = i % gridWidth;
      // If old format, offset into the 20×20 center
      const adjRow = gridWidth === 10 ? row + 5 : row;
      const adjCol = gridWidth === 10 ? col + 5 : col;
      minRow = Math.min(minRow, adjRow);
      maxRow = Math.max(maxRow, adjRow);
      minCol = Math.min(minCol, adjCol);
      maxCol = Math.max(maxCol, adjCol);
      hasAny = true;
    }
  }

  if (!hasAny) return MIN_GRID_TIER;

  // Find the smallest centered grid that contains all pets
  for (const tier of EXPANSION_TIERS) {
    const offset = Math.floor((GRID_SIZE - tier) / 2);
    if (minRow >= offset && maxRow < offset + tier &&
        minCol >= offset && maxCol < offset + tier) {
      return tier;
    }
  }

  return MAX_GRID_TIER;
}

/**
 * Migrate a 100-cell (10×10) array to a 400-cell (20×20) array.
 * Old cells are centered within the new grid (offset by 5 in each axis).
 */
export function migrateCells<T>(oldCells: (T | null)[]): (T | null)[] {
  if (oldCells.length > 100) return oldCells; // Already migrated
  const newCells: (T | null)[] = new Array(GRID_SIZE * GRID_SIZE).fill(null);
  for (let i = 0; i < oldCells.length; i++) {
    if (oldCells[i] !== null) {
      const oldRow = Math.floor(i / 10);
      const oldCol = i % 10;
      const newIndex = (oldRow + 5) * GRID_SIZE + (oldCol + 5);
      newCells[newIndex] = oldCells[i];
    }
  }
  return newCells;
}

// ─── Dynamic position for active grid ─────────────────────────────────

/**
 * Get island position for a cell index mapped to the ACTIVE grid.
 * The active grid (gridSize × gridSize) fills the full diamond, so tiles
 * are larger when gridSize is smaller. Pets sit at tile centers.
 */
export function getIslandPosition(index: number, gridSize: number): IslandPosition | null {
  const size = Math.max(MIN_GRID_TIER, Math.min(MAX_GRID_TIER, gridSize || MIN_GRID_TIER));
  const offset = Math.floor((GRID_SIZE - size) / 2);
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;

  // Check if this cell is in the active area
  if (row < offset || row >= offset + size || col < offset || col >= offset + size) {
    return null;
  }

  // Map to normalized position within the active grid
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

/**
 * Compute the visual scale of the island based on grid tier.
 * gridSize=5 → 0.5 (small island), gridSize=20 → 0.92 (leaves breathing room).
 */
export function getIslandScale(gridSize: number): number {
  const g = gridSize || MIN_GRID_TIER;
  return 0.5 + 0.42 * (g - MIN_GRID_TIER) / (MAX_GRID_TIER - MIN_GRID_TIER);
}

/** Reference grid size where base sprite size (56px) fits tiles well */
const REFERENCE_GRID = 5;

/**
 * Scale factor for pet sprites based on grid density.
 * At gridSize=5 (starting tier), sprites are full size.
 * At higher gridSizes, sprites shrink proportionally to tile size.
 * Pets intentionally overlap tiles at higher densities to stay readable.
 */
export function getGridDensityScale(gridSize: number): number {
  const g = Math.max(MIN_GRID_TIER, Math.min(MAX_GRID_TIER, gridSize || MIN_GRID_TIER));
  if (g <= 8) return REFERENCE_GRID / g;
  // More generous scale — pets overlap tiles but remain visible
  return Math.max(0.7, 0.75 * (1 + REFERENCE_GRID / g));
}

/** Rotation step type (kept for backward compat) */
export type RotationStep = 0 | 1 | 2 | 3;
