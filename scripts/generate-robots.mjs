#!/usr/bin/env node
/**
 * Generate pixel art robot assets via PixelLab API.
 *
 * Usage:
 *   PIXELLAB_KEY=45feaaf6-8b0f-44ed-8edc-a0b31df2d2f6 node scripts/generate-robots.mjs
 *
 * Generates high-quality pixel art PNGs for all robots.
 * Run this locally (not in sandbox) — requires network access to api.pixellab.ai
 */
import https from 'https';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.PIXELLAB_KEY || '45feaaf6-8b0f-44ed-8edc-a0b31df2d2f6';

const ROBOTS = [
  {
    name: 'bolt-bot',
    zone: 'assembly-line',
    prompt: 'cute chibi pixel art robot, small friendly blue industrial robot, round dome head with big glowing cyan eyes, small antenna with glowing tip, compact square torso with power core on chest, stubby mechanical arms with wrench hands, short legs with tank treads, happy expression, front facing, clean pixel art game sprite',
  },
  {
    name: 'omega-prime',
    zone: 'cyber-district',
    prompt: 'epic imposing cyberpunk mech warrior pixel art, tall dark chrome armored robot, angular helmet with glowing cyan visor slit, heavy black and cyan armor with neon energy lines, large energy cannon on left arm, holographic shield on right arm, glowing reactor core on chest, powerful stance, front facing, detailed pixel art game sprite, legendary boss character',
  },
];

function apiRequest(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.pixellab.ai',
      path: '/v1/generate-image-pixflux',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(raw));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

for (const robot of ROBOTS) {
  console.log(`Generating ${robot.name}...`);
  try {
    const res = await apiRequest({
      description: robot.prompt,
      image_size: { width: 128, height: 128 },
      negative_description: 'ugly, blurry, deformed, low quality, text, watermark, background',
      text_guidance_scale: 8.0,
      no_background: true,
      outline: 'single color black outline',
      shading: 'detailed shading',
      detail: 'high detail',
    });

    const b64 = res.image?.b64 || res.image?.base64;
    if (b64) {
      const out = path.resolve(`public/assets/robots/${robot.zone}/${robot.name}.png`);
      fs.writeFileSync(out, Buffer.from(b64, 'base64'));
      console.log(`  Saved: ${out}`);
    } else {
      console.log(`  Unexpected response:`, JSON.stringify(res).slice(0, 200));
    }
  } catch (e) {
    console.error(`  Error: ${e.message}`);
  }
}

console.log('Done! Update RobotDatabase.ts imagePaths from .svg to .png for generated robots.');
