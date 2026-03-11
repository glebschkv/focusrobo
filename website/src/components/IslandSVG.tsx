/**
 * IslandSVG — Ported from main app with 'day' theme inlined.
 * Isometric floating island as inline SVG.
 */

// ─── Geometry Constants ────────────────────────────────────────────
const VB_W = 420;
const VB_H = 258;
const CLIFF_DEPTH = 42;

const TOP = { x: 210, y: 0 };
const RIGHT = { x: 414, y: 105 };
const BOTTOM = { x: 210, y: 210 };
const LEFT = { x: 6, y: 105 };

const BOTTOM_DEEP = { x: BOTTOM.x, y: BOTTOM.y + CLIFF_DEPTH };
const LEFT_DEEP = { x: LEFT.x, y: LEFT.y + CLIFF_DEPTH };
const RIGHT_DEEP = { x: RIGHT.x, y: RIGHT.y + CLIFF_DEPTH };

// ─── Day theme colors (inlined) ────────────────────────────────────
const theme = {
  grassLight: ['#CCF080', '#B8E468'] as const,
  grassDark: ['#96C444', '#84B438'] as const,
  grassBase: ['#C4E87A', '#B0D85A', '#9CC84E', '#88B842'] as const,
  grassEdge: ['#88B842', '#6B9430'] as const,
  lipLeft: ['#72A834', '#5E9228', '#9A8448'] as const,
  lipRight: ['#648E2C', '#507A20', '#8A7440'] as const,
  dirtLeft: ['#B09858', '#A08850', '#887440'] as const,
  dirtRight: ['#988048', '#8A7440', '#746434'] as const,
  stoneBaseLeft: '#5C5444',
  stoneBaseRight: '#504840',
};

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

