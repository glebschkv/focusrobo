#!/usr/bin/env node

/**
 * Generate pixel art robot assets using the Pixel Lab API.
 *
 * Usage:
 *   PIXELLAB_API_KEY=<key> node scripts/generate-robot-assets.cjs
 *
 * Or pass the key as the first argument:
 *   node scripts/generate-robot-assets.cjs <key>
 */

const fs = require("fs");
const path = require("path");

const API_KEY = process.argv[2] || process.env.PIXELLAB_API_KEY;
if (!API_KEY) {
  console.error(
    "Error: Provide a Pixel Lab API key via PIXELLAB_API_KEY env var or as the first argument."
  );
  process.exit(1);
}

const BASE_URL = "https://api.pixellab.ai/v1";

const ROBOTS = [
  {
    name: "Bolt Bot",
    outputPath: "public/assets/robots/assembly-line/bolt-bot.png",
    description:
      "powerful industrial mech robot, heavy blue steel armor plating, glowing electric blue visor eyes, bolt-shaped antenna crackling with energy, reinforced chassis with exposed hydraulics, strong mechanical arms, imposing stance, front facing view, detailed pixel art game character",
    negativeDescription: "blurry, realistic, text, watermark, cute, chibi, cartoon",
    seed: 42,
  },
  {
    name: "Omega Prime",
    outputPath: "public/assets/robots/cyber-district/omega-prime.png",
    description:
      "ultimate legendary mech warrior, towering armored titan, golden crown fused into helmet, blazing cyan neon energy armor, massive shoulder pauldrons, glowing plasma core in chest, heavy battle gauntlets radiating power, cyberpunk neon accents, menacing visor, front facing view, detailed pixel art boss character, final boss energy",
    negativeDescription:
      "blurry, realistic, text, watermark, cute, chibi, cartoon, small",
    seed: 77,
  },
];

async function generateRobot(robot) {
  console.log(`Generating ${robot.name}...`);

  const body = {
    description: robot.description,
    negative_description: robot.negativeDescription,
    image_size: { width: 64, height: 64 },
    no_background: true,
    text_guidance_scale: 10,
    seed: robot.seed,
  };

  const res = await fetch(`${BASE_URL}/generate-image-pixflux`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status} for ${robot.name}: ${text}`);
  }

  const data = await res.json();

  // The API returns base64-encoded image data
  const imageData = data.image.b64;
  if (!imageData) {
    throw new Error(
      `No image data in response for ${robot.name}. Keys: ${Object.keys(data).join(", ")}`
    );
  }

  const outputPath = path.resolve(__dirname, "..", robot.outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));

  const cost = data.usage?.usd ? `$${data.usage.usd.toFixed(4)}` : "unknown";
  console.log(`  Saved to ${robot.outputPath} (cost: ${cost})`);
}

async function main() {
  console.log("Pixel Lab Robot Asset Generator");
  console.log("================================\n");

  for (const robot of ROBOTS) {
    try {
      await generateRobot(robot);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
      // If the response format is different, dump what we got for debugging
      console.error("  Try checking the API docs for the current response format.");
    }
  }

  console.log("\nDone! Now update RobotDatabase.ts image paths from .svg to .png.");
}

main();
