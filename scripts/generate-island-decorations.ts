/**
 * Generate pixel art decoration assets for the floating island using PixelLab API.
 *
 * Usage: npx tsx scripts/generate-island-decorations.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://api.pixellab.ai/v2';
const API_KEY = '45feaaf6-8b0f-44ed-8edc-a0b31df2d2f6';
const OUTPUT_DIR = path.resolve('public/assets/island');

// Read bunny sprite as style reference
const STYLE_IMAGE_PATH = path.resolve('public/assets/pets/bunny.png');

interface AssetConfig {
  filename: string;
  description: string;
  width: number;
  height: number;
}

const ASSETS: AssetConfig[] = [
  {
    filename: 'tree-pine.png',
    description: 'small cute pixel art pine evergreen tree, green triangle foliage layers, brown trunk, front view, game asset, simple clean design',
    width: 32,
    height: 32,
  },
  {
    filename: 'tree-round.png',
    description: 'small cute pixel art round deciduous tree, lush green round canopy, brown trunk, front view, game asset, simple clean design',
    width: 32,
    height: 32,
  },
  {
    filename: 'bush-green.png',
    description: 'small cute pixel art green bush shrub, round leafy shape, dark and light green leaves, front view, game asset',
    width: 32,
    height: 32,
  },
  {
    filename: 'bush-flower.png',
    description: 'small cute pixel art flowering bush with tiny pink flowers among green leaves, round shape, front view, game asset',
    width: 32,
    height: 32,
  },
  {
    filename: 'flowers-pink.png',
    description: 'tiny cute pixel art pink flower cluster, 3 small flowers with green stems, front view, game asset, simple',
    width: 32,
    height: 32,
  },
  {
    filename: 'flowers-yellow.png',
    description: 'tiny cute pixel art yellow flower cluster, 3 small sunflowers with green stems, front view, game asset, simple',
    width: 32,
    height: 32,
  },
  {
    filename: 'flowers-purple.png',
    description: 'tiny cute pixel art purple lavender flower cluster, small flowers with green stems, front view, game asset, simple',
    width: 32,
    height: 32,
  },
  {
    filename: 'rock-large.png',
    description: 'small cute pixel art grey rock boulder, moss on top, rounded shape with flat bottom, front view, game asset',
    width: 32,
    height: 32,
  },
  {
    filename: 'rock-small.png',
    description: 'tiny cute pixel art small grey stone pebble, simple rounded shape, front view, game asset',
    width: 32,
    height: 32,
  },
  {
    filename: 'fence-segment.png',
    description: 'small cute pixel art wooden fence segment, 3 posts with horizontal rails, light brown wood, front view, game asset',
    width: 48,
    height: 32,
  },
  {
    filename: 'pond.png',
    description: 'small cute pixel art pond puddle, blue water, tiny green lily pad, oval shape, top-down view, game asset',
    width: 32,
    height: 32,
  },
  {
    filename: 'grass-tuft.png',
    description: 'tiny cute pixel art grass tuft, 3-4 green grass blades, simple, front view, game asset',
    width: 16,
    height: 16,
  },
];

function imageToBase64(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

async function generateWithStyleReference(asset: AssetConfig, styleBase64: string): Promise<Buffer | null> {
  console.log(`Generating ${asset.filename}...`);

  try {
    const response = await fetch(`${API_BASE}/generate-image-bitforge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: asset.description,
        image_size: { width: asset.width, height: asset.height },
        style_image: {
          type: 'base64',
          base64: styleBase64,
          format: 'png',
        },
        style_strength: 0.4,
        no_background: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  Error: ${response.status} - ${error}`);
      // Fall back to pixflux if bitforge fails
      return generateWithPixflux(asset);
    }

    const result = await response.json();
    const base64 = result.data?.image?.base64 || result.image?.base64;
    if (!base64) {
      console.error(`  No image data in response for ${asset.filename}`);
      return generateWithPixflux(asset);
    }

    console.log(`  ✓ Generated ${asset.filename} (bitforge)`);
    return Buffer.from(base64, 'base64');
  } catch (error) {
    console.error(`  Failed: ${error}`);
    return generateWithPixflux(asset);
  }
}

async function generateWithPixflux(asset: AssetConfig): Promise<Buffer | null> {
  console.log(`  Trying pixflux fallback for ${asset.filename}...`);

  try {
    const response = await fetch(`${API_BASE}/generate-image-pixflux`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: asset.description,
        image_size: { width: asset.width, height: asset.height },
        no_background: true,
        text_guidance_scale: 8.0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  Pixflux error: ${response.status} - ${error}`);
      return null;
    }

    const result = await response.json();
    const base64 = result.data?.image?.base64 || result.image?.base64;
    if (!base64) {
      console.error(`  No image data in pixflux response for ${asset.filename}`);
      return null;
    }

    console.log(`  ✓ Generated ${asset.filename} (pixflux)`);
    return Buffer.from(base64, 'base64');
  } catch (error) {
    console.error(`  Pixflux failed: ${error}`);
    return null;
  }
}

async function main() {
  console.log('PixelLab Island Decoration Generator');
  console.log('====================================\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load style reference image
  let styleBase64 = '';
  if (fs.existsSync(STYLE_IMAGE_PATH)) {
    styleBase64 = imageToBase64(STYLE_IMAGE_PATH);
    console.log('Loaded style reference: bunny.png\n');
  } else {
    console.log('Warning: No style reference found, using pixflux only\n');
  }

  let successCount = 0;
  let failCount = 0;

  for (const asset of ASSETS) {
    const outputPath = path.join(OUTPUT_DIR, asset.filename);

    // Skip if already generated
    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${asset.filename} (already exists)`);
      successCount++;
      continue;
    }

    let buffer: Buffer | null = null;

    if (styleBase64) {
      buffer = await generateWithStyleReference(asset, styleBase64);
    } else {
      buffer = await generateWithPixflux(asset);
    }

    if (buffer) {
      fs.writeFileSync(outputPath, buffer);
      successCount++;
    } else {
      failCount++;
    }

    // Small delay between API calls to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n=== Done! ===`);
  console.log(`Success: ${successCount}/${ASSETS.length}`);
  if (failCount > 0) {
    console.log(`Failed: ${failCount}/${ASSETS.length}`);
  }
}

main().catch(console.error);
