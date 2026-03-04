/**
 * Generate pixel art pet sprites using PixelLab API.
 *
 * Usage: npx tsx scripts/generate-pet-sprites.ts [petId]
 *
 * Generates baby, adolescent, and adult growth-stage sprites for a pet species.
 * Uses bitforge with bunny.png as style reference, pixflux as fallback.
 *
 * Examples:
 *   npx tsx scripts/generate-pet-sprites.ts penguin
 *   npx tsx scripts/generate-pet-sprites.ts          # generates all defined pets
 */

import * as fs from 'fs';
import * as path from 'path';

const API_BASE = 'https://api.pixellab.ai/v2';
const API_KEY = '45feaaf6-8b0f-44ed-8edc-a0b31df2d2f6';
const OUTPUT_DIR = path.resolve('public/assets/pets');
const STYLE_IMAGE_PATH = path.resolve('public/assets/pets/bunny.png');

interface GrowthVariant {
  suffix: string; // e.g. 'baby', 'adolescent', 'adult'
  description: string;
}

interface PetConfig {
  id: string;
  variants: GrowthVariant[];
}

const PETS: Record<string, PetConfig> = {
  penguin: {
    id: 'penguin',
    variants: [
      {
        suffix: 'baby',
        description:
          'tiny cute baby penguin chick, chibi pixel art, front-facing, sitting, very small round fluffy body, soft grey downy feathers, tiny flippers, small orange beak, adorable big eyes, game collectible pet sprite',
      },
      {
        suffix: 'adolescent',
        description:
          'cute young penguin, chibi pixel art, front-facing, standing, medium body, black and white plumage, small flippers at sides, orange beak and feet, friendly expression, game collectible pet sprite',
      },
      {
        suffix: 'adult',
        description:
          'majestic adult penguin, chibi pixel art, front-facing, standing tall, full black and white tuxedo plumage, proud posture, orange beak and feet, confident expression, game collectible pet sprite',
      },
    ],
  },
};

const NEGATIVE_PROMPT =
  'humanoid, human, person, realistic, photorealistic, 3D, side view, background, text, watermark, blurry, ugly';
const IMAGE_SIZE = { width: 48, height: 48 };
const STYLE_STRENGTH = 0.4;
const TEXT_GUIDANCE_SCALE = 8.0;

function imageToBase64(imagePath: string): string {
  return fs.readFileSync(imagePath).toString('base64');
}

async function generateWithBitforge(
  description: string,
  styleBase64: string
): Promise<Buffer | null> {
  try {
    const response = await fetch(`${API_BASE}/generate-image-bitforge`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        negative_description: NEGATIVE_PROMPT,
        image_size: IMAGE_SIZE,
        style_image: {
          type: 'base64',
          base64: styleBase64,
          format: 'png',
        },
        style_strength: STYLE_STRENGTH,
        no_background: true,
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
      console.error('  No image data in bitforge response');
      return null;
    }

    return Buffer.from(base64, 'base64');
  } catch (error) {
    console.error(`  Bitforge failed: ${error}`);
    return null;
  }
}

async function generateWithPixflux(description: string): Promise<Buffer | null> {
  try {
    const response = await fetch(`${API_BASE}/generate-image-pixflux`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        negative_description: NEGATIVE_PROMPT,
        image_size: IMAGE_SIZE,
        no_background: true,
        text_guidance_scale: TEXT_GUIDANCE_SCALE,
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
      console.error('  No image data in pixflux response');
      return null;
    }

    return Buffer.from(base64, 'base64');
  } catch (error) {
    console.error(`  Pixflux failed: ${error}`);
    return null;
  }
}

async function generateSprite(
  description: string,
  outputPath: string,
  styleBase64: string
): Promise<boolean> {
  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`  Skipping ${path.basename(outputPath)} (already exists)`);
    return true;
  }

  // Try bitforge first (style-consistent), then pixflux fallback
  let buffer: Buffer | null = null;

  if (styleBase64) {
    console.log(`  Generating with bitforge...`);
    buffer = await generateWithBitforge(description, styleBase64);
  }

  if (!buffer) {
    console.log(`  Trying pixflux fallback...`);
    buffer = await generateWithPixflux(description);
  }

  if (buffer) {
    fs.writeFileSync(outputPath, buffer);
    console.log(`  ✓ Saved ${path.basename(outputPath)} (${buffer.length} bytes)`);
    return true;
  }

  console.error(`  ✗ Failed to generate ${path.basename(outputPath)}`);
  return false;
}

async function generatePet(petConfig: PetConfig, styleBase64: string): Promise<void> {
  console.log(`\n=== Generating ${petConfig.id} ===`);

  let successCount = 0;

  for (const variant of petConfig.variants) {
    const filename = `${petConfig.id}-${variant.suffix}.png`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    console.log(`\n${filename}:`);
    console.log(`  Prompt: "${variant.description.slice(0, 80)}..."`);

    const success = await generateSprite(variant.description, outputPath, styleBase64);
    if (success) successCount++;

    // Rate limit delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  // Copy adolescent as the default species icon
  const defaultSrc = path.join(OUTPUT_DIR, `${petConfig.id}-adolescent.png`);
  const defaultDst = path.join(OUTPUT_DIR, `${petConfig.id}.png`);
  if (fs.existsSync(defaultSrc)) {
    fs.copyFileSync(defaultSrc, defaultDst);
    console.log(`\n✓ Copied adolescent → ${petConfig.id}.png (default icon)`);
  }

  console.log(`\n${petConfig.id}: ${successCount}/${petConfig.variants.length} variants generated`);
}

async function main(): Promise<void> {
  console.log('PixelLab Pet Sprite Generator');
  console.log('=============================\n');

  // Load style reference
  let styleBase64 = '';
  if (fs.existsSync(STYLE_IMAGE_PATH)) {
    styleBase64 = imageToBase64(STYLE_IMAGE_PATH);
    console.log(`Style reference: ${path.basename(STYLE_IMAGE_PATH)}`);
  } else {
    console.log('Warning: No style reference found, using pixflux only');
  }

  // Determine which pets to generate
  const targetPet = process.argv[2];
  const petsToGenerate = targetPet
    ? { [targetPet]: PETS[targetPet] }
    : PETS;

  for (const [id, config] of Object.entries(petsToGenerate)) {
    if (!config) {
      console.error(`Unknown pet: ${id}`);
      continue;
    }
    await generatePet(config, styleBase64);
  }

  console.log('\n=== Done! ===');
}

main().catch(console.error);
