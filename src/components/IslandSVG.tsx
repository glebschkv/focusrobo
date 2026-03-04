/**
 * IslandSVG — Pixel-art isometric island rendered as inline SVG.
 *
 * Draws the grass surface (diamond with isometric tile grid), cliff walls
 * (3-band: grass lip → dirt → cobblestone), cobblestone detail shapes,
 * and grass overhang tufts. All flat fills, no gradients — pixel art style.
 *
 * Replaces the old CSS-gradient island rendering.
 */

// ─── ViewBox & Key Coordinates ─────────────────────────────────────
// Container aspect-ratio: 2 / 1.3 → viewBox 420×273
const VB_W = 420;
const VB_H = 273;

// Grass diamond vertices (top 77% of container = 210px area)
const GRASS = {
  top: { x: 210, y: 4 },
  right: { x: 411, y: 103 },
  bottom: { x: 210, y: 206 },
  left: { x: 8, y: 103 },
};

// ─── Tile Grid Generation ──────────────────────────────────────────
const GRID = 8; // 8×8 tile grid

interface Point {
  x: number;
  y: number;
}

/** Linear interpolation between two points */
function lerp(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * Compute the 4 corners of tile (row, col) in the isometric diamond grid.
 * The grid subdivides the main diamond into GRID×GRID tiles.
 */
function tileCorners(row: number, col: number): [Point, Point, Point, Point] {
  const g = GRID;
  // Edges of the main diamond
  const { top, right, bottom, left } = GRASS;

  // Parametric position along each edge
  // Top-left edge: top → left
  // Top-right edge: top → right
  // Bottom-left edge: left → bottom
  // Bottom-right edge: right → bottom

  // A point on the diamond at grid (r, c) can be found by:
  // Going r/g of the way from the top-left edge toward bottom-left,
  // and c/g of the way from the top-right edge toward bottom-right.
  // Diamond point at (r, c) = lerp of lerp
  function diamondPoint(r: number, c: number): Point {
    const leftEdge = lerp(top, left, r / g);
    const rightEdge = lerp(top, right, c / g);
    const bottomLeft = lerp(left, bottom, c / g);
    const bottomRight = lerp(right, bottom, r / g);

    // The intersection point: go from leftEdge toward bottomRight by c/g,
    // or equivalently from rightEdge toward bottomLeft by r/g
    const p1 = lerp(leftEdge, bottomRight, c / g);
    const p2 = lerp(rightEdge, bottomLeft, r / g);
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  }

  return [
    diamondPoint(row, col),         // top
    diamondPoint(row, col + 1),     // right
    diamondPoint(row + 1, col + 1), // bottom
    diamondPoint(row + 1, col),     // left
  ];
}

function pointsStr(pts: Point[]): string {
  return pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

// ─── Cliff Band Coordinates ────────────────────────────────────────
// Left cliff: (0, 105) → (210, 210) → (210, 273) → (0, 168)
// Split into 3 bands: grass lip (top 10%), dirt (10-55%), stone (55-100%)

function cliffBand(
  tl: Point, tr: Point, bl: Point, br: Point,
  startPct: number, endPct: number,
): string {
  const topL = lerp(tl, bl, startPct);
  const topR = lerp(tr, br, startPct);
  const botL = lerp(tl, bl, endPct);
  const botR = lerp(tr, br, endPct);
  return pointsStr([topL, topR, botR, botL]);
}

// Left cliff corners
const LC = {
  tl: { x: 0, y: 105 },
  tr: { x: 210, y: 210 },
  bl: { x: 0, y: 168 },
  br: { x: 210, y: 273 },
};

// Right cliff corners
const RC = {
  tl: { x: 420, y: 105 },
  tr: { x: 210, y: 210 },
  bl: { x: 420, y: 168 },
  br: { x: 210, y: 273 },
};

// ─── Cobblestone Positions ─────────────────────────────────────────
// Positioned in the stone band (55-100%) of each cliff wall
interface Stone {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

const leftStones: Stone[] = [
  { cx: 45, cy: 162, rx: 9, ry: 5 },
  { cx: 72, cy: 168, rx: 7, ry: 4 },
  { cx: 28, cy: 170, rx: 8, ry: 5 },
  { cx: 95, cy: 175, rx: 10, ry: 5 },
  { cx: 55, cy: 174, rx: 7, ry: 4 },
  { cx: 120, cy: 200, rx: 9, ry: 5 },
  { cx: 80, cy: 195, rx: 8, ry: 4 },
  { cx: 145, cy: 215, rx: 10, ry: 5 },
  { cx: 110, cy: 210, rx: 7, ry: 4 },
  { cx: 160, cy: 230, rx: 9, ry: 5 },
  { cx: 130, cy: 225, rx: 8, ry: 4 },
  { cx: 175, cy: 245, rx: 8, ry: 5 },
  { cx: 190, cy: 255, rx: 9, ry: 5 },
  { cx: 150, cy: 240, rx: 7, ry: 4 },
];

const rightStones: Stone[] = [
  { cx: 375, cy: 162, rx: 9, ry: 5 },
  { cx: 348, cy: 168, rx: 7, ry: 4 },
  { cx: 392, cy: 170, rx: 8, ry: 5 },
  { cx: 325, cy: 175, rx: 10, ry: 5 },
  { cx: 365, cy: 174, rx: 7, ry: 4 },
  { cx: 300, cy: 200, rx: 9, ry: 5 },
  { cx: 340, cy: 195, rx: 8, ry: 4 },
  { cx: 275, cy: 215, rx: 10, ry: 5 },
  { cx: 310, cy: 210, rx: 7, ry: 4 },
  { cx: 260, cy: 230, rx: 9, ry: 5 },
  { cx: 290, cy: 225, rx: 8, ry: 4 },
  { cx: 245, cy: 245, rx: 8, ry: 5 },
  { cx: 230, cy: 255, rx: 9, ry: 5 },
  { cx: 270, cy: 240, rx: 7, ry: 4 },
];

// ─── Grass Overhang Tufts ──────────────────────────────────────────
// Triangles pointing downward from diamond edges
interface Tuft {
  points: string; // SVG polygon points
}

function makeTuft(baseX: number, baseY: number, angle: number, size: number): Tuft {
  // Triangle pointing in the direction of `angle` (radians)
  const tipX = baseX + Math.cos(angle) * size;
  const tipY = baseY + Math.sin(angle) * size;
  const perpX = Math.cos(angle + Math.PI / 2) * (size * 0.35);
  const perpY = Math.sin(angle + Math.PI / 2) * (size * 0.35);
  return {
    points: pointsStr([
      { x: baseX - perpX, y: baseY - perpY },
      { x: baseX + perpX, y: baseY + perpY },
      { x: tipX, y: tipY },
    ]),
  };
}

// Generate tufts along each diamond edge
function generateTufts(): Tuft[] {
  const tufts: Tuft[] = [];
  const { top, right, bottom, left } = GRASS;

  // Top-left edge (top → left): tufts point left-down
  for (let t = 0.15; t < 0.9; t += 0.12 + Math.sin(t * 17) * 0.03) {
    const p = lerp(top, left, t);
    tufts.push(makeTuft(p.x - 1, p.y + 1, Math.PI * 0.75, 7 + Math.sin(t * 23) * 2));
  }

  // Top-right edge (top → right): tufts point right-down
  for (let t = 0.15; t < 0.9; t += 0.12 + Math.sin(t * 13) * 0.03) {
    const p = lerp(top, right, t);
    tufts.push(makeTuft(p.x + 1, p.y + 1, Math.PI * 0.25, 7 + Math.sin(t * 19) * 2));
  }

  // Bottom-left edge (left → bottom): tufts point left-down
  for (let t = 0.1; t < 0.9; t += 0.12 + Math.sin(t * 11) * 0.03) {
    const p = lerp(left, bottom, t);
    tufts.push(makeTuft(p.x - 1, p.y + 1, Math.PI * 0.65, 7 + Math.sin(t * 29) * 2));
  }

  // Bottom-right edge (right → bottom): tufts point right-down
  for (let t = 0.1; t < 0.9; t += 0.12 + Math.sin(t * 7) * 0.03) {
    const p = lerp(right, bottom, t);
    tufts.push(makeTuft(p.x + 1, p.y + 1, Math.PI * 0.35, 7 + Math.sin(t * 31) * 2));
  }

  return tufts;
}

const TUFTS = generateTufts();

// ─── Light grass tile color & dark grass tile color ────────────────
const LIGHT_TILE = '#B8E06A';
const DARK_TILE = '#9CC84E';
const GRID_LINE = '#6B9430';

// Cliff colors
const CLIFF = {
  left: { lip: '#6B9430', dirt: '#A08850', stone: '#585040' },
  right: { lip: '#5E8528', dirt: '#8A7840', stone: '#4E4638' },
  cobbleFill: '#6B6050',
  cobbleStroke: '#3E3628',
};

const TUFT_COLORS = ['#7AA836', '#82B240', '#6B9430'];

// ─── Component ─────────────────────────────────────────────────────

export const IslandSVG = () => {
  // Pre-compute tiles
  const tiles: { points: string; fill: string }[] = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const corners = tileCorners(r, c);
      const isLight = (r + c) % 2 === 0;
      tiles.push({
        points: pointsStr(corners),
        fill: isLight ? LIGHT_TILE : DARK_TILE,
      });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="pet-land__island-svg"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── Layer 1: Cliff walls ── */}

      {/* Left cliff — stone band (bottom) */}
      <polygon
        points={cliffBand(LC.tl, LC.tr, LC.bl, LC.br, 0.55, 1)}
        fill={CLIFF.left.stone}
      />
      {/* Left cliff — dirt band (middle) */}
      <polygon
        points={cliffBand(LC.tl, LC.tr, LC.bl, LC.br, 0.1, 0.55)}
        fill={CLIFF.left.dirt}
      />
      {/* Left cliff — grass lip (top) */}
      <polygon
        points={cliffBand(LC.tl, LC.tr, LC.bl, LC.br, 0, 0.1)}
        fill={CLIFF.left.lip}
      />

      {/* Right cliff — stone band (bottom) */}
      <polygon
        points={cliffBand(RC.tl, RC.tr, RC.bl, RC.br, 0.55, 1)}
        fill={CLIFF.right.stone}
      />
      {/* Right cliff — dirt band (middle) */}
      <polygon
        points={cliffBand(RC.tl, RC.tr, RC.bl, RC.br, 0.1, 0.55)}
        fill={CLIFF.right.dirt}
      />
      {/* Right cliff — grass lip (top) */}
      <polygon
        points={cliffBand(RC.tl, RC.tr, RC.bl, RC.br, 0, 0.1)}
        fill={CLIFF.right.lip}
      />

      {/* ── Layer 2: Cobblestone detail shapes ── */}
      {leftStones.map((s, i) => (
        <ellipse
          key={`ls-${i}`}
          cx={s.cx}
          cy={s.cy}
          rx={s.rx}
          ry={s.ry}
          fill={CLIFF.cobbleFill}
          stroke={CLIFF.cobbleStroke}
          strokeWidth={1}
        />
      ))}
      {rightStones.map((s, i) => (
        <ellipse
          key={`rs-${i}`}
          cx={s.cx}
          cy={s.cy}
          rx={s.rx}
          ry={s.ry}
          fill={CLIFF.cobbleFill}
          stroke={CLIFF.cobbleStroke}
          strokeWidth={1}
        />
      ))}

      {/* ── Layer 3: Grass surface tiles (checkerboard) ── */}
      {tiles.map((tile, i) => (
        <polygon
          key={`tile-${i}`}
          points={tile.points}
          fill={tile.fill}
          stroke={GRID_LINE}
          strokeWidth={1.2}
        />
      ))}

      {/* ── Layer 4: Subtle grass highlights ── */}
      {/* Light sun patch on upper-right */}
      <polygon
        points={pointsStr([
          lerp(GRASS.top, GRASS.right, 0.3),
          lerp(GRASS.top, GRASS.right, 0.6),
          lerp(GRASS.right, GRASS.bottom, 0.2),
          lerp(GRASS.top, GRASS.left, 0.15),
        ])}
        fill="#C8EE7A"
        opacity={0.3}
      />

      {/* ── Layer 5: Grass overhang tufts ── */}
      {TUFTS.map((tuft, i) => (
        <polygon
          key={`tuft-${i}`}
          points={tuft.points}
          fill={TUFT_COLORS[i % TUFT_COLORS.length]}
        />
      ))}
    </svg>
  );
};
