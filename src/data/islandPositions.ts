/**
 * Island Position Map
 *
 * Maps 100 land cell indices to (x%, y%) coordinates on the isometric diamond
 * surface. Uses the EXACT same diamond vertices and bilinear interpolation as
 * IslandSVG.tsx so pets sit precisely at the center of each tile.
 *
 * All values are percentages relative to the island-container (which matches
 * the SVG viewBox aspect ratio 420×258).
 */

const GRID_SIZE = 10;

// ─── Diamond vertices (identical to IslandSVG.tsx) ──────────────────
// These define the grass surface shape in SVG coordinate space (viewBox 420×258)
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

interface IslandPosition {
  x: number; // percentage (0-100) of container width
  y: number; // percentage (0-100) of container height
}

function computePositions(): IslandPosition[] {
  const positions: IslandPosition[] = [];

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;

    // Cell center: offset by 0.5 to hit the middle of each tile
    const r = (row + 0.5) / GRID_SIZE;
    const c = (col + 0.5) / GRID_SIZE;

    const svgPt = diamondPt(r, c);

    // Convert SVG coordinates to container percentages
    positions.push({
      x: (svgPt.x / VB_W) * 100,
      y: (svgPt.y / VB_H) * 100,
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
