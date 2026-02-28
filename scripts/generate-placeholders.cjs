#!/usr/bin/env node
/**
 * Generate placeholder robot PNG images using pure SVG → data URI approach.
 * Creates a simple colored robot silhouette for each bot in the database.
 * These are temporary — real AI-generated art comes later via PixelLab.
 */

const fs = require('fs');
const path = require('path');

const ZONES = {
  'assembly-line': { color: '#3b82f6', bg: '#1e3a5f', label: 'AL' },
  'workshop': { color: '#22c55e', bg: '#1a3d2a', label: 'WK' },
  'stealth-lab': { color: '#8b5cf6', bg: '#2d1f4e', label: 'SL' },
  'biotech-zone': { color: '#10b981', bg: '#1a3d35', label: 'BZ' },
  'solar-fields': { color: '#f59e0b', bg: '#3d3010', label: 'SF' },
  'cyber-district': { color: '#06b6d4', bg: '#0d2f38', label: 'CD' },
};

const RARITY_BORDERS = {
  common: '#6b7280',
  rare: '#60a5fa',
  epic: '#a855f7',
  legendary: '#fbbf24',
};

const ROBOTS = [
  // Assembly Line
  { id: 'bolt-bot', zone: 'assembly-line', rarity: 'common' },
  { id: 'gear-pup', zone: 'assembly-line', rarity: 'common' },
  { id: 'rivet', zone: 'assembly-line', rarity: 'common' },
  { id: 'spark-welder', zone: 'assembly-line', rarity: 'rare' },
  // Workshop
  { id: 'wrench-bot', zone: 'workshop', rarity: 'common' },
  { id: 'cog-roller', zone: 'workshop', rarity: 'common' },
  { id: 'chrome-cat', zone: 'workshop', rarity: 'rare' },
  { id: 'piston', zone: 'workshop', rarity: 'rare' },
  // Stealth Lab
  { id: 'shadow-drone', zone: 'stealth-lab', rarity: 'common' },
  { id: 'neon-phantom', zone: 'stealth-lab', rarity: 'rare' },
  { id: 'cipher', zone: 'stealth-lab', rarity: 'epic' },
  // Biotech Zone
  { id: 'moss-mech', zone: 'biotech-zone', rarity: 'common' },
  { id: 'spore-bot', zone: 'biotech-zone', rarity: 'rare' },
  { id: 'vine-walker', zone: 'biotech-zone', rarity: 'epic' },
  // Solar Fields
  { id: 'sun-charger', zone: 'solar-fields', rarity: 'common' },
  { id: 'prism-bot', zone: 'solar-fields', rarity: 'rare' },
  { id: 'nova', zone: 'solar-fields', rarity: 'epic' },
  // Cyber District
  { id: 'neon-sentinel', zone: 'cyber-district', rarity: 'rare' },
  { id: 'quantum-core', zone: 'cyber-district', rarity: 'epic' },
  { id: 'omega-prime', zone: 'cyber-district', rarity: 'legendary' },
  // Shop exclusives
  { id: 'turbo-tank', zone: 'assembly-line', rarity: 'rare' },
  { id: 'plasma-pup', zone: 'workshop', rarity: 'epic' },
  { id: 'stealth-owl', zone: 'stealth-lab', rarity: 'epic' },
  // Study hours
  { id: 'iron-scholar', zone: 'workshop', rarity: 'rare' },
  { id: 'focus-titan', zone: 'cyber-district', rarity: 'legendary' },
];

function generateSVG(robot) {
  const zone = ZONES[robot.zone];
  const borderColor = RARITY_BORDERS[robot.rarity];
  const name = robot.id.replace(/-/g, ' ').toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${zone.bg}"/>
      <stop offset="100%" stop-color="#0a0a1a"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="128" height="128" rx="12" fill="url(#bg)" stroke="${borderColor}" stroke-width="3"/>
  <!-- Robot body -->
  <rect x="42" y="38" width="44" height="50" rx="6" fill="${zone.color}" opacity="0.3" stroke="${zone.color}" stroke-width="2"/>
  <!-- Robot head -->
  <rect x="38" y="20" width="52" height="24" rx="8" fill="${zone.color}" opacity="0.4" stroke="${zone.color}" stroke-width="2"/>
  <!-- Eyes -->
  <circle cx="52" cy="32" r="4" fill="${zone.color}"/>
  <circle cx="76" cy="32" r="4" fill="${zone.color}"/>
  <!-- Antenna -->
  <line x1="64" y1="20" x2="64" y2="12" stroke="${zone.color}" stroke-width="2"/>
  <circle cx="64" cy="10" r="3" fill="${zone.color}"/>
  <!-- Arms -->
  <rect x="28" y="42" width="14" height="6" rx="3" fill="${zone.color}" opacity="0.3" stroke="${zone.color}" stroke-width="1.5"/>
  <rect x="86" y="42" width="14" height="6" rx="3" fill="${zone.color}" opacity="0.3" stroke="${zone.color}" stroke-width="1.5"/>
  <!-- Legs -->
  <rect x="48" y="88" width="12" height="20" rx="4" fill="${zone.color}" opacity="0.3" stroke="${zone.color}" stroke-width="1.5"/>
  <rect x="68" y="88" width="12" height="20" rx="4" fill="${zone.color}" opacity="0.3" stroke="${zone.color}" stroke-width="1.5"/>
  <!-- Zone label -->
  <text x="64" y="122" text-anchor="middle" font-family="monospace" font-size="8" fill="${zone.color}" opacity="0.6">${zone.label}</text>
</svg>`;
}

const outputDir = path.join(__dirname, '..', 'public', 'assets', 'robots');

let count = 0;
for (const robot of ROBOTS) {
  const svg = generateSVG(robot);
  const dir = path.join(outputDir, robot.zone);

  // Write SVG file (browsers can display SVG directly)
  const filePath = path.join(dir, `${robot.id}.svg`);
  fs.writeFileSync(filePath, svg);
  count++;
}

console.log(`Generated ${count} placeholder robot SVGs in public/assets/robots/`);
