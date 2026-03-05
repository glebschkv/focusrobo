/**
 * Egg Data
 *
 * Defines purchasable eggs that hatch into pets with weighted rarity pools.
 * Eggs are the primary coin sink — they make coins valuable and drive engagement.
 */

import type { PetRarity } from './PetDatabase';

export interface EggType {
  id: string;
  name: string;
  description: string;
  coinPrice: number;
  icon: string;
  /** Rarity of the egg item itself (for UI styling) */
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  /** Weighted probability table for pet rarity when hatching */
  rarityWeights: Record<PetRarity, number>;
}

/**
 * All available egg types, ordered by price.
 * Weights don't need to sum to 100 — they're relative.
 */
export const EGG_TYPES: EggType[] = [
  {
    id: 'egg-common',
    name: 'Common Egg',
    description: 'A simple egg. Mostly common pets, but you might get lucky!',
    coinPrice: 100,
    icon: 'egg',
    rarity: 'common',
    rarityWeights: {
      common: 80,
      uncommon: 15,
      rare: 5,
      epic: 0,
      legendary: 0,
    },
  },
  {
    id: 'egg-rare',
    name: 'Rare Egg',
    description: 'A shimmering egg with better odds of uncommon and rare pets.',
    coinPrice: 400,
    icon: 'egg',
    rarity: 'rare',
    rarityWeights: {
      common: 40,
      uncommon: 35,
      rare: 20,
      epic: 5,
      legendary: 0,
    },
  },
  {
    id: 'egg-epic',
    name: 'Epic Egg',
    description: 'A glowing egg pulsing with energy. High chance of rare and epic pets!',
    coinPrice: 1200,
    icon: 'egg',
    rarity: 'epic',
    rarityWeights: {
      common: 0,
      uncommon: 15,
      rare: 40,
      epic: 35,
      legendary: 10,
    },
  },
  {
    id: 'egg-legendary',
    name: 'Legendary Egg',
    description: 'A radiant golden egg. The best chance at legendary companions.',
    coinPrice: 3000,
    icon: 'egg',
    rarity: 'legendary',
    rarityWeights: {
      common: 0,
      uncommon: 0,
      rare: 20,
      epic: 40,
      legendary: 40,
    },
  },
];

/** Get an egg type by ID */
export function getEggById(id: string): EggType | undefined {
  return EGG_TYPES.find(e => e.id === id);
}

/** Daily free egg cooldown key */
export const FREE_EGG_STORAGE_KEY = 'nomo_free_egg_last_claimed';

/** Check if the daily free egg is available */
export function isDailyFreeEggAvailable(): boolean {
  try {
    const last = localStorage.getItem(FREE_EGG_STORAGE_KEY);
    if (!last) return true;
    const lastDate = new Date(parseInt(last, 10));
    const now = new Date();
    return lastDate.toDateString() !== now.toDateString();
  } catch {
    return true;
  }
}

/** Mark the daily free egg as claimed */
export function claimDailyFreeEgg(): void {
  try {
    localStorage.setItem(FREE_EGG_STORAGE_KEY, Date.now().toString());
  } catch {
    // ignore storage errors
  }
}
