/**
 * Archipelago Island Definitions
 *
 * Defines the roster of themed islands in the archipelago system.
 * Each island has its own biome, unlock requirements, cost, and completion bonus.
 */

export type CompletionBonusType = 'coins' | 'coinRate' | 'streakFreeze' | 'xpBoost' | 'passiveCoins' | 'eggDiscount';

export interface CompletionBonus {
  type: CompletionBonusType;
  value: number;
  label: string;
}

export interface ArchipelagoIslandDef {
  id: string;
  name: string;
  /** Island theme ID — maps to ISLAND_THEMES */
  biome: string;
  /** Player level required to unlock (0 = no requirement) */
  unlockLevel: number;
  /** Coin cost to purchase (0 = free) */
  coinCost: number;
  /** Whether completing the previous island also unlocks this one */
  unlockedByPrevious: boolean;
  /** Whether this island requires premium subscription */
  premiumOnly: boolean;
  /** Bonus granted when this island is fully completed */
  completionBonus: CompletionBonus | null;
  /** Short description shown in the unlock modal */
  description: string;
  /** Emoji icon for the island switcher */
  icon: string;
}

export const ARCHIPELAGO_ISLANDS: ArchipelagoIslandDef[] = [
  {
    id: 'home',
    name: 'Home Island',
    biome: 'day',
    unlockLevel: 0,
    coinCost: 0,
    unlockedByPrevious: false,
    premiumOnly: false,
    completionBonus: null,
    description: 'Your first island. A peaceful meadow to start your journey.',
    icon: '🏡',
  },
  {
    id: 'coral-reef',
    name: 'Coral Reef',
    biome: 'beach',
    unlockLevel: 10,
    coinCost: 2000,
    unlockedByPrevious: true,
    premiumOnly: false,
    completionBonus: {
      type: 'coinRate',
      value: 10,
      label: '+10% coin rate',
    },
    description: 'A tropical paradise where ocean meets sand.',
    icon: '🏖️',
  },
  {
    id: 'snow-peak',
    name: 'Snow Peak',
    biome: 'snow',
    unlockLevel: 18,
    coinCost: 5000,
    unlockedByPrevious: false,
    premiumOnly: false,
    completionBonus: {
      type: 'streakFreeze',
      value: 1,
      label: '+1 streak freeze/month',
    },
    description: 'A frosty mountain peak dusted with eternal snow.',
    icon: '❄️',
  },
  {
    id: 'desert-oasis',
    name: 'Desert Oasis',
    biome: 'desert',
    unlockLevel: 25,
    coinCost: 8000,
    unlockedByPrevious: false,
    premiumOnly: false,
    completionBonus: {
      type: 'xpBoost',
      value: 15,
      label: '+15% XP rate',
    },
    description: 'A hidden oasis blooming in the golden sands.',
    icon: '🏜️',
  },
  {
    id: 'moonlit-garden',
    name: 'Moonlit Garden',
    biome: 'night',
    unlockLevel: 32,
    coinCost: 12000,
    unlockedByPrevious: false,
    premiumOnly: false,
    completionBonus: {
      type: 'passiveCoins',
      value: 5,
      label: '+5 daily passive coins',
    },
    description: 'A mystical garden that glows under the moonlight.',
    icon: '🌙',
  },
  {
    id: 'sakura-valley',
    name: 'Sakura Valley',
    biome: 'sakura',
    unlockLevel: 40,
    coinCost: 15000,
    unlockedByPrevious: false,
    premiumOnly: false,
    completionBonus: {
      type: 'eggDiscount',
      value: 25,
      label: '25% egg discount',
    },
    description: 'A serene valley where cherry blossoms bloom eternally.',
    icon: '🌸',
  },
];

/** Get island definition by ID */
export function getIslandDef(id: string): ArchipelagoIslandDef | undefined {
  return ARCHIPELAGO_ISLANDS.find(i => i.id === id);
}

/** Check if an island can be unlocked given player state */
export function canUnlockIsland(
  def: ArchipelagoIslandDef,
  playerLevel: number,
  coinBalance: number,
  previousIslandComplete: boolean,
  isPremium: boolean,
): boolean {
  if (def.premiumOnly && !isPremium) return false;
  if (def.coinCost > coinBalance) return false;

  // Level requirement
  const meetsLevel = playerLevel >= def.unlockLevel;

  // Previous island completion also unlocks
  if (def.unlockedByPrevious && previousIslandComplete) return true;

  return meetsLevel;
}
