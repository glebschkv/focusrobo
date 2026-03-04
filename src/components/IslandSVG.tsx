/**
 * IslandSVG — Polished isometric island as inline SVG.
 *
 * Key geometry: The grass diamond's bottom two edges ARE the cliff walls'
 * top edges — they share exact vertices so there's zero gap.
 *
 * The SVG viewBox (420×273) matches the container's aspect-ratio (2/1.3).
 * The grass diamond is sized to encompass all 100 pet positions from
 * islandPositions.ts (which span ~6%–94% of the 77%-height pets layer).
 */

// ─── Geometry Constants ────────────────────────────────────────────
const VB_W = 420;
const VB_H = 273;
const CLIFF_DEPTH = 65; // How far down the cliff extends below the grass

// Grass diamond vertices — sized to encompass all pet positions with padding.
// Pet positions span ~6%–94% of the pets-layer (420 × 210px).
// Extreme pets: top(210,12), right(395,105), bottom(210,198), left(25,105).
// We add ~15px padding around those extremes.
const TOP = { x: 210, y: 0 };
const RIGHT = { x: 414, y: 105 };
const BOTTOM = { x: 210, y: 210 };
const LEFT = { x: 6, y: 105 };

// Cliff bottom vertices — directly below the grass edge, same X, shifted Y
const BOTTOM_DEEP = { x: BOTTOM.x, y: BOTTOM.y + CLIFF_DEPTH }; // 275
const LEFT_DEEP = { x: LEFT.x, y: LEFT.y + CLIFF_DEPTH }; // 170
const RIGHT_DEEP = { x: RIGHT.x, y: RIGHT.y + CLIFF_DEPTH }; // 170

// ─── Helpers ───────────────────────────────────────────────────────
interface Pt { x: number; y: number }

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function p(pt: Pt): string {
  return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
}

function pts(arr: Pt[]): string {
  return arr.map(p).join(' ');
}

// ─── Tile Grid (8×8 isometric) ─────────────────────────────────────
const GRID = 8;

function diamondPt(r: number, c: number): Pt {
  const g = GRID;
  const p1 = lerp(
    lerp(TOP, LEFT, r / g),
    lerp(RIGHT, BOTTOM, r / g),
    c / g,
  );
  const p2 = lerp(
    lerp(TOP, RIGHT, c / g),
    lerp(LEFT, BOTTOM, c / g),
    r / g,
  );
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

// Pre-compute all tiles
const TILES: { points: string; isLight: boolean }[] = [];
for (let r = 0; r < GRID; r++) {
  for (let c = 0; c < GRID; c++) {
    const corners = [
      diamondPt(r, c),
      diamondPt(r, c + 1),
      diamondPt(r + 1, c + 1),
      diamondPt(r + 1, c),
    ];
    TILES.push({
      points: pts(corners),
      isLight: (r + c) % 2 === 0,
    });
  }
}

// ─── Cliff Band Helpers ────────────────────────────────────────────
// Each cliff wall is a parallelogram. We split it into bands by interpolating
// between the top edge and bottom edge.

function bandPolygon(
  topLeft: Pt, topRight: Pt, botLeft: Pt, botRight: Pt,
  startT: number, endT: number,
): string {
  return pts([
    lerp(topLeft, botLeft, startT),
    lerp(topRight, botRight, startT),
    lerp(topRight, botRight, endT),
    lerp(topLeft, botLeft, endT),
  ]);
}

// Left cliff: top edge = LEFT→BOTTOM, bottom edge = LEFT_DEEP→BOTTOM_DEEP
const LW = { tl: LEFT, tr: BOTTOM, bl: LEFT_DEEP, br: BOTTOM_DEEP };
// Right cliff: top edge = RIGHT→BOTTOM, bottom edge = RIGHT_DEEP→BOTTOM_DEEP
const RW = { tl: RIGHT, tr: BOTTOM, bl: RIGHT_DEEP, br: BOTTOM_DEEP };

// ─── Stone Texture Lines (instead of random circles) ───────────────
// Horizontal mortar lines across the stone band, creating a brick/block pattern
function stoneLines(
  tl: Pt, tr: Pt, bl: Pt, br: Pt,
  bandStart: number, bandEnd: number,
  count: number,
): { x1: number; y1: number; x2: number; y2: number }[] {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 1; i < count; i++) {
    const t = bandStart + (i / count) * (bandEnd - bandStart);
    const left = lerp(tl, bl, t);
    const right = lerp(tr, br, t);
    lines.push({ x1: left.x, y1: left.y, x2: right.x, y2: right.y });
  }
  return lines;
}

