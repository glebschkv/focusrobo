// Gamification Types — Simplified (battle pass, boss challenges, lucky wheel, combo, guilds removed)

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE CELEBRATIONS
// ═══════════════════════════════════════════════════════════════════════════

export type MilestoneType = 'level' | 'streak' | 'sessions' | 'focus_hours' | 'collection' | 'achievement';

export type CelebrationType = 'confetti' | 'fireworks' | 'stars' | 'rainbow';

export interface MilestoneRewards {
  xp?: number;
  coins?: number;
  badge?: string;
}

export interface Milestone {
  id: string;
  type: MilestoneType;
  threshold: number;
  title: string;
  description: string;
  icon: string;
  celebrationType: CelebrationType;
  rewards?: MilestoneRewards;
}
