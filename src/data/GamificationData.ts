/**
 * Gamification Data — Simplified
 *
 * Contains data for milestone celebrations only.
 * Battle pass, boss challenges, special events, lucky wheel, combo system,
 * and guild system have been removed.
 */

import type { Milestone } from '@/types/gamification';

// Re-export types for consumers
export type { Milestone };

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONE CELEBRATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const MILESTONES: Milestone[] = [
  // Level milestones
  { id: 'level-3', type: 'level', threshold: 3, title: 'First Steps', description: 'Reached Level 3!', icon: 'star', celebrationType: 'confetti', rewards: { xp: 100, coins: 200 } },
  { id: 'level-5', type: 'level', threshold: 5, title: 'Rising Star', description: 'Reached Level 5!', icon: 'star', celebrationType: 'confetti', rewards: { xp: 200, coins: 400 } },
  { id: 'level-7', type: 'level', threshold: 7, title: 'Getting Serious', description: 'Reached Level 7!', icon: 'star', celebrationType: 'confetti', rewards: { xp: 150, coins: 300 } },
  { id: 'level-10', type: 'level', threshold: 10, title: 'Dedicated Focuser', description: 'Reached Level 10!', icon: 'star', celebrationType: 'stars', rewards: { xp: 500, coins: 1000 } },
  { id: 'level-12', type: 'level', threshold: 12, title: 'Committed', description: 'Reached Level 12!', icon: 'star', celebrationType: 'stars', rewards: { xp: 350, coins: 700 } },
  { id: 'level-15', type: 'level', threshold: 15, title: 'Halfway There', description: 'Reached Level 15!', icon: 'star', celebrationType: 'stars', rewards: { xp: 500, coins: 900 } },
  { id: 'level-18', type: 'level', threshold: 18, title: 'Almost Master', description: 'Reached Level 18!', icon: 'star', celebrationType: 'stars', rewards: { xp: 700, coins: 1200 } },
  { id: 'level-20', type: 'level', threshold: 20, title: 'Focus Master', description: 'Reached Level 20!', icon: 'sparkles', celebrationType: 'fireworks', rewards: { xp: 1000, coins: 2000, badge: 'focus-master' } },
  { id: 'level-25', type: 'level', threshold: 25, title: 'Quarter Century', description: 'Reached Level 25!', icon: 'sparkles', celebrationType: 'fireworks', rewards: { xp: 1500, coins: 3000, badge: 'quarter-century' } },
  { id: 'level-30', type: 'level', threshold: 30, title: 'Focus Legend', description: 'Reached Level 30!', icon: 'crown', celebrationType: 'rainbow', rewards: { xp: 2000, coins: 4000, badge: 'focus-legend' } },
  { id: 'level-35', type: 'level', threshold: 35, title: 'Elite Focuser', description: 'Reached Level 35!', icon: 'crown', celebrationType: 'fireworks', rewards: { xp: 2500, coins: 5000, badge: 'elite-focuser' } },
  { id: 'level-40', type: 'level', threshold: 40, title: 'Ascendant', description: 'Reached Level 40!', icon: 'crown', celebrationType: 'rainbow', rewards: { xp: 3500, coins: 7000, badge: 'ascendant' } },
  { id: 'level-45', type: 'level', threshold: 45, title: 'Near Perfection', description: 'Reached Level 45!', icon: 'crown', celebrationType: 'rainbow', rewards: { xp: 4000, coins: 8000, badge: 'near-perfection' } },
  { id: 'level-50', type: 'level', threshold: 50, title: 'Max Level!', description: 'Reached Maximum Level!', icon: 'trophy', celebrationType: 'rainbow', rewards: { xp: 5000, coins: 10000, badge: 'max-level' } },

  // Streak milestones
  { id: 'streak-3', type: 'streak', threshold: 3, title: 'Three Peat', description: '3-day streak!', icon: 'fire', celebrationType: 'confetti', rewards: { xp: 75, coins: 150 } },
  { id: 'streak-7', type: 'streak', threshold: 7, title: 'Week Warrior', description: '7-day streak!', icon: 'fire', celebrationType: 'confetti', rewards: { xp: 200, coins: 300 } },
  { id: 'streak-14', type: 'streak', threshold: 14, title: 'Fortnight Focus', description: '14-day streak!', icon: 'fire', celebrationType: 'stars', rewards: { xp: 500, coins: 800 } },
  { id: 'streak-30', type: 'streak', threshold: 30, title: 'Monthly Master', description: '30-day streak!', icon: 'fire', celebrationType: 'fireworks', rewards: { xp: 1000, coins: 1500 } },
  { id: 'streak-60', type: 'streak', threshold: 60, title: 'Two Months Strong', description: '60-day streak!', icon: 'fire', celebrationType: 'fireworks', rewards: { xp: 2500, coins: 4000, badge: 'two-months' } },
  { id: 'streak-100', type: 'streak', threshold: 100, title: 'Century Streak', description: '100-day streak!', icon: 'fire', celebrationType: 'rainbow', rewards: { xp: 4000, coins: 6000, badge: 'century-streak' } },
  { id: 'streak-365', type: 'streak', threshold: 365, title: 'Year of Focus', description: '365-day streak!', icon: 'fire', celebrationType: 'rainbow', rewards: { xp: 8000, coins: 15000, badge: 'year-focus' } },

  // Session milestones
  { id: 'sessions-10', type: 'sessions', threshold: 10, title: 'Getting Started', description: '10 focus sessions!', icon: 'target', celebrationType: 'confetti', rewards: { coins: 250 } },
  { id: 'sessions-25', type: 'sessions', threshold: 25, title: 'Quarter Hundred', description: '25 focus sessions!', icon: 'target', celebrationType: 'confetti', rewards: { xp: 150, coins: 350 } },
  { id: 'sessions-50', type: 'sessions', threshold: 50, title: 'Consistent', description: '50 focus sessions!', icon: 'target', celebrationType: 'stars', rewards: { xp: 400, coins: 600 } },
  { id: 'sessions-100', type: 'sessions', threshold: 100, title: 'Century Sessions', description: '100 focus sessions!', icon: 'target', celebrationType: 'fireworks', rewards: { xp: 1000, coins: 1500 } },
  { id: 'sessions-200', type: 'sessions', threshold: 200, title: 'Double Century', description: '200 focus sessions!', icon: 'target', celebrationType: 'fireworks', rewards: { xp: 2000, coins: 3000 } },
  { id: 'sessions-500', type: 'sessions', threshold: 500, title: 'Focus Veteran', description: '500 focus sessions!', icon: 'target', celebrationType: 'rainbow', rewards: { xp: 4000, coins: 6000, badge: 'veteran' } },

  // Focus hours milestones
  { id: 'hours-10', type: 'focus_hours', threshold: 10, title: '10 Hour Club', description: '10 hours of focus!', icon: 'clock', celebrationType: 'confetti', rewards: { coins: 350 } },
  { id: 'hours-25', type: 'focus_hours', threshold: 25, title: 'Full Day Focus', description: '25 hours of focus!', icon: 'clock', celebrationType: 'stars', rewards: { xp: 400, coins: 700 } },
  { id: 'hours-50', type: 'focus_hours', threshold: 50, title: '50 Hour Club', description: '50 hours of focus!', icon: 'clock', celebrationType: 'stars', rewards: { xp: 600, coins: 1000 } },
  { id: 'hours-100', type: 'focus_hours', threshold: 100, title: 'Century Hours', description: '100 hours of focus!', icon: 'clock', celebrationType: 'fireworks', rewards: { xp: 1500, coins: 2000, badge: 'century-hours' } },
  { id: 'hours-200', type: 'focus_hours', threshold: 200, title: 'Focus Expert', description: '200 hours of focus!', icon: 'clock', celebrationType: 'fireworks', rewards: { xp: 3000, coins: 5000 } },
  { id: 'hours-500', type: 'focus_hours', threshold: 500, title: 'Time Master', description: '500 hours of focus!', icon: 'clock', celebrationType: 'rainbow', rewards: { xp: 6000, coins: 10000, badge: 'time-master' } },

  // Collection milestones (total pets placed)
  { id: 'pets-5', type: 'collection', threshold: 5, title: 'Pet Collector', description: 'Collected 5 pets!', icon: 'heart', celebrationType: 'confetti', rewards: { coins: 400 } },
  { id: 'pets-15', type: 'collection', threshold: 15, title: 'Island Keeper', description: 'Collected 15 pets!', icon: 'heart', celebrationType: 'stars', rewards: { xp: 600, coins: 1000 } },
  { id: 'pets-25', type: 'collection', threshold: 25, title: 'Pet Master', description: 'Collected 25 pets!', icon: 'heart', celebrationType: 'fireworks', rewards: { xp: 1500, coins: 2000, badge: 'pet-master' } },

  // Species discovery milestones (unique species found: 25%/50%/75%/100% of 41)
  { id: 'species-25pct', type: 'collection', threshold: 10, title: 'Explorer', description: 'Discovered 25% of species!', icon: 'heart', celebrationType: 'confetti', rewards: { coins: 500 } },
  { id: 'species-50pct', type: 'collection', threshold: 20, title: 'Naturalist', description: 'Discovered 50% of species!', icon: 'heart', celebrationType: 'stars', rewards: { xp: 800, coins: 1500 } },
  { id: 'species-75pct', type: 'collection', threshold: 31, title: 'Zoologist', description: 'Discovered 75% of species!', icon: 'heart', celebrationType: 'fireworks', rewards: { xp: 2000, coins: 3000, badge: 'zoologist' } },
  { id: 'species-100pct', type: 'collection', threshold: 41, title: 'Complete Collector', description: 'All species discovered!', icon: 'heart', celebrationType: 'rainbow', rewards: { xp: 5000, coins: 8000, badge: 'complete-collector' } },
];

