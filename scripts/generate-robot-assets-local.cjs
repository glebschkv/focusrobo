#!/usr/bin/env node

/**
 * Generate 64x64 pixel art robot assets locally using sharp.
 * Each robot gets a unique procedurally generated design based on its
 * zone colors, rarity glow, and a seeded pattern.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Simple seeded RNG
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Zone color palettes [primary, secondary, accent, dark]
const ZONE_COLORS = {
  "assembly-line": [
    [100, 140, 180], // steel blue
    [70, 100, 140],  // dark blue
    [200, 180, 100], // bolt gold
    [40, 50, 70],    // shadow
  ],
  workshop: [
    [200, 160, 80],  // brass
    [160, 120, 60],  // bronze
    [220, 200, 140], // light brass
    [60, 45, 30],    // shadow
  ],
  "stealth-lab": [
    [60, 60, 80],    // dark purple-gray
    [40, 40, 60],    // deeper
    [0, 255, 200],   // neon cyan
    [20, 20, 35],    // shadow
  ],
  "biotech-zone": [
    [80, 160, 80],   // green
    [60, 120, 60],   // dark green
    [160, 200, 80],  // lime
    [30, 50, 30],    // shadow
  ],
  "solar-fields": [
    [240, 200, 80],  // gold
    [220, 160, 40],  // amber
    [255, 240, 180], // light gold
    [100, 70, 20],   // shadow
  ],
  "cyber-district": [
    [40, 40, 60],    // dark cyber
    [60, 20, 80],    // purple
    [0, 200, 255],   // neon blue
    [20, 15, 30],    // shadow
  ],
};

const RARITY_GLOW = {
  common: null,
  rare: [100, 180, 255],    // blue glow
  epic: [200, 100, 255],    // purple glow
  legendary: [255, 215, 0], // gold glow
};

const ROBOTS = [
  // Assembly Line
  { id: "bolt-bot", zone: "assembly-line", rarity: "common", seed: 42, style: "blocky" },
  { id: "gear-pup", zone: "assembly-line", rarity: "common", seed: 43, style: "quad" },
  { id: "rivet", zone: "assembly-line", rarity: "common", seed: 44, style: "round" },
  { id: "spark-welder", zone: "assembly-line", rarity: "rare", seed: 45, style: "blocky" },
  { id: "turbo-tank", zone: "assembly-line", rarity: "rare", seed: 46, style: "wide" },
  // Workshop
  { id: "wrench-bot", zone: "workshop", rarity: "common", seed: 50, style: "blocky" },
  { id: "cog-roller", zone: "workshop", rarity: "common", seed: 51, style: "round" },
  { id: "chrome-cat", zone: "workshop", rarity: "rare", seed: 52, style: "quad" },
  { id: "piston", zone: "workshop", rarity: "rare", seed: 53, style: "blocky" },
  { id: "plasma-pup", zone: "workshop", rarity: "epic", seed: 54, style: "quad" },
  { id: "iron-scholar", zone: "workshop", rarity: "rare", seed: 55, style: "tall" },
  // Stealth Lab
  { id: "shadow-drone", zone: "stealth-lab", rarity: "common", seed: 60, style: "wide" },
  { id: "neon-phantom", zone: "stealth-lab", rarity: "rare", seed: 61, style: "tall" },
  { id: "cipher", zone: "stealth-lab", rarity: "epic", seed: 62, style: "blocky" },
  { id: "stealth-owl", zone: "stealth-lab", rarity: "epic", seed: 63, style: "round" },
  // Biotech Zone
  { id: "moss-mech", zone: "biotech-zone", rarity: "common", seed: 70, style: "blocky" },
  { id: "spore-bot", zone: "biotech-zone", rarity: "rare", seed: 71, style: "round" },
  { id: "vine-walker", zone: "biotech-zone", rarity: "epic", seed: 72, style: "tall" },
  // Solar Fields
  { id: "sun-charger", zone: "solar-fields", rarity: "common", seed: 80, style: "wide" },
  { id: "prism-bot", zone: "solar-fields", rarity: "rare", seed: 81, style: "round" },
  { id: "nova", zone: "solar-fields", rarity: "epic", seed: 82, style: "blocky" },
  // Cyber District
  { id: "neon-sentinel", zone: "cyber-district", rarity: "rare", seed: 90, style: "tall" },
  { id: "quantum-core", zone: "cyber-district", rarity: "epic", seed: 91, style: "round" },
  { id: "omega-prime", zone: "cyber-district", rarity: "legendary", seed: 77, style: "wide" },
  { id: "focus-titan", zone: "cyber-district", rarity: "legendary", seed: 93, style: "blocky" },
];

function createRobotPixels(robot) {
  const SIZE = 64;
  // RGBA buffer
  const data = Buffer.alloc(SIZE * SIZE * 4, 0); // all transparent

  const rng = mulberry32(robot.seed);
  const colors = ZONE_COLORS[robot.zone];
  const [primary, secondary, accent, dark] = colors;
  const glow = RARITY_GLOW[robot.rarity];

  function setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;
    const i = (y * SIZE + x) * 4;
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = a;
  }

  function fillRect(x, y, w, h, color, alpha = 255) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setPixel(x + dx, y + dy, color[0], color[1], color[2], alpha);
      }
    }
  }

  // Mirror-fill for symmetry (only draw left half, mirror to right)
  function setPixelSym(cx, x, y, r, g, b, a = 255) {
    setPixel(cx + x, y, r, g, b, a);
    setPixel(cx - x - 1, y, r, g, b, a);
  }

  function fillRectSym(cx, x, y, w, h, color, alpha = 255) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        setPixelSym(cx, x + dx, y + dy, color[0], color[1], color[2], alpha);
      }
    }
  }

  const cx = 32; // center x

  // Rarity glow aura
  if (glow) {
    const glowSize = robot.rarity === "legendary" ? 3 : 2;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.15) {
      for (let r = 28; r < 28 + glowSize; r++) {
        const gx = Math.round(cx + Math.cos(angle) * r);
        const gy = Math.round(32 + Math.sin(angle) * r);
        setPixel(gx, gy, glow[0], glow[1], glow[2], 100);
      }
    }
  }

  // Body shape depends on style
  if (robot.style === "blocky") {
    // Head
    fillRectSym(cx, 0, 14, 7, 10, primary);
    fillRectSym(cx, 1, 15, 5, 8, secondary);
    // Eyes
    fillRectSym(cx, 2, 18, 2, 2, accent);
    // Antenna
    fillRectSym(cx, 0, 10, 1, 4, accent);
    setPixelSym(cx, 0, 9, accent[0], accent[1], accent[2]);
    // Body
    fillRectSym(cx, 0, 24, 9, 14, primary);
    fillRectSym(cx, 1, 26, 7, 10, dark);
    // Core
    fillRectSym(cx, 0, 28, 3, 3, accent);
    // Arms
    fillRect(cx - 12, 26, 3, 10, secondary);
    fillRect(cx + 9, 26, 3, 10, secondary);
    // Hands
    fillRect(cx - 13, 34, 4, 3, primary);
    fillRect(cx + 9, 34, 4, 3, primary);
    // Legs
    fillRect(cx - 6, 38, 4, 10, secondary);
    fillRect(cx + 2, 38, 4, 10, secondary);
    // Feet
    fillRect(cx - 7, 46, 6, 3, dark);
    fillRect(cx + 1, 46, 6, 3, dark);

  } else if (robot.style === "round") {
    // Round/spherical body
    const r = 12;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= r) {
          const shade = dist < r * 0.6 ? primary : dist < r * 0.85 ? secondary : dark;
          setPixel(cx + dx, 28 + dy, shade[0], shade[1], shade[2]);
        }
      }
    }
    // Eye visor band
    for (let dx = -8; dx <= 8; dx++) {
      setPixel(cx + dx, 25, dark[0], dark[1], dark[2]);
      setPixel(cx + dx, 26, dark[0], dark[1], dark[2]);
    }
    // Eyes
    fillRect(cx - 6, 25, 3, 2, accent);
    fillRect(cx + 3, 25, 3, 2, accent);
    // Antenna
    setPixel(cx, 14, accent[0], accent[1], accent[2]);
    setPixel(cx, 15, accent[0], accent[1], accent[2]);
    setPixel(cx - 1, 13, accent[0], accent[1], accent[2]);
    setPixel(cx + 1, 13, accent[0], accent[1], accent[2]);
    // Small legs
    fillRect(cx - 5, 40, 3, 6, secondary);
    fillRect(cx + 2, 40, 3, 6, secondary);
    fillRect(cx - 6, 44, 5, 3, dark);
    fillRect(cx + 1, 44, 5, 3, dark);

  } else if (robot.style === "tall") {
    // Tall/slender robot
    // Head
    fillRectSym(cx, 0, 10, 5, 8, primary);
    fillRectSym(cx, 1, 11, 3, 6, secondary);
    // Eyes
    fillRectSym(cx, 1, 13, 2, 2, accent);
    // Neck
    fillRectSym(cx, 0, 18, 2, 3, dark);
    // Torso
    fillRectSym(cx, 0, 21, 6, 12, primary);
    fillRectSym(cx, 1, 23, 4, 8, dark);
    // Core
    fillRectSym(cx, 0, 25, 2, 3, accent);
    // Arms (thin)
    fillRect(cx - 9, 22, 2, 12, secondary);
    fillRect(cx + 7, 22, 2, 12, secondary);
    fillRect(cx - 10, 32, 3, 3, primary);
    fillRect(cx + 7, 32, 3, 3, primary);
    // Legs (long)
    fillRect(cx - 4, 33, 3, 14, secondary);
    fillRect(cx + 1, 33, 3, 14, secondary);
    fillRect(cx - 5, 45, 5, 3, dark);
    fillRect(cx + 0, 45, 5, 3, dark);

  } else if (robot.style === "wide") {
    // Wide/heavy/tank body
    // Head (small relative to body)
    fillRectSym(cx, 0, 14, 5, 7, primary);
    fillRectSym(cx, 1, 15, 3, 5, secondary);
    // Eyes
    fillRectSym(cx, 1, 17, 2, 2, accent);
    // Body (wide!)
    fillRectSym(cx, 0, 21, 13, 16, primary);
    fillRectSym(cx, 1, 23, 11, 12, dark);
    // Core
    fillRectSym(cx, 0, 27, 4, 4, accent);
    // Shoulder pads
    fillRect(cx - 15, 20, 4, 6, secondary);
    fillRect(cx + 11, 20, 4, 6, secondary);
    // Arms
    fillRect(cx - 15, 26, 3, 8, primary);
    fillRect(cx + 12, 26, 3, 8, primary);
    // Treads/legs
    fillRect(cx - 10, 37, 8, 8, secondary);
    fillRect(cx + 2, 37, 8, 8, secondary);
    fillRect(cx - 11, 39, 2, 6, dark);
    fillRect(cx + 9, 39, 2, 6, dark);

  } else if (robot.style === "quad") {
    // Quadruped (dog/cat/animal style)
    // Head
    fillRect(cx - 5, 14, 10, 8, primary);
    fillRect(cx - 4, 15, 8, 6, secondary);
    // Eyes
    fillRect(cx - 3, 17, 2, 2, accent);
    fillRect(cx + 1, 17, 2, 2, accent);
    // Ears
    fillRect(cx - 6, 11, 3, 4, primary);
    fillRect(cx + 3, 11, 3, 4, primary);
    // Nose
    setPixel(cx, 20, dark[0], dark[1], dark[2]);
    // Body (horizontal)
    fillRect(cx - 8, 22, 16, 10, primary);
    fillRect(cx - 6, 24, 12, 6, dark);
    // Tail
    fillRect(cx + 8, 20, 3, 2, accent);
    fillRect(cx + 10, 18, 2, 3, accent);
    // Legs (4)
    fillRect(cx - 7, 32, 3, 8, secondary);
    fillRect(cx - 3, 32, 3, 8, secondary);
    fillRect(cx + 1, 32, 3, 8, secondary);
    fillRect(cx + 5, 32, 3, 8, secondary);
    // Paws
    fillRect(cx - 8, 38, 4, 3, dark);
    fillRect(cx - 4, 38, 4, 3, dark);
    fillRect(cx + 0, 38, 4, 3, dark);
    fillRect(cx + 4, 38, 4, 3, dark);
  }

  // Add some random detail pixels based on seed
  for (let i = 0; i < 15; i++) {
    const dx = Math.floor(rng() * 30) - 15;
    const dy = Math.floor(rng() * 20) + 16;
    const x = cx + dx;
    const y = dy;
    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
      const idx = (y * SIZE + x) * 4;
      if (data[idx + 3] > 0) {
        // Only add detail on existing pixels
        const detailColor = rng() > 0.5 ? accent : secondary;
        setPixel(x, y, detailColor[0], detailColor[1], detailColor[2], 180);
      }
    }
  }

  return data;
}

async function main() {
  console.log("Local Robot Asset Generator (sharp)");
  console.log(`Generating ${ROBOTS.length} robots...\n`);

  let success = 0;

  for (const robot of ROBOTS) {
    const outputPath = path.resolve(
      __dirname,
      "..",
      `public/assets/robots/${robot.zone}/${robot.id}.png`
    );

    if (fs.existsSync(outputPath)) {
      console.log(`  Skipping ${robot.id} (already exists)`);
      success++;
      continue;
    }

    console.log(`  Generating ${robot.id}...`);
    const pixels = createRobotPixels(robot);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await sharp(pixels, { raw: { width: 64, height: 64, channels: 4 } })
      .png()
      .toFile(outputPath);

    console.log(`  Saved → public/assets/robots/${robot.zone}/${robot.id}.png`);
    success++;
  }

  console.log(`\nDone! ${success}/${ROBOTS.length} robots generated.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