function seeded(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─── Tile Grid ──────────────────────────────────────────────────────
const FULL_GRID = 20;

function diamondPtNorm(r: number, c: number): Pt {
  const p1 = lerp(lerp(TOP, LEFT, r), lerp(RIGHT, BOTTOM, r), c);
  const p2 = lerp(lerp(TOP, RIGHT, c), lerp(LEFT, BOTTOM, c), r);
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

function diamondPt(r: number, c: number): Pt {
  const g = FULL_GRID;
  const p1 = lerp(lerp(TOP, LEFT, r / g), lerp(RIGHT, BOTTOM, r / g), c / g);
  const p2 = lerp(lerp(TOP, RIGHT, c / g), lerp(LEFT, BOTTOM, c / g), r / g);
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

function computeTiles(gridSize: number): { points: string; isLight: boolean }[] {
  const tiles: { points: string; isLight: boolean }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const corners = [
        diamondPtNorm(r / gridSize, c / gridSize),
        diamondPtNorm(r / gridSize, (c + 1) / gridSize),
        diamondPtNorm((r + 1) / gridSize, (c + 1) / gridSize),
        diamondPtNorm((r + 1) / gridSize, c / gridSize),
      ];
      tiles.push({ points: pts(corners), isLight: (r + c) % 2 === 0 });
    }
  }
  return tiles;
}

const tilesCache = new Map<number, { points: string; isLight: boolean }[]>();
function getTiles(gridSize: number) {
  let cached = tilesCache.get(gridSize);
  if (!cached) { cached = computeTiles(gridSize); tilesCache.set(gridSize, cached); }
  return cached;
}

// ─── Cliff Band Helpers ────────────────────────────────────────────
function bandPolygon(
  topLeft: Pt, topRight: Pt, botLeft: Pt, botRight: Pt,
  startT: number, endT: number,
): string {
  return pts([
    lerp(topLeft, botLeft, startT), lerp(topRight, botRight, startT),
    lerp(topRight, botRight, endT), lerp(topLeft, botLeft, endT),
  ]);
}

const LW = { tl: LEFT, tr: BOTTOM, bl: LEFT_DEEP, br: BOTTOM_DEEP };
const RW = { tl: RIGHT, tr: BOTTOM, bl: RIGHT_DEEP, br: BOTTOM_DEEP };

// ─── Stone Blocks ──────────────────────────────────────────────────
interface StoneBlock { tl: Pt; tr: Pt; bl: Pt; br: Pt; fill: string; highlight: string; }

const STONE_COLORS_LEFT = ['#706858','#7A7264','#686050','#746C5C','#6E6654','#7C7466','#626050','#78705E','#6A6252','#72685A'];
const STONE_COLORS_RIGHT = ['#625A4C','#6C6454','#5A5244','#66604E','#5E5848','#6A6252','#585040','#645C4C','#5C5646','#625A4E'];

function generateStoneBlocks(
  wallTl: Pt, wallTr: Pt, wallBl: Pt, wallBr: Pt,
  bandStart: number, bandEnd: number,
  rows: number, cols: number, seed: number, colors: string[],
): StoneBlock[] {
  const blocks: StoneBlock[] = [];
  for (let row = 0; row < rows; row++) {
    const t1 = bandStart + (row / rows) * (bandEnd - bandStart);
    const t2 = bandStart + ((row + 1) / rows) * (bandEnd - bandStart);
    const offset = row % 2 === 0 ? 0 : 0.5 / cols;
    for (let col = 0; col < cols; col++) {
      const s1 = col / cols + offset;
      const s2 = (col + 1) / cols + offset;
      if (s1 >= 1 || s2 > 1.05) continue;
      const clampS2 = Math.min(s2, 1);
      const tl = lerp(lerp(wallTl, wallBl, t1), lerp(wallTr, wallBr, t1), s1);
      const tr = lerp(lerp(wallTl, wallBl, t1), lerp(wallTr, wallBr, t1), clampS2);
      const bl = lerp(lerp(wallTl, wallBl, t2), lerp(wallTr, wallBr, t2), s1);
      const br = lerp(lerp(wallTl, wallBl, t2), lerp(wallTr, wallBr, t2), clampS2);
      const colorIdx = Math.floor(seeded(seed + row * 7 + col * 13) * colors.length);
      blocks.push({
        tl, tr, bl, br, fill: colors[colorIdx],
        highlight: `rgba(255,255,240,${0.08 + seeded(seed + row * 3 + col * 19) * 0.08})`,
      });
    }
  }
  return blocks;
}

const leftStoneBlocks = generateStoneBlocks(LW.tl, LW.tr, LW.bl, LW.br, 0.5, 1.0, 6, 5, 42, STONE_COLORS_LEFT);
const rightStoneBlocks = generateStoneBlocks(RW.tl, RW.tr, RW.bl, RW.br, 0.5, 1.0, 6, 5, 99, STONE_COLORS_RIGHT);

// ─── Dirt strata ────────────────────────────────────────────────────
function dirtStrataLines(tl: Pt, tr: Pt, bl: Pt, br: Pt, bandStart: number, bandEnd: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
  const positions = [0.15, 0.35, 0.55, 0.72, 0.88];
  const opacities = [0.1, 0.14, 0.1, 0.08, 0.06];
  for (let i = 0; i < positions.length; i++) {
    const t = bandStart + positions[i] * (bandEnd - bandStart);
    const l = lerp(tl, bl, t); const r = lerp(tr, br, t);
    lines.push({ x1: l.x, y1: l.y, x2: r.x, y2: r.y, opacity: opacities[i] });
  }
  return lines;
}

const leftDirtStrata = dirtStrataLines(LW.tl, LW.tr, LW.bl, LW.br, 0.12, 0.5);
const rightDirtStrata = dirtStrataLines(RW.tl, RW.tr, RW.bl, RW.br, 0.12, 0.5);

// ─── Pebbles ────────────────────────────────────────────────────────
function generatePebbles(tl: Pt, tr: Pt, bl: Pt, br: Pt, bandStart: number, bandEnd: number, count: number, seed: number) {
  const pebbles: { cx: number; cy: number; rx: number; ry: number; fill: string }[] = [];
  for (let i = 0; i < count; i++) {
    const s = 0.1 + seeded(seed + i * 11) * 0.8;
    const tPos = bandStart + (0.1 + seeded(seed + i * 17) * 0.8) * (bandEnd - bandStart);
    const pt = lerp(lerp(tl, bl, tPos), lerp(tr, br, tPos), s);
    const shade = Math.floor(80 + seeded(seed + i * 23) * 40);
    pebbles.push({ cx: pt.x, cy: pt.y, rx: 1.5 + seeded(seed + i * 29) * 2, ry: 1 + seeded(seed + i * 31) * 1.2, fill: `rgb(${shade},${shade-10},${shade-20})` });
  }
  return pebbles;
}

const leftPebbles = generatePebbles(LW.tl, LW.tr, LW.bl, LW.br, 0.12, 0.5, 5, 55);
const rightPebbles = generatePebbles(RW.tl, RW.tr, RW.bl, RW.br, 0.12, 0.5, 5, 77);

// ─── Root cracks ────────────────────────────────────────────────────
function rootCracks(tl: Pt, tr: Pt, bl: Pt, br: Pt, bandStart: number, seed: number): string[] {
  const paths: string[] = [];
  for (let i = 0; i < 4; i++) {
    const s = 0.1 + seeded(seed + i * 11) * 0.8;
    const startPt = lerp(lerp(tl, bl, bandStart), lerp(tr, br, bandStart), s);
    const depth = 0.08 + seeded(seed + i * 3) * 0.1;
    const endPt = lerp(lerp(tl, bl, bandStart + depth), lerp(tr, br, bandStart + depth), s + (seeded(seed + i * 17) - 0.5) * 0.06);
    const midPt = { x: (startPt.x + endPt.x) / 2 + (seeded(seed + i * 23) - 0.5) * 3, y: (startPt.y + endPt.y) / 2 };
    paths.push(`M ${p(startPt)} Q ${p(midPt)} ${p(endPt)}`);
  }
  return paths;
}

const leftRoots = rootCracks(LW.tl, LW.tr, LW.bl, LW.br, 0.12, 55);
const rightRoots = rootCracks(RW.tl, RW.tr, RW.bl, RW.br, 0.12, 77);

// ─── Grass strands ──────────────────────────────────────────────────
function grassStrands(tl: Pt, tr: Pt, bl: Pt, br: Pt, lipEnd: number, seed: number, count: number): string[] {
  const strands: string[] = [];
  for (let i = 0; i < count; i++) {
    const s = 0.05 + seeded(seed + i * 11) * 0.9;
    const top = lerp(lerp(tl, bl, lipEnd * 0.5), lerp(tr, br, lipEnd * 0.5), s);
    const hangLen = lipEnd + 0.04 + seeded(seed + i * 17) * 0.06;
    const bottom = lerp(lerp(tl, bl, hangLen), lerp(tr, br, hangLen), s + (seeded(seed + i * 23) - 0.5) * 0.03);
    const mid = { x: (top.x + bottom.x) / 2 + (seeded(seed + i * 29) - 0.5) * 2, y: (top.y + bottom.y) / 2 };
    strands.push(`M ${p(top)} Q ${p(mid)} ${p(bottom)}`);
  }
  return strands;
}

const leftGrassStrands = grassStrands(LW.tl, LW.tr, LW.bl, LW.br, 0.12, 33, 6);
const rightGrassStrands = grassStrands(RW.tl, RW.tr, RW.bl, RW.br, 0.12, 66, 6);

// ─── Grass overhang ─────────────────────────────────────────────────
function bumpyEdgePath(from: Pt, to: Pt, outwardDir: 1 | -1): string {
  const dx = to.x - from.x; const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = (-dy / len) * outwardDir; const ny = (dx / len) * outwardDir;
  let path = '';
  const bumps = 14;
  for (let i = 0; i < bumps; i++) {
    const t1 = i / bumps; const t2 = (i + 0.5) / bumps; const t3 = (i + 1) / bumps;
    const p1 = lerp(from, to, t1); const mid = lerp(from, to, t2); const p3 = lerp(from, to, t3);
    const bumpSize = 2.5 + Math.sin(i * 4.3) * 1.5 + seeded(i * 7 + 3) * 1.2;
    path += `L ${p1.x.toFixed(1)},${p1.y.toFixed(1)} `;
    path += `Q ${(mid.x + nx * bumpSize).toFixed(1)},${(mid.y + ny * bumpSize).toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)} `;
  }
  return path;
}

function bladeShapes(from: Pt, to: Pt, outwardDir: 1 | -1, count: number, seed: number): string[] {
  const dx = to.x - from.x; const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = (-dy / len) * outwardDir; const ny = (dx / len) * outwardDir;
  const blades: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = 0.05 + seeded(seed + i * 13) * 0.9;
    const base = lerp(from, to, t);
    const tipLen = 3 + seeded(seed + i * 7) * 2.5;
    const tip = { x: base.x + nx * tipLen, y: base.y + ny * tipLen };
    const halfW = 1.2 + seeded(seed + i * 19) * 0.8;
    const left = lerp(from, to, t - halfW / len);
    const right = lerp(from, to, t + halfW / len);
    blades.push(`M ${p(left)} L ${p(tip)} L ${p(right)} Z`);
  }
  return blades;
}

