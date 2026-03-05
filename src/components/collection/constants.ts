/**
 * Collection page constants — rarity visuals, labels, shared mappings.
 * All colors reference CSS custom properties from base.css (--col-*).
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
 *  Structural styles (card bg, border, text) use --col-* tokens. */
export const RARITY_ACCENT: Record<PetRarity, {
  dot: string;
  label: string;
  cardBg: string;
  cardBorder: string;
}> = {
  common: {
    dot: 'bg-[hsl(var(--col-subtle))]',
    label: 'text-[hsl(var(--col-muted))]',
    cardBg: 'bg-[hsl(var(--col-card))]',
    cardBorder: 'border-[hsl(var(--col-border))]',
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
