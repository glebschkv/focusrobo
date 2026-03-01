/**
 * Assembles individual PixelLab character frames into a 6×4 sprite sheet.
 *
 * Layout: 6 columns × 4 rows of 32×32 frames = 192×128 pixels
 *   Cols 0-3: walk frames, Cols 4-5: idle frames
 *   Row 0: south (down), Row 1: west (left), Row 2: east (right), Row 3: north (up)
 *
 * Usage: node scripts/assemble-spritesheet.mjs <character_name> <frames_dir> <output_path>
 * Or import assembleSpriteSheet() programmatically.
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const FRAME = 32;
const COLS = 6;
const ROWS = 4;

// PixelLab direction names → our row order
const DIRECTIONS = ['south', 'west', 'east', 'north'];

/**
 * Assembles a sprite sheet from individual frame PNGs.
 * @param {string} framesDir - Directory containing individual frame PNGs
 * @param {string} outputPath - Where to save the assembled sprite sheet
 * @param {object} options - Optional overrides
 * @param {number} options.frameSize - Frame size in pixels (default 32)
 * @param {string[]} options.walkPattern - Filenames for walk frames per direction
 * @param {string[]} options.idlePattern - Filenames for idle frames per direction
 */
export async function assembleSpriteSheet(framesDir, outputPath, options = {}) {
  const frameSize = options.frameSize || FRAME;
  const width = COLS * frameSize;
  const height = ROWS * frameSize;

  // Create transparent canvas
  const canvas = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const composites = [];

  for (let row = 0; row < ROWS; row++) {
    const dir = DIRECTIONS[row];

    // Walk frames (cols 0-3)
    for (let col = 0; col < 4; col++) {
      const candidates = [
        `walk_${dir}_${col}.png`,
        `walk-${dir}-${col}.png`,
        `${dir}_walk_${col}.png`,
        `walking_${dir}_${col}.png`,
      ];
      const framePath = findFrame(framesDir, candidates);
      if (framePath) {
        composites.push({
          input: await resizeFrame(framePath, frameSize),
          left: col * frameSize,
          top: row * frameSize,
        });
      } else {
        console.warn(`  Missing walk frame: ${dir} col ${col}`);
      }
    }

    // Idle frames (cols 4-5)
    for (let col = 0; col < 2; col++) {
      const candidates = [
        `idle_${dir}_${col}.png`,
        `idle-${dir}-${col}.png`,
        `${dir}_idle_${col}.png`,
        `breathing-idle_${dir}_${col}.png`,
        `breathing_idle_${dir}_${col}.png`,
      ];
      const framePath = findFrame(framesDir, candidates);
      if (framePath) {
        composites.push({
          input: await resizeFrame(framePath, frameSize),
          left: (4 + col) * frameSize,
          top: row * frameSize,
        });
      } else {
        console.warn(`  Missing idle frame: ${dir} col ${col}`);
      }
    }
  }

  if (composites.length === 0) {
    throw new Error(`No frames found in ${framesDir}`);
  }

  // Ensure output directory exists
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  await canvas.composite(composites).png().toFile(outputPath);
  console.log(`✓ Assembled ${composites.length}/${COLS * ROWS} frames → ${outputPath}`);
}

function findFrame(dir, candidates) {
  for (const name of candidates) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function resizeFrame(framePath, targetSize) {
  const meta = await sharp(framePath).metadata();
  if (meta.width !== targetSize || meta.height !== targetSize) {
    return await sharp(framePath)
      .resize(targetSize, targetSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  }
  return framePath;
}

// CLI entry point
if (process.argv[2]) {
  const [, , name, framesDir, outputPath] = process.argv;
  if (!framesDir || !outputPath) {
    console.error('Usage: node assemble-spritesheet.mjs <name> <frames_dir> <output_path>');
    process.exit(1);
  }
  assembleSpriteSheet(framesDir, outputPath)
    .then(() => console.log(`Done: ${name}`))
    .catch((err) => {
      console.error(`Failed: ${err.message}`);
      process.exit(1);
    });
}