const leftBlades = bladeShapes(LEFT, BOTTOM, -1, 3, 31);
const rightBlades = bladeShapes(BOTTOM, RIGHT, -1, 3, 47);

const GRASS_OVERHANG_PATH = [
  `M ${p(LEFT)}`, bumpyEdgePath(LEFT, BOTTOM, -1), bumpyEdgePath(BOTTOM, RIGHT, -1),
  `L ${p(RIGHT)}`, `L ${p(TOP)}`, `L ${p(LEFT)} Z`,
].join(' ');

// ─── Smooth diamond ─────────────────────────────────────────────────
const CURVE_R = 8;
function dist(a: Pt, b: Pt): number { return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2); }

function smoothDiamond(): string {
  const topIn = lerp(LEFT, TOP, 1 - CURVE_R / dist(LEFT, TOP));
  const topOut = lerp(TOP, RIGHT, CURVE_R / dist(TOP, RIGHT));
  const rightIn = lerp(TOP, RIGHT, 1 - CURVE_R / dist(TOP, RIGHT));
  const rightOut = lerp(RIGHT, BOTTOM, CURVE_R / dist(RIGHT, BOTTOM));
  const botIn = lerp(RIGHT, BOTTOM, 1 - CURVE_R / dist(RIGHT, BOTTOM));
  const botOut = lerp(BOTTOM, LEFT, CURVE_R / dist(BOTTOM, LEFT));
  const leftIn = lerp(BOTTOM, LEFT, 1 - CURVE_R / dist(BOTTOM, LEFT));
  const leftOut = lerp(LEFT, TOP, CURVE_R / dist(LEFT, TOP));
  return [
    `M ${p(topOut)}`, `L ${p(rightIn)}`, `Q ${p(RIGHT)} ${p(rightOut)}`,
    `L ${p(botIn)}`, `Q ${p(BOTTOM)} ${p(botOut)}`, `L ${p(leftIn)}`,
    `Q ${p(LEFT)} ${p(leftOut)}`, `L ${p(topIn)}`, `Q ${p(TOP)} ${p(topOut)}`, `Z`,
  ].join(' ');
}

