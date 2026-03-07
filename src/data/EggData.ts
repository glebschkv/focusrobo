/**
 * Egg Data
 *
 * Defines egg types purchasable in the shop. Each egg has custom rarity
 * weights that override the default drop rates when hatching a pet.
 */

import type { PetRarity } from '@/data/PetDatabase';

export interface EggType {
  id: string;
  name: string;
  description: string;
  coinPrice: number;
  rarityWeights: Record<PetRarity, number>;
  icon: string;
  rarity: PetRarity; // Visual rarity tier for card styling
}

export const EGG_TYPES: EggType[] = [
  {
    id: 'egg-common',
    name: 'Common Egg',
    description: 'A simple egg. Mostly common pets, but surprises happen!',
    coinPrice: 150,
    rarityWeights: { common: 80, uncommon: 15, rare: 5, epic: 0, legendary: 0 },
    icon: 'egg',
    rarity: 'common',
  },
  {
    id: 'egg-rare',
    name: 'Rare Egg',
    description: 'A spotted egg with better odds for uncommon and rare pets.',
    coinPrice: 600,
    rarityWeights: { common: 40, uncommon: 35, rare: 20, epic: 5, legendary: 0 },
    icon: 'egg-rare',
    rarity: 'rare',
  },
  {
    id: 'egg-epic',
    name: 'Epic Egg',
    description: 'A glowing egg. High chance of rare and epic pets!',
    coinPrice: 1800,
    rarityWeights: { common: 0, uncommon: 15, rare: 40, epic: 35, legendary: 10 },
    icon: 'egg-epic',
    rarity: 'epic',
  },
  {
    id: 'egg-legendary',
    name: 'Legendary Egg',
    description: 'A golden egg radiating power. Epic and legendary pets await!',
    coinPrice: 4500,
    rarityWeights: { common: 0, uncommon: 0, rare: 20, epic: 40, legendary: 40 },
    icon: 'egg-legendary',
    rarity: 'legendary',
  },
];

export const SPECIES_SELECTOR_DISCOVERED_PRICE = 5000;
export const SPECIES_SELECTOR_UNDISCOVERED_PRICE = 8000;

export function getEggById(id: string): EggType | undefined {
  return EGG_TYPES.find(e => e.id === id);
}
