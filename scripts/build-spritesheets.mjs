/**
 * Builds 192x128 sprite sheets from PixelLab rotation images.
 *
 * Creates walk cycle by applying 1px vertical bob offsets to the static frame,
 * and idle cycle with a subtle breathing effect (1px shift on alternating frames).
 *
 * Layout: 6 cols × 4 rows (each cell 32×32)
 *   Cols 0-3: walk frames (bob: 0, -1, 0, +1 px)
 *   Cols 4-5: idle frames (0, -1 px)
 *   Row 0: south (down), Row 1: west (left), Row 2: east (right), Row 3: north (up)
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const FRAME = 32;
const COLS = 6;
const ROWS = 4;
const SHEET_W = COLS * FRAME; // 192
const SHEET_H = ROWS * FRAME; // 128

// PixelLab directions → sprite sheet row order
const DIR_MAP = [
  'south', // row 0 = down
  'west',  // row 1 = left
  'east',  // row 2 = right
  'north', // row 3 = up
];

// Walk bob offsets (y-pixels) per frame to simulate walk cycle
const WALK_OFFSETS = [0, -1, 0, 1];
// Idle bob offsets
const IDLE_OFFSETS = [0, -1];

async function makeOffsetFrame(inputPath, yOffset) {
  // Read the source frame
  const src = sharp(inputPath);
  const { width, height } = await src.metadata();

  if (yOffset === 0) {
    return await sharp(inputPath).resize(FRAME, FRAME, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    }).png().toBuffer();
  }

  // Create a transparent canvas and composite the frame with offset
  const canvas = sharp({
    create: {
      width: FRAME,
      height: FRAME,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const resized = await sharp(inputPath).resize(FRAME, FRAME, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  }).png().toBuffer();

  // Extract the portion that fits after offset
  const top = Math.max(0, yOffset);
  const extractTop = Math.max(0, -yOffset);
  const extractHeight = FRAME - Math.abs(yOffset);

  const cropped = await sharp(resized)
    .extract({ left: 0, top: extractTop, width: FRAME, height: extractHeight })
    .png()
    .toBuffer();

  return await canvas
    .composite([{ input: cropped, left: 0, top }])
    .png()
    .toBuffer();
}

async function buildSheet(characterName, inputDir, outputPath) {
  console.log(`Building sprite sheet for ${characterName}...`);

  const composites = [];

  for (let row = 0; row < ROWS; row++) {
    const dir = DIR_MAP[row];
    const framePath = path.join(inputDir, `${dir}.png`);

    if (!fs.existsSync(framePath)) {
      console.warn(`  MISSING: ${framePath}`);
      continue;
    }

    // Walk frames (cols 0-3)
    for (let col = 0; col < 4; col++) {
      const buf = await makeOffsetFrame(framePath, WALK_OFFSETS[col]);
      composites.push({
        input: buf,
        left: col * FRAME,
        top: row * FRAME,
      });
    }

    // Idle frames (cols 4-5)
    for (let col = 0; col < 2; col++) {
      const buf = await makeOffsetFrame(framePath, IDLE_OFFSETS[col]);
      composites.push({
        input: buf,
        left: (4 + col) * FRAME,
        top: row * FRAME,
      });
    }
  }

  // Create transparent canvas
  const canvas = sharp({
    create: {
      width: SHEET_W,
      height: SHEET_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  await canvas.composite(composites).png().toFile(outputPath);
  console.log(`  ✓ ${outputPath} (${SHEET_W}×${SHEET_H})`);
}

// ── Main ──────────────────────────────────────────────────────────

const characters = [
  { name: 'farmer', dir: 'tmp/farmer', out: 'public/assets/pixel-world/sprites/farmer.png' },
  { name: 'baker', dir: 'tmp/baker', out: 'public/assets/pixel-world/sprites/baker.png' },
  { name: 'blacksmith', dir: 'tmp/blacksmith', out: 'public/assets/pixel-world/sprites/blacksmith.png' },
];

// Check for fisher/wizard dirs too
for (const extra of ['fisher', 'wizard']) {
  const d = `tmp/${extra}`;
  if (fs.existsSync(d) && fs.readdirSync(d).length >= 4) {
    characters.push({
      name: extra,
      dir: d,
      out: `public/assets/pixel-world/sprites/${extra}.png`,
    });
  }
}

(async () => {
  for (const { name, dir, out } of characters) {
    await buildSheet(name, dir, out);
  }
  console.log('\nDone! Built sprite sheets for:', characters.map(c => c.name).join(', '));
})();
