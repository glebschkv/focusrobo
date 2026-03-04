/**
 * Pet Database
 *
 * Defines all pet species available in the game. Pets are earned
 * by completing focus sessions and placed on the user's land grid.
 *
 * Replaces the old RobotDatabase / AnimalDatabase.
 */

export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type GrowthSize = 'baby' | 'adolescent' | 'adult';

export interface PetSpecies {
  id: string;
  name: string;
  rarity: PetRarity;
  unlockLevel: number;
  description: string;
  imagePath: string;
}

/**
 * All pet species in the game.
 * 20 species across 5 rarities, unlocking as the player levels up.
 */
export const PET_DATABASE: PetSpecies[] = [
  // ── Common (8 species) ─────────────────────────────────
  { id: 'bunny', name: 'Bunny', rarity: 'common', unlockLevel: 0, description: 'A fluffy little bunny that loves peaceful meadows.', imagePath: '/assets/pets/bunny.png' },
  { id: 'chick', name: 'Chick', rarity: 'common', unlockLevel: 0, description: 'A cheerful baby chick always ready to explore.', imagePath: '/assets/pets/chick.png' },
  { id: 'frog', name: 'Frog', rarity: 'common', unlockLevel: 2, description: 'A chill frog who thrives in calm environments.', imagePath: '/assets/pets/frog.png' },
  { id: 'hamster', name: 'Hamster', rarity: 'common', unlockLevel: 3, description: 'A busy little hamster always on the go.', imagePath: '/assets/pets/hamster.png' },
  { id: 'duckling', name: 'Duckling', rarity: 'common', unlockLevel: 5, description: 'A wobbly duckling with big dreams.', imagePath: '/assets/pets/duckling.png' },
  { id: 'hedgehog', name: 'Hedgehog', rarity: 'common', unlockLevel: 7, description: 'A spiky friend who curls up during breaks.', imagePath: '/assets/pets/hedgehog.png' },
  { id: 'mouse', name: 'Mouse', rarity: 'common', unlockLevel: 10, description: 'A tiny mouse who nibbles through study notes.', imagePath: '/assets/pets/mouse.png' },
  { id: 'sparrow', name: 'Sparrow', rarity: 'common', unlockLevel: 14, description: 'A cheerful sparrow that sings during focus time.', imagePath: '/assets/pets/sparrow.png' },

  // ── Uncommon (5 species) ───────────────────────────────
  { id: 'fox', name: 'Fox', rarity: 'uncommon', unlockLevel: 4, description: 'A clever fox with a keen sense of focus.', imagePath: '/assets/pets/fox.png' },
  { id: 'cat', name: 'Cat', rarity: 'uncommon', unlockLevel: 8, description: 'A curious cat who watches over your work.', imagePath: '/assets/pets/cat.png' },
  { id: 'penguin', name: 'Penguin', rarity: 'uncommon', unlockLevel: 12, description: 'A determined penguin who never gives up.', imagePath: '/assets/pets/penguin.png' },
  { id: 'raccoon', name: 'Raccoon', rarity: 'uncommon', unlockLevel: 18, description: 'A crafty raccoon with nimble paws.', imagePath: '/assets/pets/raccoon.png' },
  { id: 'otter', name: 'Otter', rarity: 'uncommon', unlockLevel: 22, description: 'A playful otter who rewards your persistence.', imagePath: '/assets/pets/otter.png' },

  // ── Rare (4 species) ───────────────────────────────────
  { id: 'deer', name: 'Deer', rarity: 'rare', unlockLevel: 9, description: 'A graceful deer that appears only to the dedicated.', imagePath: '/assets/pets/deer.png' },
  { id: 'owl', name: 'Owl', rarity: 'rare', unlockLevel: 16, description: 'A wise owl that rewards late-night focus.', imagePath: '/assets/pets/owl.png' },
  { id: 'wolf', name: 'Wolf', rarity: 'rare', unlockLevel: 25, description: 'A loyal wolf drawn to focused discipline.', imagePath: '/assets/pets/wolf.png' },
  { id: 'crane', name: 'Crane', rarity: 'rare', unlockLevel: 32, description: 'An elegant crane symbolizing patience.', imagePath: '/assets/pets/crane.png' },

  // ── Epic (2 species) ───────────────────────────────────
  { id: 'dragon', name: 'Dragon', rarity: 'epic', unlockLevel: 20, description: 'A baby dragon forged by deep focus.', imagePath: '/assets/pets/dragon.png' },
  { id: 'phoenix', name: 'Phoenix', rarity: 'epic', unlockLevel: 35, description: 'A mythical bird reborn from streak flames.', imagePath: '/assets/pets/phoenix.png' },

  // ── Legendary (1 species) ──────────────────────────────
  { id: 'unicorn', name: 'Unicorn', rarity: 'legendary', unlockLevel: 40, description: 'The rarest pet — proof of legendary dedication.', imagePath: '/assets/pets/unicorn.png' },
];

