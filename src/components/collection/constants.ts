/**
 * Collection page constants — rarity visuals, labels, shared mappings.
 * All colors reference shared CSS design tokens from base.css.
 */

import type { PetRarity } from '@/data/PetDatabase';

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
