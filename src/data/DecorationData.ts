/**
 * Decoration Data
 *
 * Defines all island decoration items that players can buy and place on tiles.
 * Each decoration occupies one grid cell (same as pets).
 */

export type DecorationCategory = 'trees' | 'flowers' | 'rocks' | 'water' | 'structures' | 'fun';

export interface DecorationDef {
  id: string;
  name: string;
  category: DecorationCategory;
  description: string;
  coinPrice: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  sprite: string;
  unlockLevel: number;
  /** Whether the decoration should have a gentle sway animation */
  sways: boolean;
}

export const DECORATIONS: DecorationDef[] = [
  // ── Trees ──────────────────────────────────────────────────────────
  {
    id: 'oak-tree',
    name: 'Oak Tree',
    category: 'trees',
    description: 'A sturdy little oak with golden-green leaves.',
    coinPrice: 200,
    rarity: 'common',
    sprite: '/assets/decorations/oak-tree.png',
    unlockLevel: 0,
    sways: true,
  },
  {
    id: 'pine-tree',
    name: 'Pine Tree',
    category: 'trees',
    description: 'An evergreen that brings a forest feel.',
    coinPrice: 200,
    rarity: 'common',
    sprite: '/assets/decorations/pine-tree.png',
    unlockLevel: 0,
    sways: true,
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    category: 'trees',
    description: 'Delicate pink petals drift in the breeze.',
    coinPrice: 350,
    rarity: 'rare',
    sprite: '/assets/decorations/cherry-blossom.png',
    unlockLevel: 10,
    sways: true,
  },
  {
    id: 'palm-tree',
    name: 'Palm Tree',
    category: 'trees',
    description: 'Tropical vibes for your island paradise.',
    coinPrice: 300,
    rarity: 'uncommon',
    sprite: '/assets/decorations/palm-tree.png',
    unlockLevel: 5,
    sways: true,
  },

  // ── Flowers ────────────────────────────────────────────────────────
  {
    id: 'sunflower-patch',
    name: 'Sunflower Patch',
    category: 'flowers',
    description: 'A cheerful cluster of sunflowers.',
    coinPrice: 100,
    rarity: 'common',
    sprite: '/assets/decorations/sunflower-patch.png',
    unlockLevel: 0,
    sways: true,
  },
  {
    id: 'rose-bush',
    name: 'Rose Bush',
    category: 'flowers',
    description: 'Elegant roses in full bloom.',
    coinPrice: 150,
    rarity: 'uncommon',
    sprite: '/assets/decorations/rose-bush.png',
    unlockLevel: 3,
    sways: true,
  },
  {
    id: 'tulip-bed',
    name: 'Tulip Bed',
    category: 'flowers',
    description: 'A colorful row of tulips.',
    coinPrice: 120,
    rarity: 'common',
    sprite: '/assets/decorations/tulip-bed.png',
    unlockLevel: 0,
    sways: true,
  },
  {
    id: 'mushroom-cluster',
    name: 'Mushroom Cluster',
    category: 'flowers',
    description: 'Cute toadstools in a cozy cluster.',
    coinPrice: 80,
    rarity: 'common',
    sprite: '/assets/decorations/mushroom-cluster.png',
    unlockLevel: 0,
    sways: false,
  },

  // ── Rocks ──────────────────────────────────────────────────────────
  {
    id: 'boulder',
    name: 'Boulder',
    category: 'rocks',
    description: 'A mossy boulder that adds character.',
    coinPrice: 100,
    rarity: 'common',
    sprite: '/assets/decorations/boulder.png',
    unlockLevel: 0,
    sways: false,
  },
  {
    id: 'crystal',
    name: 'Crystal',
    category: 'rocks',
    description: 'A glimmering crystal formation.',
    coinPrice: 250,
    rarity: 'rare',
    sprite: '/assets/decorations/crystal.png',
    unlockLevel: 8,
    sways: false,
  },
  {
    id: 'mossy-rock',
    name: 'Mossy Rock',
    category: 'rocks',
    description: 'An ancient rock covered in soft green moss.',
    coinPrice: 120,
    rarity: 'common',
    sprite: '/assets/decorations/mossy-rock.png',
    unlockLevel: 0,
    sways: false,
  },

  // ── Water ──────────────────────────────────────────────────────────
  {
    id: 'small-pond',
    name: 'Small Pond',
    category: 'water',
    description: 'A tranquil little pond with lily pads.',
    coinPrice: 400,
    rarity: 'rare',
    sprite: '/assets/decorations/small-pond.png',
    unlockLevel: 6,
    sways: false,
  },
  {
    id: 'fountain',
    name: 'Fountain',
    category: 'water',
    description: 'A charming stone fountain with gentle splashing.',
    coinPrice: 500,
    rarity: 'epic',
    sprite: '/assets/decorations/fountain.png',
    unlockLevel: 15,
    sways: false,
  },
  {
    id: 'well',
    name: 'Wishing Well',
    category: 'water',
    description: 'Toss a coin and make a wish!',
    coinPrice: 350,
    rarity: 'uncommon',
    sprite: '/assets/decorations/well.png',
    unlockLevel: 8,
    sways: false,
  },

  // ── Structures ─────────────────────────────────────────────────────
  {
    id: 'wooden-fence',
    name: 'Wooden Fence',
    category: 'structures',
    description: 'A quaint little picket fence section.',
    coinPrice: 150,
    rarity: 'common',
    sprite: '/assets/decorations/wooden-fence.png',
    unlockLevel: 0,
    sways: false,
  },
  {
    id: 'lamp-post',
    name: 'Lamp Post',
    category: 'structures',
    description: 'A warm glowing lamp post.',
    coinPrice: 250,
    rarity: 'uncommon',
    sprite: '/assets/decorations/lamp-post.png',
    unlockLevel: 5,
    sways: false,
  },
  {
    id: 'bench',
    name: 'Park Bench',
    category: 'structures',
    description: 'A cozy spot for your pets to rest.',
    coinPrice: 200,
    rarity: 'common',
    sprite: '/assets/decorations/bench.png',
    unlockLevel: 2,
    sways: false,
  },
  {
    id: 'mailbox',
    name: 'Mailbox',
    category: 'structures',
    description: 'A cute mailbox with a little red flag.',
    coinPrice: 180,
    rarity: 'common',
    sprite: '/assets/decorations/mailbox.png',
    unlockLevel: 0,
    sways: false,
  },

  // ── Fun ────────────────────────────────────────────────────────────
  {
    id: 'signpost',
    name: 'Signpost',
    category: 'fun',
    description: 'A wooden signpost pointing to adventure.',
    coinPrice: 150,
    rarity: 'common',
    sprite: '/assets/decorations/signpost.png',
    unlockLevel: 0,
    sways: false,
  },
  {
    id: 'treasure-chest',
    name: 'Treasure Chest',
    category: 'fun',
    description: 'A mysterious chest overflowing with gold.',
    coinPrice: 400,
    rarity: 'epic',
    sprite: '/assets/decorations/treasure-chest.png',
    unlockLevel: 12,
    sways: false,
  },
];

/** Lookup decoration by ID */
export function getDecorationById(id: string): DecorationDef | undefined {
  return DECORATIONS.find(d => d.id === id);
}

/** Get all decorations available at a given player level */
export function getUnlockedDecorations(playerLevel: number): DecorationDef[] {
  return DECORATIONS.filter(d => d.unlockLevel <= playerLevel);
}

/** Get decorations grouped by category */
export function getDecorationsByCategory(): Record<DecorationCategory, DecorationDef[]> {
  const grouped: Record<DecorationCategory, DecorationDef[]> = {
    trees: [],
    flowers: [],
    rocks: [],
    water: [],
    structures: [],
    fun: [],
  };
  for (const d of DECORATIONS) {
    grouped[d.category].push(d);
  }
  return grouped;
}