/**
 * Rarity drop weights — determines probability of getting each rarity
 * when a pet is randomly selected after a focus session.
 */
export const RARITY_WEIGHTS: Record<PetRarity, number> = {
  common: 45,
  uncommon: 28,
  rare: 17,
  epic: 8,
  legendary: 2,
};

/**
 * CSS scale values for each growth size tier.
 */
export const GROWTH_SCALES: Record<GrowthSize, number> = {
  baby: 0.65,
  adolescent: 0.82,
  adult: 1.0,
};

/**
 * Rarity glow colors for CSS drop-shadow effects.
 */
export const RARITY_GLOW: Record<PetRarity, string | null> = {
  common: null,
  uncommon: 'rgba(255, 255, 255, 0.6)',
  rare: 'rgba(59, 130, 246, 0.7)',
  epic: 'rgba(168, 85, 247, 0.7)',
  legendary: 'rgba(234, 179, 8, 0.8)',
};

/**
 * Determine growth size from session duration in minutes.
 *
 * - Baby: 25-45 min sessions
 * - Adolescent: 60-90 min sessions
 * - Adult: 120+ min sessions
 */
export function getGrowthSize(sessionMinutes: number): GrowthSize {
  if (sessionMinutes >= 120) return 'adult';
  if (sessionMinutes >= 60) return 'adolescent';
  return 'baby';
}

// ============================================================================
// Helper Functions
// ============================================================================

/** Get a pet species by ID */
export function getPetById(id: string): PetSpecies | undefined {
  return PET_DATABASE.find(p => p.id === id);
}

/** Get all pets available at a given player level */
export function getAvailablePets(playerLevel: number): PetSpecies[] {
  return PET_DATABASE.filter(p => p.unlockLevel <= playerLevel);
}

/** Get pets filtered by rarity */
export function getPetsByRarity(rarity: PetRarity): PetSpecies[] {
  return PET_DATABASE.filter(p => p.rarity === rarity);
}

/**
 * Randomly select a pet species from the available pool,
 * weighted by rarity.
 */
export function rollRandomPet(playerLevel: number): PetSpecies {
  const pool = getAvailablePets(playerLevel);

  if (pool.length === 0) {
    // Fallback: return first pet if somehow nothing is available
    return PET_DATABASE[0];
  }

  // Group pool by rarity and calculate total weight
  const rarityGroups: Partial<Record<PetRarity, PetSpecies[]>> = {};
  for (const pet of pool) {
    if (!rarityGroups[pet.rarity]) {
      rarityGroups[pet.rarity] = [];
    }
    rarityGroups[pet.rarity]!.push(pet);
  }

  // Calculate total weight from available rarities only
  let totalWeight = 0;
  for (const rarity of Object.keys(rarityGroups) as PetRarity[]) {
    totalWeight += RARITY_WEIGHTS[rarity];
  }

  // Roll for rarity
  let roll = Math.random() * totalWeight;
  let selectedRarity: PetRarity = 'common';

  for (const rarity of Object.keys(rarityGroups) as PetRarity[]) {
    roll -= RARITY_WEIGHTS[rarity];
    if (roll <= 0) {
      selectedRarity = rarity;
      break;
    }
  }

  // Pick random pet from selected rarity group
  const group = rarityGroups[selectedRarity] || pool;
  const randomIndex = Math.floor(Math.random() * group.length);
  return group[randomIndex];
}
