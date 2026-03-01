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

export const BUILDINGS: BuildingConfig[] = [
  {
    id: 'cottage',
    name: 'Starter Cottage',
    unlockLevel: 0,
    x: 45,   // % from left
    y: 25,   // % from top
    width: 64,
    height: 64,
    imagePath: '/assets/pixel-world/buildings/cottage.png',
  },
  {
    id: 'bakery',
    name: 'Bakery',
    unlockLevel: 3,
    x: 15,
    y: 35,
    width: 56,
    height: 56,
    imagePath: '/assets/pixel-world/buildings/bakery.png',
  },
  {
    id: 'forge',
    name: 'Forge',
    unlockLevel: 5,
    x: 72,
    y: 40,
    width: 56,
    height: 56,
    imagePath: '/assets/pixel-world/buildings/forge.png',
  },
  {
    id: 'fishing-dock',
    name: 'Fishing Dock',
    unlockLevel: 7,
    x: 10,
    y: 60,
    width: 48,
    height: 40,
    imagePath: '/assets/pixel-world/buildings/fishing-dock.png',
  },
  {
    id: 'tower',
    name: 'Wizard Tower',
    unlockLevel: 10,
    x: 70,
    y: 15,
    width: 48,
    height: 72,
    imagePath: '/assets/pixel-world/buildings/tower.png',
  },
  {
    id: 'town-square',
    name: 'Town Square',
    unlockLevel: 20,
    x: 40,
    y: 55,
    width: 72,
    height: 48,
    imagePath: '/assets/pixel-world/buildings/town-square.png',
  },
];

// ── Walkable areas per building neighborhood ───────────────────────

export const VILLAGE_AREAS: VillageAreaConfig[] = [
  {
    id: 'cottage',
    walkable: { minX: 25, maxX: 75, minY: 30, maxY: 50 },
    spawnPoints: [
      { x: 40, y: 40 },
      { x: 55, y: 38 },
      { x: 50, y: 45 },
    ],
  },
  {
    id: 'bakery',
    walkable: { minX: 5, maxX: 40, minY: 35, maxY: 55 },
    spawnPoints: [
      { x: 20, y: 45 },
      { x: 30, y: 50 },
    ],
  },
  {
    id: 'forge',
    walkable: { minX: 55, maxX: 90, minY: 38, maxY: 58 },
    spawnPoints: [
      { x: 70, y: 48 },
      { x: 80, y: 52 },
    ],
  },
  {
    id: 'fishing-dock',
    walkable: { minX: 5, maxX: 35, minY: 58, maxY: 78 },
    spawnPoints: [
      { x: 15, y: 68 },
      { x: 25, y: 72 },
    ],
  },
  {
    id: 'tower',
    walkable: { minX: 55, maxX: 90, minY: 12, maxY: 35 },
    spawnPoints: [
      { x: 75, y: 25 },
      { x: 65, y: 20 },
    ],
  },
  {
    id: 'town-square',
    walkable: { minX: 20, maxX: 80, minY: 55, maxY: 80 },
    spawnPoints: [
      { x: 45, y: 65 },
      { x: 55, y: 70 },
      { x: 35, y: 68 },
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
