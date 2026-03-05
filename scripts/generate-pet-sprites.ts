/**
 * Generate pixel art pet sprites with per-growth-stage variants using PixelLab API.
 *
 * Usage: npx tsx scripts/generate-pet-sprites.ts
 *
 * Generates baby, adolescent, and adult sprites for pets that support
 * per-growth art. Also creates a default species icon (copy of adolescent).
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://api.pixellab.ai/v2';
const API_KEY = '45feaaf6-8b0f-44ed-8edc-a0b31df2d2f6';
const OUTPUT_DIR = path.resolve('public/assets/pets');

// Read bunny sprite as style reference for consistent pixel art look
const STYLE_IMAGE_PATH = path.resolve('public/assets/pets/bunny.png');

interface GrowthSpriteConfig {
  filename: string;
  description: string;
  isDefault?: boolean; // If true, also copy as the base species icon
}

interface PetSpriteSet {
  petId: string;
  name: string;
  width: number;
  height: number;
  negativePrompt: string;
  variants: GrowthSpriteConfig[];
}

const PETS: PetSpriteSet[] = [
  {
    petId: 'polar-bear',
    name: 'Polar Bear',
    width: 48,
    height: 48,
    negativePrompt: 'humanoid, human, person, realistic, photorealistic, 3D, side view, background, text, watermark, blurry',
    variants: [
      {
        filename: 'polar-bear-baby.png',
        description: 'tiny cute baby polar bear cub, chibi pixel art, front-facing, sitting, very small round fluffy white body, tiny black eyes and nose, stubby paws, adorable, game collectible pet sprite',
      },
      {
        filename: 'polar-bear-adolescent.png',
        description: 'cute young polar bear, chibi pixel art, front-facing, standing, medium white fluffy body, curious expression, black eyes and nose, game collectible pet sprite',
        isDefault: true,
      },
      {
        filename: 'polar-bear-adult.png',
        description: 'majestic polar bear, chibi pixel art, front-facing, standing tall, large white fluffy body, confident expression, black eyes and nose, strong paws, game collectible pet sprite',
      },
    ],
  },
];

function imageToBase64(imagePath: string): string {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString('base64');
}

async function generateWithStyleReference(
  description: string,
  width: number,
  height: number,
  styleBase64: string,
): Promise<Buffer | null> {
  try {
    const response = await fetch(`${API_BASE}/generate-image-bitforge`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        image_size: { width, height },
        style_image: {
          type: 'base64',
          base64: styleBase64,
          format: 'png',
        },
        style_strength: 0.4,
        no_background: true,
        text_guidance_scale: 8.0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`  Bitforge error: ${response.status} - ${error}`);
      return null;
    }

    const result = await response.json();
    const base64 = result.data?.image?.base64 || result.image?.base64;
    if (!base64) {
      console.error(`  No image data in bitforge response`);
      return null;
    }

    return Buffer.from(base64, 'base64');
  } catch (error) {
    console.error(`  Bitforge failed: ${error}`);
    return null;
  }
}

async function generateWithPixflux(
  description: string,
  width: number,
  height: number,
): Promise<Buffer | null> {
  try {
    const response = await fetch(`${API_BASE}/generate-image-pixflux`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        image_size: { width, height },
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
      console.error(`  No image data in pixflux response`);
      return null;
    }

    return Buffer.from(base64, 'base64');
  } catch (error) {
    console.error(`  Pixflux failed: ${error}`);
    return null;
  }
}

async function main() {
  console.log('PixelLab Pet Sprite Generator');
  console.log('=============================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let styleBase64 = '';
  if (fs.existsSync(STYLE_IMAGE_PATH)) {
    styleBase64 = imageToBase64(STYLE_IMAGE_PATH);
    console.log('Loaded style reference: bunny.png\n');
  } else {
    console.log('Warning: No style reference found, using pixflux only\n');
  }

  let successCount = 0;
  let failCount = 0;

  for (const pet of PETS) {
    console.log(`\n--- ${pet.name} ---`);

    for (const variant of pet.variants) {
      const outputPath = path.join(OUTPUT_DIR, variant.filename);

      if (fs.existsSync(outputPath)) {
        console.log(`Skipping ${variant.filename} (already exists)`);
        successCount++;

        // Still copy default if needed
        if (variant.isDefault) {
          const defaultPath = path.join(OUTPUT_DIR, `${pet.petId}.png`);
          if (!fs.existsSync(defaultPath)) {
            fs.copyFileSync(outputPath, defaultPath);
            console.log(`  Copied as ${pet.petId}.png (default icon)`);
          }
        }
        continue;
      }

      console.log(`Generating ${variant.filename}...`);

      let buffer: Buffer | null = null;

      if (styleBase64) {
        buffer = await generateWithStyleReference(variant.description, pet.width, pet.height, styleBase64);
      }

      if (!buffer) {
        console.log(`  Trying pixflux fallback...`);
        buffer = await generateWithPixflux(variant.description, pet.width, pet.height);
      }

      if (buffer) {
        fs.writeFileSync(outputPath, buffer);
        console.log(`  ✓ Saved ${variant.filename}`);
        successCount++;

        if (variant.isDefault) {
          const defaultPath = path.join(OUTPUT_DIR, `${pet.petId}.png`);
          fs.copyFileSync(outputPath, defaultPath);
          console.log(`  Copied as ${pet.petId}.png (default icon)`);
        }
      } else {
        console.error(`  ✗ Failed to generate ${variant.filename}`);
        failCount++;
      }

      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  console.log(`\n=== Done! ===`);
  console.log(`Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);