// ═══════════════════════════════════════════════════════════════════════════
// DAILY CHALLENGES
// ═══════════════════════════════════════════════════════════════════════════

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  /** Objective type matching quest system types */
  objectiveType: 'focus_time' | 'sessions' | 'perfect_focus' | 'streak';
  target: number;
  rewards: { coins: number; xp: number };
}

export const DAILY_CHALLENGES: ChallengeTemplate[] = [
  // Easy (50% weight)
  { id: 'dc-1', title: 'Quick Start', description: 'Complete 1 focus session', difficulty: 'easy', objectiveType: 'sessions', target: 1, rewards: { coins: 70, xp: 40 } },
  { id: 'dc-2', title: 'Half Hour Focus', description: 'Focus for 30 minutes', difficulty: 'easy', objectiveType: 'focus_time', target: 30, rewards: { coins: 85, xp: 55 } },
  { id: 'dc-3', title: 'Double Up', description: 'Complete 2 focus sessions', difficulty: 'easy', objectiveType: 'sessions', target: 2, rewards: { coins: 105, xp: 70 } },
  { id: 'dc-4', title: 'Clean Focus', description: 'Complete a perfect focus session', difficulty: 'easy', objectiveType: 'perfect_focus', target: 1, rewards: { coins: 85, xp: 55 } },
  { id: 'dc-5', title: 'Forty-Five', description: 'Focus for 45 minutes', difficulty: 'easy', objectiveType: 'focus_time', target: 45, rewards: { coins: 100, xp: 65 } },
  { id: 'dc-6', title: 'Warm Up', description: 'Complete a 25-minute session', difficulty: 'easy', objectiveType: 'focus_time', target: 25, rewards: { coins: 65, xp: 35 } },
  { id: 'dc-7', title: 'Starter Pack', description: 'Focus for at least 1 hour total', difficulty: 'easy', objectiveType: 'focus_time', target: 60, rewards: { coins: 110, xp: 70 } },
  // Medium (35% weight)
  { id: 'dc-8', title: 'Deep Work', description: 'Focus for 90+ consecutive minutes', difficulty: 'medium', objectiveType: 'focus_time', target: 90, rewards: { coins: 210, xp: 110 } },
  { id: 'dc-9', title: 'Triple Threat', description: 'Complete 3 sessions today', difficulty: 'medium', objectiveType: 'sessions', target: 3, rewards: { coins: 180, xp: 100 } },
  { id: 'dc-10', title: 'Two Hours', description: 'Accumulate 2 hours of focus', difficulty: 'medium', objectiveType: 'focus_time', target: 120, rewards: { coins: 225, xp: 125 } },
  { id: 'dc-11', title: 'Focus Duo', description: 'Complete 2 perfect focus sessions', difficulty: 'medium', objectiveType: 'perfect_focus', target: 2, rewards: { coins: 195, xp: 105 } },
  { id: 'dc-12', title: 'Marathon Prep', description: 'Focus for 150 minutes total', difficulty: 'medium', objectiveType: 'focus_time', target: 150, rewards: { coins: 240, xp: 135 } },
  { id: 'dc-13', title: 'Session Stacker', description: 'Complete 4 sessions today', difficulty: 'medium', objectiveType: 'sessions', target: 4, rewards: { coins: 225, xp: 120 } },
  // Hard (15% weight)
  { id: 'dc-14', title: 'Laser Focus', description: 'Complete 3 perfect focus sessions', difficulty: 'hard', objectiveType: 'perfect_focus', target: 3, rewards: { coins: 420, xp: 210 } },
  { id: 'dc-15', title: 'Endurance Master', description: 'Focus for 3+ hours total', difficulty: 'hard', objectiveType: 'focus_time', target: 180, rewards: { coins: 390, xp: 195 } },
  { id: 'dc-16', title: 'Quintuple', description: 'Complete 5 sessions today', difficulty: 'hard', objectiveType: 'sessions', target: 5, rewards: { coins: 450, xp: 225 } },
  { id: 'dc-17', title: 'Ultra Deep Work', description: 'Complete a 120-minute session', difficulty: 'hard', objectiveType: 'focus_time', target: 120, rewards: { coins: 350, xp: 180 } },
  { id: 'dc-18', title: 'All-Day Focus', description: 'Focus for 4+ hours total', difficulty: 'hard', objectiveType: 'focus_time', target: 240, rewards: { coins: 490, xp: 250 } },
  { id: 'dc-19', title: 'Perfect Day', description: 'Complete 4 perfect focus sessions', difficulty: 'hard', objectiveType: 'perfect_focus', target: 4, rewards: { coins: 490, xp: 245 } },
  { id: 'dc-20', title: 'Six Pack', description: 'Complete 6 sessions today', difficulty: 'hard', objectiveType: 'sessions', target: 6, rewards: { coins: 560, xp: 280 } },
];

