/**
 * Shop Design Tokens — Centralized color and rarity definitions.
 * All rarity-related color maps consolidated here for consistency.
 */

/* Rarity gradient colors (Tailwind classes for gradients) */
export const RARITY_COLORS = {
  common: "from-[#A0937E] to-[#8B6F47]",
  rare: "from-[#5B8FB9] to-[#4A7A9E]",
  epic: "from-[#9B72CF] to-[#7E5CAE]",
  legendary: "from-[#D4A040] to-[#C87941]",
};

/* Rarity background colors (Tailwind classes) */
export const RARITY_BG = {
  common: "bg-[#F5EFE0]",
  rare: "bg-[#EEF4FA]",
  epic: "bg-[#F4EFF8]",
  legendary: "bg-[#FFF8EE]",
};

/* Rarity border colors (Tailwind classes) */
export const RARITY_BORDER = {
  common: "border-[#D4C4A0]",
  rare: "border-[#5B8FB9]/40",
  epic: "border-[#9B72CF]/40",
  legendary: "border-[#D4A040]/40",
};

/* Rarity glow shadows (Tailwind classes) */
export const RARITY_GLOW = {
  common: "",
  rare: "shadow-[#5B8FB9]/20",
  epic: "shadow-[#9B72CF]/20",
  legendary: "shadow-[#D4A040]/30",
};

/* Rarity badge background colors (hex for inline styles) */
export const RARITY_BADGE_COLORS: Record<string, string> = {
  common: '#8B6F47',
  uncommon: '#6B9E58',
  rare: '#5B8FB9',
  epic: '#9B72CF',
  legendary: '#D4A040',
};

/* Rarity dot/accent colors (hex for inline styles) */
export const RARITY_DOT_COLORS: Record<string, string> = {
  common: '#A0937E',
  uncommon: '#6B9E58',
  rare: '#5B8FB9',
  epic: '#9B72CF',
  legendary: '#E8B84B',
};

/* Rarity strip Tailwind bg classes for egg cards */
export const RARITY_STRIP_COLORS: Record<string, string> = {
  common: 'bg-[#C9B896]',
  uncommon: 'bg-[#6B9E58]',
  rare: 'bg-[#5B8FB9]',
  epic: 'bg-[#9B72CF]',
  legendary: 'bg-[#E8B84B]',
};

/* Egg card rarity CSS class modifiers */
export const RARITY_CARD_CLASS: Record<string, string> = {
  common: '',
  uncommon: '',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
};