const DIAMOND_SMOOTH = smoothDiamond();
const DIAMOND = `M ${p(TOP)} L ${p(RIGHT)} L ${p(BOTTOM)} L ${p(LEFT)} Z`;

// ─── Grass texture ──────────────────────────────────────────────────
function generateGrassTufts(count: number, seed: number) {
  const tufts: { path: string }[] = [];
  for (let i = 0; i < count; i++) {
    const r = seeded(seed + i * 11); const c = seeded(seed + i * 17 + 3);
    const center = lerp(lerp(TOP, BOTTOM, r), lerp(LEFT, RIGHT, r), c);
    const cx = center.x * 0.5 + (lerp(lerp(TOP, LEFT, r), lerp(RIGHT, BOTTOM, r), c).x) * 0.5;
    const cy = center.y * 0.5 + (lerp(lerp(TOP, LEFT, r), lerp(RIGHT, BOTTOM, r), c).y) * 0.5;
    const verts = 3 + Math.floor(seeded(seed + i * 23) * 3);
    const size = 4 + seeded(seed + i * 31) * 6;
    let pathD = '';
    for (let v = 0; v < verts; v++) {
      const angle = (v / verts) * Math.PI * 2 + seeded(seed + i * 37 + v) * 0.5;
      const rad = size * (0.6 + seeded(seed + i * 41 + v) * 0.4);
      const vx = cx + Math.cos(angle) * rad;
      const vy = cy + Math.sin(angle) * rad * 0.5;
      pathD += v === 0 ? `M ${vx.toFixed(1)},${vy.toFixed(1)}` : ` L ${vx.toFixed(1)},${vy.toFixed(1)}`;
    }
    tufts.push({ path: pathD + ' Z' });
  }
  return tufts;
}

