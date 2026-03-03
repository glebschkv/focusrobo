/**
 * Village layout configuration.
 * Defines buildings, walkable areas, character data, and map dimensions.
 */

// ── Types ──────────────────────────────────────────────────────────

export interface WalkableArea {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface BuildingConfig {
  id: string;
  name: string;
  unlockLevel: number;
  /** Position as % of map dimensions */
  x: number;
  y: number;
  width: number;
  height: number;
  imagePath: string;
}

export interface VillageCharacterConfig {
  id: string;
  name: string;
  unlockLevel: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  spriteSheet: string;
  /** Which building/area this character hangs around */
  areaId: string;
}

export interface VillageAreaConfig {
  id: string;
  walkable: WalkableArea;
  spawnPoints: { x: number; y: number }[];
}

// ── Map dimensions ─────────────────────────────────────────────────

/** The village map native resolution (CSS pixels before scaling) */
export const MAP_WIDTH = 390;
export const MAP_HEIGHT = 600;

/** Pixel art native resolution (scaled up to MAP_WIDTH/HEIGHT) */
export const NATIVE_WIDTH = 195;
export const NATIVE_HEIGHT = 300;

// ── Buildings ──────────────────────────────────────────────────────

/** All buildings use PixelLab-generated high-detail pixel art assets. */
export const BUILDINGS: BuildingConfig[] = [
  {
    id: 'cottage',
    name: 'Starter Cottage',
    unlockLevel: 0,
    x: 45,
    y: 25,
    width: 96,    // PixelLab 96×96
    height: 96,
    imagePath: '/assets/pixel-world/buildings/cottage.png',
  },
  {
    id: 'bakery',
    name: 'Bakery',
    unlockLevel: 3,
    x: 15,
    y: 35,
    width: 80,    // PixelLab 80×80
    height: 80,
    imagePath: '/assets/pixel-world/buildings/bakery.png',
  },
  {
    id: 'forge',
    name: 'Forge',
    unlockLevel: 5,
    x: 75,
    y: 40,
    width: 80,    // PixelLab 80×96
    height: 96,
    imagePath: '/assets/pixel-world/buildings/forge.png',
  },
  {
    id: 'fishing-dock',
    name: 'Fishing Dock',
    unlockLevel: 7,
    x: 12,
    y: 60,
    width: 96,    // PixelLab 96×80
    height: 80,
    imagePath: '/assets/pixel-world/buildings/fishing-dock.png',
  },
  {
    id: 'tower',
    name: 'Wizard Tower',
    unlockLevel: 10,
    x: 72,
    y: 15,
    width: 64,    // PixelLab 64×112
    height: 112,
    imagePath: '/assets/pixel-world/buildings/tower.png',
  },
  {
    id: 'town-square',
    name: 'Town Square',
    unlockLevel: 20,
    x: 42,
    y: 55,
    width: 112,   // PixelLab 112×112
    height: 112,
    imagePath: '/assets/pixel-world/buildings/town-square.png',
  },
];

// ── Walkable areas per building neighborhood ───────────────────────

export const VILLAGE_AREAS: VillageAreaConfig[] = [
  {
    id: 'cottage',
    walkable: { minX: 28, maxX: 62, minY: 30, maxY: 44 },
    spawnPoints: [
      { x: 40, y: 36 },
      { x: 52, y: 34 },
    ],
  },
  {
    id: 'bakery',
    walkable: { minX: 5, maxX: 30, minY: 40, maxY: 52 },
    spawnPoints: [
      { x: 14, y: 45 },
      { x: 22, y: 48 },
    ],
  },
  {
    id: 'forge',
    walkable: { minX: 60, maxX: 92, minY: 44, maxY: 56 },
    spawnPoints: [
      { x: 74, y: 50 },
      { x: 84, y: 48 },
    ],
  },
  {
    id: 'fishing-dock',
    walkable: { minX: 8, maxX: 35, minY: 63, maxY: 75 },
    spawnPoints: [
      { x: 16, y: 68 },
      { x: 26, y: 70 },
    ],
  },
  {
    id: 'tower',
    walkable: { minX: 58, maxX: 90, minY: 18, maxY: 30 },
    spawnPoints: [
      { x: 70, y: 24 },
      { x: 80, y: 22 },
    ],
  },
  {
    id: 'town-square',
    walkable: { minX: 25, maxX: 65, minY: 62, maxY: 78 },
    spawnPoints: [
      { x: 42, y: 68 },
      { x: 55, y: 72 },
    ],
  },
];

// ── Trial NPC Characters ───────────────────────────────────────────

export const VILLAGE_CHARACTERS: VillageCharacterConfig[] = [
  {
    id: 'farmer',
    name: 'Farmer',
    unlockLevel: 1,
    rarity: 'common',
    description: 'A friendly farmer who tends the village garden.',
    spriteSheet: '/assets/pixel-world/sprites/farmer.png',
    areaId: 'cottage',
  },
  {
    id: 'baker',
    name: 'Baker',
    unlockLevel: 3,
    rarity: 'common',
    description: 'Bakes the coziest bread in the village.',
    spriteSheet: '/assets/pixel-world/sprites/baker.png',
    areaId: 'bakery',
  },
  {
    id: 'blacksmith',
    name: 'Blacksmith',
    unlockLevel: 5,
    rarity: 'rare',
    description: 'Forges tools and trinkets at the village forge.',
    spriteSheet: '/assets/pixel-world/sprites/blacksmith.png',
    areaId: 'forge',
  },
  {
    id: 'fisher',
    name: 'Fisher',
    unlockLevel: 7,
    rarity: 'rare',
    description: 'Spends peaceful days by the dock, rod in hand.',
    spriteSheet: '/assets/pixel-world/sprites/fisher.png',
    areaId: 'fishing-dock',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    unlockLevel: 10,
    rarity: 'epic',
    description: 'Studies ancient tomes in the tower above.',
    spriteSheet: '/assets/pixel-world/sprites/wizard.png',
    areaId: 'tower',
  },
];

// ── Helpers ────────────────────────────────────────────────────────

export function getUnlockedBuildings(level: number): BuildingConfig[] {
  return BUILDINGS.filter(b => b.unlockLevel <= level);
}

export function getUnlockedCharacters(level: number): VillageCharacterConfig[] {
  return VILLAGE_CHARACTERS.filter(c => c.unlockLevel <= level);
}

export function getAreaForCharacter(characterId: string): VillageAreaConfig | undefined {
  const char = VILLAGE_CHARACTERS.find(c => c.id === characterId);
  if (!char) return undefined;
  return VILLAGE_AREAS.find(a => a.id === char.areaId);
}
