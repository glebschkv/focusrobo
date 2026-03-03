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
 * Starting with 5 for MVP, expanding to 25.
 */
export const PET_DATABASE: PetSpecies[] = [
  // Common (unlocked early)
  {
    id: 'bunny',
    name: 'Bunny',
    rarity: 'common',
    unlockLevel: 1,
    description: 'A fluffy little bunny that loves peaceful meadows.',
    imagePath: '/assets/pets/bunny.svg',
  },
  {
    id: 'chick',
    name: 'Chick',
    rarity: 'common',
    unlockLevel: 1,
    description: 'A cheerful baby chick always ready to explore.',
    imagePath: '/assets/pets/chick.svg',
  },
  {
    id: 'frog',
    name: 'Frog',
    rarity: 'common',
    unlockLevel: 2,
    description: 'A chill frog who thrives in calm environments.',
    imagePath: '/assets/pets/frog.svg',
  },

  // Uncommon
  {
    id: 'fox',
    name: 'Fox',
    rarity: 'uncommon',
    unlockLevel: 6,
    description: 'A clever fox with a keen sense of focus.',
    imagePath: '/assets/pets/fox.svg',
  },

  // Rare
  {
    id: 'deer',
    name: 'Deer',
    rarity: 'rare',
    unlockLevel: 13,
    description: 'A graceful deer that appears only to the dedicated.',
    imagePath: '/assets/pets/deer.svg',
  },
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
  baby: 0.4,
  adolescent: 0.7,
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
