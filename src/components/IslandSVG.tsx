/**
 * IslandSVG — Polished isometric island rendered as inline SVG.
 *
 * Uses SVG linearGradient for smooth shading within each zone,
 * subtle grid lines, clean grass edge, refined cobblestones,
 * and gentle grass overhang bumps. Designed to look cohesive
 * and professionally crafted.
 */

// ─── ViewBox ───────────────────────────────────────────────────────
const VB_W = 420;
const VB_H = 273;

// Grass diamond vertices (top 77%)
const G = {
  top: { x: 210, y: 4 },
  right: { x: 411, y: 103 },
  bottom: { x: 210, y: 206 },
  left: { x: 8, y: 103 },
};

interface Pt {
  x: number;
  y: number;
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function pts(arr: Pt[]): string {
  return arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

// ─── Tile Grid ─────────────────────────────────────────────────────
const GRID = 8;

function diamondPt(r: number, c: number): Pt {
  const g = GRID;
  const le = lerp(G.top, G.left, r / g);
  const re = lerp(G.top, G.right, c / g);
  const bl = lerp(G.left, G.bottom, c / g);
  const br = lerp(G.right, G.bottom, r / g);
  const p1 = lerp(le, br, c / g);
  const p2 = lerp(re, bl, r / g);
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

function tileCorners(r: number, c: number): Pt[] {
  return [diamondPt(r, c), diamondPt(r, c + 1), diamondPt(r + 1, c + 1), diamondPt(r + 1, c)];
}

// ─── Cliff Band Helpers ────────────────────────────────────────────
function cliffBandPts(
  tl: Pt, tr: Pt, bl: Pt, br: Pt,
  s: number, e: number,
): string {
  return pts([lerp(tl, bl, s), lerp(tr, br, s), lerp(tr, br, e), lerp(tl, bl, e)]);
}

// Left cliff corners
const LC = { tl: { x: 0, y: 105 }, tr: { x: 210, y: 210 }, bl: { x: 0, y: 168 }, br: { x: 210, y: 273 } };
// Right cliff corners
const RC = { tl: { x: 420, y: 105 }, tr: { x: 210, y: 210 }, bl: { x: 420, y: 168 }, br: { x: 210, y: 273 } };

// ─── Cobblestones ──────────────────────────────────────────────────
interface Stone { cx: number; cy: number; rx: number; ry: number }

// Positioned carefully within the stone bands — staggered rows
const leftStones: Stone[] = [
  // Row 1 (upper stone band)
  { cx: 30, cy: 155, rx: 8, ry: 4.5 },
  { cx: 52, cy: 158, rx: 7, ry: 4 },
  { cx: 75, cy: 162, rx: 9, ry: 5 },
  { cx: 98, cy: 168, rx: 8, ry: 4.5 },
  // Row 2
  { cx: 40, cy: 165, rx: 7, ry: 4 },
  { cx: 65, cy: 170, rx: 8, ry: 4.5 },
  { cx: 90, cy: 175, rx: 9, ry: 5 },
  { cx: 115, cy: 182, rx: 8, ry: 4 },
  // Row 3
  { cx: 55, cy: 180, rx: 7, ry: 4 },
  { cx: 82, cy: 186, rx: 9, ry: 5 },
  { cx: 110, cy: 192, rx: 8, ry: 4.5 },
  { cx: 135, cy: 200, rx: 7, ry: 4 },
  // Row 4 (deeper)
  { cx: 75, cy: 196, rx: 8, ry: 4.5 },
  { cx: 105, cy: 204, rx: 9, ry: 5 },
  { cx: 130, cy: 212, rx: 8, ry: 4 },
  { cx: 155, cy: 222, rx: 7, ry: 4 },
  // Row 5 (bottom)
  { cx: 100, cy: 218, rx: 8, ry: 4.5 },
  { cx: 128, cy: 228, rx: 9, ry: 5 },
  { cx: 155, cy: 238, rx: 8, ry: 4 },
  { cx: 178, cy: 250, rx: 7, ry: 4 },
  { cx: 195, cy: 260, rx: 8, ry: 4.5 },
];

const rightStones: Stone[] = leftStones.map((s) => ({
  cx: VB_W - s.cx,
  cy: s.cy,
  rx: s.rx,
  ry: s.ry,
}));

// ─── Grass Overhang ────────────────────────────────────────────────
// Smooth rounded bumps along the bottom two edges (where grass meets cliff)
// Using SVG path with quadratic curves for smooth organic feel

function generateGrassEdgePath(): string {
  // Bottom-left edge: left vertex → bottom vertex
  const blPts: Pt[] = [];
  for (let t = 0; t <= 1; t += 0.01) {
    blPts.push(lerp(G.left, G.bottom, t));
  }

  // Bottom-right edge: bottom vertex → right vertex
  const brPts: Pt[] = [];
  for (let t = 0; t <= 1; t += 0.01) {
    brPts.push(lerp(G.bottom, G.right, t));
  }

  // Create bumpy path along bottom-left edge
  let path = `M ${G.left.x.toFixed(1)},${G.left.y.toFixed(1)} `;

  // Bottom-left bumps
  const blBumps = [0.08, 0.18, 0.28, 0.38, 0.5, 0.62, 0.72, 0.82, 0.92];
  for (const t of blBumps) {
    const p = lerp(G.left, G.bottom, t);
    // Bump outward perpendicular to edge
    const dx = G.bottom.x - G.left.x;
    const dy = G.bottom.y - G.left.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len; // perpendicular (outward = toward bottom-left)
    const ny = dx / len;
    const bumpSize = 3 + Math.sin(t * 37) * 1.5;
    const mid = {
      x: p.x + nx * bumpSize,
      y: p.y + ny * bumpSize,
    };
    const before = lerp(G.left, G.bottom, t - 0.04);
    const after = lerp(G.left, G.bottom, t + 0.04);
    path += `L ${before.x.toFixed(1)},${before.y.toFixed(1)} `;
    path += `Q ${mid.x.toFixed(1)},${mid.y.toFixed(1)} ${after.x.toFixed(1)},${after.y.toFixed(1)} `;
  }

  path += `L ${G.bottom.x.toFixed(1)},${G.bottom.y.toFixed(1)} `;

  // Bottom-right bumps
  const brBumps = [0.08, 0.18, 0.28, 0.38, 0.5, 0.62, 0.72, 0.82, 0.92];
  for (const t of brBumps) {
    const p = lerp(G.bottom, G.right, t);
    const dx = G.right.x - G.bottom.x;
    const dy = G.right.y - G.bottom.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    const bumpSize = 3 + Math.sin(t * 41) * 1.5;
    const mid = {
      x: p.x + nx * bumpSize,
      y: p.y + ny * bumpSize,
    };
    const before = lerp(G.bottom, G.right, t - 0.04);
    const after = lerp(G.bottom, G.right, t + 0.04);
    path += `L ${before.x.toFixed(1)},${before.y.toFixed(1)} `;
    path += `Q ${mid.x.toFixed(1)},${mid.y.toFixed(1)} ${after.x.toFixed(1)},${after.y.toFixed(1)} `;
  }

  path += `L ${G.right.x.toFixed(1)},${G.right.y.toFixed(1)} `;

  // Close back through the clean top edges
  path += `L ${G.top.x.toFixed(1)},${G.top.y.toFixed(1)} `;
  path += `L ${G.left.x.toFixed(1)},${G.left.y.toFixed(1)} Z`;

  return path;
}

const GRASS_EDGE_PATH = generateGrassEdgePath();

// ─── Pre-compute tiles ─────────────────────────────────────────────
const TILES: { points: string; isLight: boolean }[] = [];
for (let r = 0; r < GRID; r++) {
  for (let c = 0; c < GRID; c++) {
    TILES.push({
      points: pts(tileCorners(r, c)),
      isLight: (r + c) % 2 === 0,
    });
  }
}

// Diamond outline for clean edge
const DIAMOND_PATH = `M ${G.top.x},${G.top.y} L ${G.right.x},${G.right.y} L ${G.bottom.x},${G.bottom.y} L ${G.left.x},${G.left.y} Z`;

// ─── Component ─────────────────────────────────────────────────────

export const IslandSVG = () => (
  <svg
    viewBox={`0 0 ${VB_W} ${VB_H}`}
    className="pet-land__island-svg"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Grass surface gradient — warm sunlit top-right to cooler bottom-left */}
      <linearGradient id="grass-fill" x1="30%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stopColor="#C4E87A" />
        <stop offset="35%" stopColor="#B0D85A" />
        <stop offset="65%" stopColor="#9CC84E" />
        <stop offset="100%" stopColor="#88B842" />
      </linearGradient>

      {/* Light tile gradient */}
      <linearGradient id="tile-light" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C2E878" />
        <stop offset="100%" stopColor="#AADA5C" />
      </linearGradient>

      {/* Dark tile gradient */}
      <linearGradient id="tile-dark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A4D052" />
        <stop offset="100%" stopColor="#90C046" />
      </linearGradient>

      {/* Left cliff — lit side gradients */}
      <linearGradient id="cliff-l-lip" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#72A834" />
        <stop offset="100%" stopColor="#5E9228" />
      </linearGradient>
      <linearGradient id="cliff-l-dirt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B09858" />
        <stop offset="30%" stopColor="#A08850" />
        <stop offset="100%" stopColor="#887440" />
      </linearGradient>
      <linearGradient id="cliff-l-stone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#686050" />
        <stop offset="50%" stopColor="#585040" />
        <stop offset="100%" stopColor="#484038" />
      </linearGradient>

      {/* Right cliff — shadow side gradients */}
      <linearGradient id="cliff-r-lip" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#648E2C" />
        <stop offset="100%" stopColor="#507A20" />
      </linearGradient>
      <linearGradient id="cliff-r-dirt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#988048" />
        <stop offset="30%" stopColor="#8A7440" />
        <stop offset="100%" stopColor="#746434" />
      </linearGradient>
      <linearGradient id="cliff-r-stone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#585044" />
        <stop offset="50%" stopColor="#4A4238" />
        <stop offset="100%" stopColor="#3E3830" />
      </linearGradient>

      {/* Grass overhang fill */}
      <linearGradient id="grass-edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#88B842" />
        <stop offset="100%" stopColor="#6B9430" />
      </linearGradient>

      {/* Depth shadow overlay on grass */}
      <radialGradient id="grass-shadow" cx="35%" cy="65%" r="55%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="70%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(40,70,15,0.18)" />
      </radialGradient>

      {/* Sun highlight on grass */}
      <radialGradient id="grass-sun" cx="62%" cy="30%" r="40%">
        <stop offset="0%" stopColor="rgba(220,250,130,0.25)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>

    {/* ── Layer 1: Cliff walls with gradients ── */}

    {/* Left cliff bands */}
    <polygon points={cliffBandPts(LC.tl, LC.tr, LC.bl, LC.br, 0.5, 1)} fill="url(#cliff-l-stone)" />
    <polygon points={cliffBandPts(LC.tl, LC.tr, LC.bl, LC.br, 0.08, 0.5)} fill="url(#cliff-l-dirt)" />
    <polygon points={cliffBandPts(LC.tl, LC.tr, LC.bl, LC.br, 0, 0.08)} fill="url(#cliff-l-lip)" />

    {/* Thin shadow line between dirt and stone on left */}
    <line
      x1={lerp(LC.tl, LC.bl, 0.5).x} y1={lerp(LC.tl, LC.bl, 0.5).y}
      x2={lerp(LC.tr, LC.br, 0.5).x} y2={lerp(LC.tr, LC.br, 0.5).y}
      stroke="rgba(30,25,15,0.25)" strokeWidth={1}
    />
    {/* Thin shadow line between lip and dirt on left */}
    <line
      x1={lerp(LC.tl, LC.bl, 0.08).x} y1={lerp(LC.tl, LC.bl, 0.08).y}
      x2={lerp(LC.tr, LC.br, 0.08).x} y2={lerp(LC.tr, LC.br, 0.08).y}
      stroke="rgba(30,25,15,0.2)" strokeWidth={0.8}
    />

    {/* Right cliff bands */}
    <polygon points={cliffBandPts(RC.tl, RC.tr, RC.bl, RC.br, 0.5, 1)} fill="url(#cliff-r-stone)" />
    <polygon points={cliffBandPts(RC.tl, RC.tr, RC.bl, RC.br, 0.08, 0.5)} fill="url(#cliff-r-dirt)" />
    <polygon points={cliffBandPts(RC.tl, RC.tr, RC.bl, RC.br, 0, 0.08)} fill="url(#cliff-r-lip)" />

    {/* Thin shadow lines on right */}
    <line
      x1={lerp(RC.tl, RC.bl, 0.5).x} y1={lerp(RC.tl, RC.bl, 0.5).y}
      x2={lerp(RC.tr, RC.br, 0.5).x} y2={lerp(RC.tr, RC.br, 0.5).y}
      stroke="rgba(30,25,15,0.2)" strokeWidth={1}
    />
    <line
      x1={lerp(RC.tl, RC.bl, 0.08).x} y1={lerp(RC.tl, RC.bl, 0.08).y}
      x2={lerp(RC.tr, RC.br, 0.08).x} y2={lerp(RC.tr, RC.br, 0.08).y}
      stroke="rgba(30,25,15,0.15)" strokeWidth={0.8}
    />

    {/* ── Layer 2: Cobblestones (subtle, polished) ── */}
    {leftStones.map((s, i) => (
      <ellipse
        key={`ls-${i}`}
        cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
        fill="rgba(100,90,72,0.3)"
        stroke="rgba(50,42,30,0.25)"
        strokeWidth={0.7}
      />
    ))}
    {rightStones.map((s, i) => (
      <ellipse
        key={`rs-${i}`}
        cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
        fill="rgba(85,78,62,0.3)"
        stroke="rgba(40,34,24,0.22)"
        strokeWidth={0.7}
      />
    ))}

    {/* ── Layer 3: Grass overhang (smooth bumps on bottom edges) ── */}
    <path d={GRASS_EDGE_PATH} fill="url(#grass-edge)" />

    {/* ── Layer 4: Grass surface tiles ── */}
    {/* Base grass fill */}
    <polygon points={pts([G.top, G.right, G.bottom, G.left])} fill="url(#grass-fill)" />

    {/* Checkerboard tiles — subtle variation, not harsh */}
    {TILES.map((tile, i) => (
      <polygon
        key={`t-${i}`}
        points={tile.points}
        fill={tile.isLight ? 'url(#tile-light)' : 'url(#tile-dark)'}
        stroke="rgba(75,120,28,0.18)"
        strokeWidth={0.6}
      />
    ))}

    {/* ── Layer 5: Depth shading on grass ── */}
    <polygon points={pts([G.top, G.right, G.bottom, G.left])} fill="url(#grass-shadow)" />
    <polygon points={pts([G.top, G.right, G.bottom, G.left])} fill="url(#grass-sun)" />

    {/* ── Layer 6: Clean diamond edge outline ── */}
    <path
      d={DIAMOND_PATH}
      fill="none"
      stroke="rgba(55,90,22,0.3)"
      strokeWidth={1.2}
      strokeLinejoin="round"
    />

    {/* Thin dark line where grass meets cliff (shadow under grass lip) */}
    <line
      x1={G.left.x} y1={G.left.y}
      x2={G.bottom.x} y2={G.bottom.y}
      stroke="rgba(30,50,10,0.3)" strokeWidth={1}
    />
    <line
      x1={G.bottom.x} y1={G.bottom.y}
      x2={G.right.x} y2={G.right.y}
      stroke="rgba(30,50,10,0.25)" strokeWidth={1}
    />
  </svg>
);