// Vertical mortar joints (staggered between rows)
function stoneJoints(
  tl: Pt, tr: Pt, bl: Pt, br: Pt,
  bandStart: number, bandEnd: number,
  rows: number, jointsPerRow: number,
): { x1: number; y1: number; x2: number; y2: number }[] {
  const joints: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let row = 0; row < rows; row++) {
    const t1 = bandStart + (row / rows) * (bandEnd - bandStart);
    const t2 = bandStart + ((row + 1) / rows) * (bandEnd - bandStart);
    const offset = row % 2 === 0 ? 0 : 0.5 / jointsPerRow;
    for (let j = 1; j < jointsPerRow; j++) {
      const s = (j / jointsPerRow) + offset;
      if (s >= 1) continue;
      const top = lerp(lerp(tl, bl, t1), lerp(tr, br, t1), s);
      const bot = lerp(lerp(tl, bl, t2), lerp(tr, br, t2), s);
      joints.push({ x1: top.x, y1: top.y, x2: bot.x, y2: bot.y });
    }
  }
  return joints;
}

const leftStoneLines = stoneLines(LW.tl, LW.tr, LW.bl, LW.br, 0.5, 1.0, 5);
const rightStoneLines = stoneLines(RW.tl, RW.tr, RW.bl, RW.br, 0.5, 1.0, 5);
const leftStoneJoints = stoneJoints(LW.tl, LW.tr, LW.bl, LW.br, 0.5, 1.0, 5, 4);
const rightStoneJoints = stoneJoints(RW.tl, RW.tr, RW.bl, RW.br, 0.5, 1.0, 5, 4);

// ─── Grass Overhang (smooth bumps on bottom edges only) ────────────
function bumpyEdgePath(from: Pt, to: Pt, outwardDir: 1 | -1): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = (-dy / len) * outwardDir;
  const ny = (dx / len) * outwardDir;

  let path = '';
  const bumps = 10;
  for (let i = 0; i < bumps; i++) {
    const t1 = i / bumps;
    const t2 = (i + 0.5) / bumps;
    const t3 = (i + 1) / bumps;
    const p1 = lerp(from, to, t1);
    const mid = lerp(from, to, t2);
    const p3 = lerp(from, to, t3);
    const bumpSize = 3.5 + Math.sin(i * 5.7) * 1.2;
    path += `L ${p1.x.toFixed(1)},${p1.y.toFixed(1)} `;
    path += `Q ${(mid.x + nx * bumpSize).toFixed(1)},${(mid.y + ny * bumpSize).toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)} `;
  }
  return path;
}

// Path: starts at LEFT, bumps along bottom-left edge to BOTTOM,
// bumps along bottom-right edge to RIGHT, then straight back through
// TOP to close (clean top edges)
const GRASS_OVERHANG_PATH = [
  `M ${p(LEFT)}`,
  bumpyEdgePath(LEFT, BOTTOM, -1),
  bumpyEdgePath(BOTTOM, RIGHT, -1),
  `L ${p(RIGHT)}`,
  `L ${p(TOP)}`,
  `L ${p(LEFT)} Z`,
].join(' ');

// Clean diamond path (no bumps)
const DIAMOND = `M ${p(TOP)} L ${p(RIGHT)} L ${p(BOTTOM)} L ${p(LEFT)} Z`;