const grassTufts = generateGrassTufts(10, 100);

function generateSunDapples(count: number, seed: number) {
  const dapples: { cx: number; cy: number; rx: number; ry: number }[] = [];
  for (let i = 0; i < count; i++) {
    const r = 0.15 + seeded(seed + i * 11) * 0.45;
    const c = 0.4 + seeded(seed + i * 17) * 0.45;
    const pt = diamondPt(Math.floor(r * FULL_GRID), Math.floor(c * FULL_GRID));
    dapples.push({ cx: pt.x, cy: pt.y, rx: 6 + seeded(seed + i * 23) * 8, ry: 3 + seeded(seed + i * 29) * 4 });
  }
  return dapples;
}

const sunDapples = generateSunDapples(6, 200);

function generateDirtPatches(count: number, seed: number) {
  const patches: { cx: number; cy: number; rx: number; ry: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = 0.2 + seeded(seed + i * 11) * 0.6;
    const edge = i % 2 === 0 ? lerp(LEFT, BOTTOM, t) : lerp(BOTTOM, RIGHT, t);
    const inward = lerp(edge, { x: 210, y: 105 }, 0.08 + seeded(seed + i * 17) * 0.06);
    patches.push({ cx: inward.x, cy: inward.y, rx: 3 + seeded(seed + i * 23) * 3, ry: 1.5 + seeded(seed + i * 29) * 2 });
  }
  return patches;
}

const dirtPatches = generateDirtPatches(4, 300);

function generateMossSpots(tl: Pt, tr: Pt, bl: Pt, br: Pt, bandStart: number, seed: number) {
  const spots: { cx: number; cy: number; rx: number; ry: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const s = 0.15 + seeded(seed + i * 13) * 0.7;
    const t = bandStart + 0.02;
    const pt = lerp(lerp(tl, bl, t), lerp(tr, br, t), s);
    spots.push({ cx: pt.x, cy: pt.y, rx: 5 + seeded(seed + i * 19) * 4, ry: 2 + seeded(seed + i * 23) * 1.5 });
  }
  return spots;
}

const leftMoss = generateMossSpots(LW.tl, LW.tr, LW.bl, LW.br, 0.5, 111);
const rightMoss = generateMossSpots(RW.tl, RW.tr, RW.bl, RW.br, 0.5, 222);

const leftCliffClip = `M ${p(LW.tl)} L ${p(LW.tr)} L ${p(LW.br)} L ${p(LW.bl)} Z`;
const rightCliffClip = `M ${p(RW.tl)} L ${p(RW.tr)} L ${p(RW.br)} L ${p(RW.bl)} Z`;

// ─── Component ─────────────────────────────────────────────────────
interface IslandSVGProps {
  gridSize?: number;
}