/** Difficulty badge colors matching existing rarity badge pattern */
export const DIFFICULTY_COLORS: Record<ChallengeDifficulty, { bg: string; text: string; border: string }> = {
  easy: { bg: 'hsl(140 45% 90%)', text: 'hsl(140 45% 35%)', border: 'hsl(140 45% 75%)' },
  medium: { bg: 'hsl(200 60% 90%)', text: 'hsl(200 60% 35%)', border: 'hsl(200 60% 75%)' },
  hard: { bg: 'hsl(270 50% 92%)', text: 'hsl(270 50% 40%)', border: 'hsl(270 50% 78%)' },
};

// ═══════════════════════════════════════════════════════════════════════════
// WEEKLY CHALLENGES
// ═══════════════════════════════════════════════════════════════════════════

export interface WeeklyChallengeTemplate {
  id: string;
  title: string;
  description: string;
  objectiveType: 'focus_time' | 'sessions' | 'perfect_focus' | 'streak';
  target: number;
  rewards: { coins: number; xp: number };
}

export const WEEKLY_CHALLENGES: WeeklyChallengeTemplate[] = [
  { id: 'wc-1', title: 'Deep Focus Week', description: 'Focus for 5 hours total this week', objectiveType: 'focus_time', target: 300, rewards: { coins: 500, xp: 250 } },
  { id: 'wc-2', title: 'Session Warrior', description: 'Complete 10 focus sessions this week', objectiveType: 'sessions', target: 10, rewards: { coins: 450, xp: 220 } },
  { id: 'wc-3', title: 'Marathon Week', description: 'Focus for 8 hours total this week', objectiveType: 'focus_time', target: 480, rewards: { coins: 700, xp: 350 } },
  { id: 'wc-4', title: 'Perfect Focus Week', description: 'Complete 5 perfect focus sessions', objectiveType: 'perfect_focus', target: 5, rewards: { coins: 600, xp: 300 } },
  { id: 'wc-5', title: 'Daily Dedication', description: 'Maintain a 5-day streak this week', objectiveType: 'streak', target: 5, rewards: { coins: 400, xp: 200 } },
  { id: 'wc-6', title: 'Focus Sprint', description: 'Complete 15 sessions this week', objectiveType: 'sessions', target: 15, rewards: { coins: 650, xp: 320 } },
  { id: 'wc-7', title: 'Endurance Champion', description: 'Focus for 10 hours total this week', objectiveType: 'focus_time', target: 600, rewards: { coins: 800, xp: 400 } },
  { id: 'wc-8', title: 'Laser Week', description: 'Complete 8 perfect focus sessions', objectiveType: 'perfect_focus', target: 8, rewards: { coins: 750, xp: 380 } },
  { id: 'wc-9', title: 'Steady Pace', description: 'Complete 7 sessions this week', objectiveType: 'sessions', target: 7, rewards: { coins: 350, xp: 180 } },
  { id: 'wc-10', title: 'Full Streak Week', description: 'Maintain a 7-day streak', objectiveType: 'streak', target: 7, rewards: { coins: 550, xp: 280 } },
];

export const getMilestoneForValue = (type: Milestone['type'], value: number): Milestone | null => {
  const typeMilestones = MILESTONES.filter(m => m.type === type);
  for (let i = typeMilestones.length - 1; i >= 0; i--) {
    if (value === typeMilestones[i].threshold) {
      return typeMilestones[i];
    }
  }
  return null;
};

export const getNextMilestone = (type: Milestone['type'], currentValue: number): Milestone | null => {
  const typeMilestones = MILESTONES.filter(m => m.type === type);
  return typeMilestones.find(m => m.threshold > currentValue) || null;
};