// ─── Component ─────────────────────────────────────────────────────
export const IslandSVG = () => (
  <svg
    viewBox={`0 0 ${VB_W} ${VB_H}`}
    className="pet-land__island-svg"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Grass surface gradient */}
      <linearGradient id="ig-grass" x1="30%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stopColor="#C4E87A" />
        <stop offset="40%" stopColor="#B0D85A" />
        <stop offset="70%" stopColor="#9CC84E" />
        <stop offset="100%" stopColor="#88B842" />
      </linearGradient>
      <linearGradient id="ig-tl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C2E878" />
        <stop offset="100%" stopColor="#AADA5C" />
      </linearGradient>
      <linearGradient id="ig-td" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A4D052" />
        <stop offset="100%" stopColor="#92C248" />
      </linearGradient>

      {/* Left cliff gradients */}
      <linearGradient id="ig-ll" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#72A834" />
        <stop offset="100%" stopColor="#5E9228" />
      </linearGradient>
      <linearGradient id="ig-ld" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B09858" />
        <stop offset="40%" stopColor="#A08850" />
        <stop offset="100%" stopColor="#887440" />
      </linearGradient>
      <linearGradient id="ig-ls" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#686050" />
        <stop offset="50%" stopColor="#585040" />
        <stop offset="100%" stopColor="#484038" />
      </linearGradient>

      {/* Right cliff gradients (shadow side — darker) */}
      <linearGradient id="ig-rl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#648E2C" />
        <stop offset="100%" stopColor="#507A20" />
      </linearGradient>
      <linearGradient id="ig-rd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#988048" />
        <stop offset="40%" stopColor="#8A7440" />
        <stop offset="100%" stopColor="#746434" />
      </linearGradient>
      <linearGradient id="ig-rs" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#585044" />
        <stop offset="50%" stopColor="#4A4238" />
        <stop offset="100%" stopColor="#3E3830" />
      </linearGradient>

      {/* Grass overhang fill */}
      <linearGradient id="ig-edge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#88B842" />
        <stop offset="100%" stopColor="#6B9430" />
      </linearGradient>

      {/* Depth shading */}
      <radialGradient id="ig-shadow" cx="35%" cy="65%" r="55%">
        <stop offset="60%" stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(40,70,15,0.15)" />
      </radialGradient>
      <radialGradient id="ig-sun" cx="60%" cy="32%" r="42%">
        <stop offset="0%" stopColor="rgba(220,250,130,0.2)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>

    {/* ═══ CLIFF WALLS — share exact top edges with grass diamond ═══ */}

    {/* Left cliff: stone band (50%–100%) */}
    <polygon points={bandPolygon(LW.tl, LW.tr, LW.bl, LW.br, 0.5, 1)} fill="url(#ig-ls)" />
    {/* Left cliff: dirt band (10%–50%) */}
    <polygon points={bandPolygon(LW.tl, LW.tr, LW.bl, LW.br, 0.1, 0.5)} fill="url(#ig-ld)" />
    {/* Left cliff: grass lip (0%–10%) */}
    <polygon points={bandPolygon(LW.tl, LW.tr, LW.bl, LW.br, 0, 0.1)} fill="url(#ig-ll)" />

    {/* Right cliff: stone band */}
    <polygon points={bandPolygon(RW.tl, RW.tr, RW.bl, RW.br, 0.5, 1)} fill="url(#ig-rs)" />
    {/* Right cliff: dirt band */}
    <polygon points={bandPolygon(RW.tl, RW.tr, RW.bl, RW.br, 0.1, 0.5)} fill="url(#ig-rd)" />
    {/* Right cliff: grass lip */}
    <polygon points={bandPolygon(RW.tl, RW.tr, RW.bl, RW.br, 0, 0.1)} fill="url(#ig-rl)" />

    {/* Band separator lines */}
    {[
      { w: LW, t: 0.1, o: 0.2 },
      { w: LW, t: 0.5, o: 0.25 },
      { w: RW, t: 0.1, o: 0.15 },
      { w: RW, t: 0.5, o: 0.2 },
    ].map(({ w, t, o }, i) => {
      const l = lerp(w.tl, w.bl, t);
      const r = lerp(w.tr, w.br, t);
      return (
        <line key={`sep-${i}`} x1={l.x} y1={l.y} x2={r.x} y2={r.y}
          stroke={`rgba(30,25,15,${o})`} strokeWidth={0.8} />
      );
    })}

    {/* ═══ STONE TEXTURE — mortar lines instead of random circles ═══ */}
    {/* Horizontal mortar lines in stone bands */}
    {[...leftStoneLines, ...rightStoneLines].map((ln, i) => (
      <line key={`sl-${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
        stroke="rgba(35,30,20,0.15)" strokeWidth={0.6} />
    ))}
    {/* Vertical mortar joints (staggered) */}
    {[...leftStoneJoints, ...rightStoneJoints].map((ln, i) => (
      <line key={`sj-${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2}
        stroke="rgba(35,30,20,0.12)" strokeWidth={0.5} />
    ))}

    {/* ═══ GRASS OVERHANG — smooth bumps on bottom edges ═══ */}
    <path d={GRASS_OVERHANG_PATH} fill="url(#ig-edge)" />

    {/* ═══ GRASS SURFACE ═══ */}
    {/* Base fill */}
    <path d={DIAMOND} fill="url(#ig-grass)" />

    {/* Checkerboard tiles — subtle two-tone */}
    {TILES.map((tile, i) => (
      <polygon key={`t-${i}`} points={tile.points}
        fill={tile.isLight ? 'url(#ig-tl)' : 'url(#ig-td)'}
        stroke="rgba(75,120,28,0.15)" strokeWidth={0.5} />
    ))}

    {/* Depth shading overlays */}
    <path d={DIAMOND} fill="url(#ig-shadow)" />
    <path d={DIAMOND} fill="url(#ig-sun)" />

    {/* Clean diamond outline */}
    <path d={DIAMOND} fill="none" stroke="rgba(55,90,22,0.25)"
      strokeWidth={1} strokeLinejoin="round" />

    {/* Shadow line where grass meets cliff (bottom two edges only) */}
    <line x1={LEFT.x} y1={LEFT.y} x2={BOTTOM.x} y2={BOTTOM.y}
      stroke="rgba(30,50,10,0.25)" strokeWidth={1.2} />
    <line x1={BOTTOM.x} y1={BOTTOM.y} x2={RIGHT.x} y2={RIGHT.y}
      stroke="rgba(30,50,10,0.2)" strokeWidth={1.2} />
  </svg>
);