export const IslandSVG = ({ gridSize = 10 }: IslandSVGProps) => {
  const tiles = getTiles(gridSize);
  return (
  <svg
    viewBox={`0 0 ${VB_W} ${VB_H}`}
    className="island-svg"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="ig-grass" x1="30%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stopColor={theme.grassBase[0]} />
        <stop offset="40%" stopColor={theme.grassBase[1]} />
        <stop offset="70%" stopColor={theme.grassBase[2]} />
        <stop offset="100%" stopColor={theme.grassBase[3]} />
      </linearGradient>
      <linearGradient id="ig-tl" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={theme.grassLight[0]} />
        <stop offset="100%" stopColor={theme.grassLight[1]} />
      </linearGradient>
      <linearGradient id="ig-td" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={theme.grassDark[0]} />
        <stop offset="100%" stopColor={theme.grassDark[1]} />
      </linearGradient>
      <linearGradient id="ig-ll" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.lipLeft[0]} /><stop offset="100%" stopColor={theme.lipLeft[1]} /></linearGradient>
      <linearGradient id="ig-ld" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.dirtLeft[0]} /><stop offset="40%" stopColor={theme.dirtLeft[1]} /><stop offset="100%" stopColor={theme.dirtLeft[2]} /></linearGradient>
      <linearGradient id="ig-rl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.lipRight[0]} /><stop offset="100%" stopColor={theme.lipRight[1]} /></linearGradient>
      <linearGradient id="ig-rd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.dirtRight[0]} /><stop offset="40%" stopColor={theme.dirtRight[1]} /><stop offset="100%" stopColor={theme.dirtRight[2]} /></linearGradient>
      <linearGradient id="ig-edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.grassEdge[0]} /><stop offset="100%" stopColor={theme.grassEdge[1]} /></linearGradient>
      <radialGradient id="ig-shadow" cx="35%" cy="65%" r="55%"><stop offset="60%" stopColor="transparent" /><stop offset="100%" stopColor="rgba(40,70,15,0.15)" /></radialGradient>
      <radialGradient id="ig-sun" cx="60%" cy="32%" r="42%"><stop offset="0%" stopColor="rgba(220,250,130,0.2)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
      <linearGradient id="ig-ll-blend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.lipLeft[0]} /><stop offset="60%" stopColor={theme.lipLeft[1]} /><stop offset="100%" stopColor={theme.lipLeft[2]} /></linearGradient>
      <linearGradient id="ig-rl-blend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.lipRight[0]} /><stop offset="60%" stopColor={theme.lipRight[1]} /><stop offset="100%" stopColor={theme.lipRight[2]} /></linearGradient>
      <clipPath id="ig-diamond-clip"><path d={DIAMOND} /></clipPath>
      <clipPath id="ig-left-cliff-clip"><path d={leftCliffClip} /></clipPath>
      <clipPath id="ig-right-cliff-clip"><path d={rightCliffClip} /></clipPath>
    </defs>

    {/* Left cliff */}
    <g clipPath="url(#ig-left-cliff-clip)">
      <polygon points={bandPolygon(LW.tl, LW.tr, LW.bl, LW.br, 0.5, 1)} fill="#5C5444" />
      {leftStoneBlocks.map((b, i) => (
        <g key={`lsb-${i}`}>
          <polygon points={pts([b.tl, b.tr, b.br, b.bl])} fill={b.fill} stroke="rgba(40,35,25,0.35)" strokeWidth={0.8} />
          <line x1={b.tl.x} y1={b.tl.y} x2={b.tr.x} y2={b.tr.y} stroke={b.highlight} strokeWidth={0.7} />
          <line x1={b.bl.x} y1={b.bl.y} x2={b.br.x} y2={b.br.y} stroke="rgba(20,15,10,0.2)" strokeWidth={0.6} />
        </g>
      ))}
      {leftMoss.map((m, i) => <ellipse key={`lms-${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill="rgba(75,115,35,0.15)" />)}
      <polygon points={bandPolygon(LW.tl, LW.tr, LW.bl, LW.br, 0.12, 0.5)} fill="url(#ig-ld)" />
      {leftDirtStrata.map((ln, i) => <line key={`lds-${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} stroke={`rgba(70,50,25,${ln.opacity})`} strokeWidth={0.8} />)}
      {leftPebbles.map((pb, i) => <ellipse key={`lpb-${i}`} cx={pb.cx} cy={pb.cy} rx={pb.rx} ry={pb.ry} fill={pb.fill} stroke="rgba(50,40,30,0.15)" strokeWidth={0.4} />)}
      {leftRoots.map((d, i) => <path key={`lrt-${i}`} d={d} fill="none" stroke="rgba(55,85,22,0.2)" strokeWidth={0.7} strokeLinecap="round" />)}
      <polygon points={bandPolygon(LW.tl, LW.tr, LW.bl, LW.br, 0, 0.12)} fill="url(#ig-ll-blend)" />
      {leftGrassStrands.map((d, i) => <path key={`lgs-${i}`} d={d} fill="none" stroke="rgba(80,140,30,0.3)" strokeWidth={1} strokeLinecap="round" />)}
      {(() => { const l = lerp(LW.tl, LW.bl, 0.5); const r = lerp(LW.tr, LW.br, 0.5); return <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke="rgba(25,20,10,0.2)" strokeWidth={0.8} />; })()}
    </g>

    {/* Right cliff */}
    <g clipPath="url(#ig-right-cliff-clip)">
      <polygon points={bandPolygon(RW.tl, RW.tr, RW.bl, RW.br, 0.5, 1)} fill="#504840" />
      {rightStoneBlocks.map((b, i) => (
        <g key={`rsb-${i}`}>
          <polygon points={pts([b.tl, b.tr, b.br, b.bl])} fill={b.fill} stroke="rgba(35,30,20,0.3)" strokeWidth={0.8} />
          <line x1={b.tl.x} y1={b.tl.y} x2={b.tr.x} y2={b.tr.y} stroke={b.highlight} strokeWidth={0.7} />
          <line x1={b.bl.x} y1={b.bl.y} x2={b.br.x} y2={b.br.y} stroke="rgba(20,15,10,0.18)" strokeWidth={0.6} />
        </g>
      ))}
      {rightMoss.map((m, i) => <ellipse key={`rms-${i}`} cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry} fill="rgba(75,115,35,0.15)" />)}
      <polygon points={bandPolygon(RW.tl, RW.tr, RW.bl, RW.br, 0.12, 0.5)} fill="url(#ig-rd)" />
      {rightDirtStrata.map((ln, i) => <line key={`rds-${i}`} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} stroke={`rgba(70,50,25,${ln.opacity})`} strokeWidth={0.8} />)}
      {rightPebbles.map((pb, i) => <ellipse key={`rpb-${i}`} cx={pb.cx} cy={pb.cy} rx={pb.rx} ry={pb.ry} fill={pb.fill} stroke="rgba(50,40,30,0.15)" strokeWidth={0.4} />)}
      {rightRoots.map((d, i) => <path key={`rrt-${i}`} d={d} fill="none" stroke="rgba(55,85,22,0.2)" strokeWidth={0.7} strokeLinecap="round" />)}
      <polygon points={bandPolygon(RW.tl, RW.tr, RW.bl, RW.br, 0, 0.12)} fill="url(#ig-rl-blend)" />
      {rightGrassStrands.map((d, i) => <path key={`rgs-${i}`} d={d} fill="none" stroke="rgba(80,140,30,0.3)" strokeWidth={1} strokeLinecap="round" />)}
      {(() => { const l = lerp(RW.tl, RW.bl, 0.5); const r = lerp(RW.tr, RW.br, 0.5); return <line x1={l.x} y1={l.y} x2={r.x} y2={r.y} stroke="rgba(25,20,10,0.18)" strokeWidth={0.8} />; })()}
    </g>

    {/* Grass overhang */}
    <path d={GRASS_OVERHANG_PATH} fill="url(#ig-edge)" />
    <path d={GRASS_OVERHANG_PATH} fill="none" stroke="rgba(55,80,25,0.18)" strokeWidth={0.6} />
    {[...leftBlades, ...rightBlades].map((d, i) => <path key={`bl-${i}`} d={d} fill="rgba(90,140,35,0.35)" />)}

    {/* Grass surface */}
    <path d={DIAMOND_SMOOTH} fill="url(#ig-grass)" />
    {tiles.map((tile, i) => (
      <polygon key={`t-${i}`} points={tile.points}
        fill={tile.isLight ? 'url(#ig-tl)' : 'url(#ig-td)'}
        stroke="rgba(75,120,28,0.2)" strokeWidth={0.6} />
    ))}

    {/* Grass texture detail */}
    <g clipPath="url(#ig-diamond-clip)">
      {grassTufts.map((tuft, i) => <path key={`gt-${i}`} d={tuft.path} fill="rgba(60,100,25,0.1)" />)}
      {sunDapples.map((d, i) => <ellipse key={`sd2-${i}`} cx={d.cx} cy={d.cy} rx={d.rx} ry={d.ry} fill="rgba(210,240,120,0.12)" />)}
      {dirtPatches.map((dp, i) => <ellipse key={`dp-${i}`} cx={dp.cx} cy={dp.cy} rx={dp.rx} ry={dp.ry} fill="rgba(140,120,80,0.09)" />)}
    </g>

    {/* Tier decorations */}
    <g clipPath="url(#ig-diamond-clip)" opacity={0.7}>
      {gridSize >= 7 && Array.from({ length: Math.min(gridSize - 4, 12) }, (_, i) => {
        const s = seeded(i * 37 + 11);
        const t = 0.05 + s * 0.9;
        const edge = i % 2 === 0 ? lerp(TOP, LEFT, t) : lerp(TOP, RIGHT, t);
        const colors = ['#FF9EAA', '#FFD166', '#A8E6CF', '#DDA0DD', '#87CEEB'];
        return (
          <g key={`deco-${i}`}>
            <circle cx={edge.x} cy={edge.y - 2} r={2} fill={colors[i % colors.length]} opacity={0.6} />
            <line x1={edge.x} y1={edge.y - 1} x2={edge.x} y2={edge.y + 2} stroke="rgba(60,100,30,0.4)" strokeWidth={0.6} />
          </g>
        );
      })}
      {gridSize >= 10 && Array.from({ length: Math.min(gridSize - 8, 6) }, (_, i) => {
        const s = seeded(i * 53 + 77);
        const t = 0.15 + s * 0.7;
        const edge = i % 2 === 0 ? lerp(LEFT, BOTTOM, t) : lerp(BOTTOM, RIGHT, t);
        return <ellipse key={`rock-${i}`} cx={edge.x + (s - 0.5) * 8} cy={edge.y - 1} rx={2.5 + s} ry={1.5 + s * 0.5} fill="rgba(140,130,110,0.3)" />;
      })}
    </g>

    {/* Shading overlays */}
    <path d={DIAMOND_SMOOTH} fill="url(#ig-shadow)" />
    <path d={DIAMOND_SMOOTH} fill="url(#ig-sun)" />
    <path d={DIAMOND_SMOOTH} fill="none" stroke="rgba(55,90,22,0.25)" strokeWidth={1} strokeLinejoin="round" />

    {/* Edge shadow */}
    <line x1={LEFT.x} y1={LEFT.y} x2={BOTTOM.x} y2={BOTTOM.y} stroke="rgba(30,50,10,0.28)" strokeWidth={1.8} />
    <line x1={BOTTOM.x} y1={BOTTOM.y} x2={RIGHT.x} y2={RIGHT.y} stroke="rgba(30,50,10,0.22)" strokeWidth={1.8} />
    <line x1={LEFT.x} y1={LEFT.y + 1} x2={BOTTOM.x} y2={BOTTOM.y + 1} stroke="rgba(20,40,5,0.1)" strokeWidth={2.5} />
    <line x1={BOTTOM.x} y1={BOTTOM.y + 1} x2={RIGHT.x} y2={RIGHT.y + 1} stroke="rgba(20,40,5,0.08)" strokeWidth={2.5} />
  </svg>
  );
};
