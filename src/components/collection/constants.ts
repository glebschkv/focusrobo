/**
 * Collection page constants — rarity visuals, labels, shared mappings.
 * All colors reference shared CSS design tokens from base.css.
 */

import type { PetRarity, GrowthSize } from '@/data/PetDatabase';

export const RARITY_ORDER: PetRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const RARITY_LABEL: Record<PetRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

/** Rarity accent colors — only the bits that genuinely vary per rarity.
 *  Structural styles (card bg, border, text) use shared design tokens. */
export const RARITY_ACCENT: Record<PetRarity, {
  dot: string;
  label: string;
  cardBg: string;
  cardBorder: string;
}> = {
  common: {
    dot: 'bg-[hsl(var(--muted-foreground))]',
    label: 'text-[hsl(var(--muted-foreground))]',
    cardBg: 'bg-[hsl(var(--card))]',
    cardBorder: 'border-[hsl(var(--border))]',
  },
  uncommon: {
    dot: 'bg-emerald-500',
    label: 'text-emerald-600',
    cardBg: 'bg-emerald-50/60',
    cardBorder: 'border-emerald-200',
  },
  rare: {
    dot: 'bg-sky-500',
    label: 'text-sky-600',
    cardBg: 'bg-sky-50/60',
    cardBorder: 'border-sky-200',
  },
  epic: {
    dot: 'bg-violet-500',
    label: 'text-violet-600',
    cardBg: 'bg-violet-50/60',
    cardBorder: 'border-violet-200',
  },
  legendary: {
    dot: 'bg-amber-500',
    label: 'text-amber-600',
    cardBg: 'bg-amber-50/60',
    cardBorder: 'border-amber-200',
  },
};

export const SIZE_LABEL: Record<string, string> = {
  baby: 'Baby',
  adolescent: 'Teen',
  adult: 'Adult',
};

export const SIZE_ORDER: GrowthSize[] = ['baby', 'adolescent', 'adult'];

export const SIZE_DURATION_HINT: Record<string, string> = {
  baby: '25-45 min',
  adolescent: '60-90 min',
  adult: '120+ min',
};

/** Canonical hex colors for each rarity — use these everywhere instead of
 *  defining local copies. Matches the PetDatabase RARITY_COLORS.tooltip values. */
export const RARITY_HEX: Record<PetRarity, string> = {
  common: '#9E9E9E',
  uncommon: '#66BB6A',
  rare: '#42A5F5',
  epic: '#AB47BC',
  legendary: '#FFA726',
};

/** Rarity star counts (1-5) for display */
export const RARITY_STARS: Record<PetRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

/** Affinity system — levels, colors, descriptions */
export const AFFINITY_THRESHOLDS = [
  { level: 'familiar' as const, count: 3 },
  { level: 'bonded' as const, count: 5 },
  { level: 'devoted' as const, count: 10 },
];

export type AffinityLevel = 'none' | 'familiar' | 'bonded' | 'devoted';

export const AFFINITY_INFO: Record<AffinityLevel, { label: string; color: string; description: string }> = {
  none: { label: 'New', color: '#9E9E9E', description: 'Find 3 to become familiar' },
  familiar: { label: 'Familiar', color: '#66BB6A', description: 'Find 5 total to bond' },
  bonded: { label: 'Bonded', color: '#42A5F5', description: 'Can grow babies to teen! Find 10 to devote' },
  devoted: { label: 'Devoted', color: '#AB47BC', description: 'Can grow any pet to adult!' },
};
