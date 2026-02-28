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
  { id: 'level-5', type: 'level', threshold: 5, title: 'Rising Star', description: 'Reached Level 5!', icon: 'star', celebrationType: 'confetti', rewards: { xp: 200, coins: 400 } },
  { id: 'level-10', type: 'level', threshold: 10, title: 'Dedicated Focuser', description: 'Reached Level 10!', icon: 'star', celebrationType: 'stars', rewards: { xp: 500, coins: 1000 } },
  { id: 'level-20', type: 'level', threshold: 20, title: 'Focus Master', description: 'Reached Level 20!', icon: 'sparkles', celebrationType: 'fireworks', rewards: { xp: 1000, coins: 2000, badge: 'focus-master' } },
  { id: 'level-30', type: 'level', threshold: 30, title: 'Focus Legend', description: 'Reached Level 30!', icon: 'crown', celebrationType: 'rainbow', rewards: { xp: 2000, coins: 4000, badge: 'focus-legend' } },
  { id: 'level-50', type: 'level', threshold: 50, title: 'Max Level!', description: 'Reached Maximum Level!', icon: 'trophy', celebrationType: 'rainbow', rewards: { xp: 5000, coins: 10000, badge: 'max-level' } },

  // Streak milestones
  { id: 'streak-7', type: 'streak', threshold: 7, title: 'Week Warrior', description: '7-day streak!', icon: 'fire', celebrationType: 'confetti', rewards: { xp: 200, coins: 300 } },
  { id: 'streak-30', type: 'streak', threshold: 30, title: 'Monthly Master', description: '30-day streak!', icon: 'fire', celebrationType: 'fireworks', rewards: { xp: 1000, coins: 1500 } },
  { id: 'streak-100', type: 'streak', threshold: 100, title: 'Century Streak', description: '100-day streak!', icon: 'fire', celebrationType: 'rainbow', rewards: { xp: 4000, coins: 6000, badge: 'century-streak' } },

  // Session milestones
  { id: 'sessions-10', type: 'sessions', threshold: 10, title: 'Getting Started', description: '10 focus sessions!', icon: 'target', celebrationType: 'confetti', rewards: { coins: 250 } },
  { id: 'sessions-50', type: 'sessions', threshold: 50, title: 'Consistent', description: '50 focus sessions!', icon: 'target', celebrationType: 'stars', rewards: { xp: 400, coins: 600 } },
  { id: 'sessions-100', type: 'sessions', threshold: 100, title: 'Century Sessions', description: '100 focus sessions!', icon: 'target', celebrationType: 'fireworks', rewards: { xp: 1000, coins: 1500 } },
  { id: 'sessions-500', type: 'sessions', threshold: 500, title: 'Focus Veteran', description: '500 focus sessions!', icon: 'target', celebrationType: 'rainbow', rewards: { xp: 4000, coins: 6000, badge: 'veteran' } },

  // Focus hours milestones
  { id: 'hours-10', type: 'focus_hours', threshold: 10, title: '10 Hour Club', description: '10 hours of focus!', icon: 'clock', celebrationType: 'confetti', rewards: { coins: 350 } },
  { id: 'hours-50', type: 'focus_hours', threshold: 50, title: '50 Hour Club', description: '50 hours of focus!', icon: 'clock', celebrationType: 'stars', rewards: { xp: 600, coins: 1000 } },
  { id: 'hours-100', type: 'focus_hours', threshold: 100, title: 'Century Hours', description: '100 hours of focus!', icon: 'clock', celebrationType: 'fireworks', rewards: { xp: 1500, coins: 2000, badge: 'century-hours' } },
  { id: 'hours-500', type: 'focus_hours', threshold: 500, title: 'Time Master', description: '500 hours of focus!', icon: 'clock', celebrationType: 'rainbow', rewards: { xp: 6000, coins: 10000, badge: 'time-master' } },

  // Collection milestones
  { id: 'bots-5', type: 'collection', threshold: 5, title: 'Bot Builder', description: 'Collected 5 bots!', icon: 'robot', celebrationType: 'confetti', rewards: { coins: 400 } },
  { id: 'bots-15', type: 'collection', threshold: 15, title: 'Workshop Manager', description: 'Collected 15 bots!', icon: 'robot', celebrationType: 'stars', rewards: { xp: 600, coins: 1000 } },
  { id: 'bots-25', type: 'collection', threshold: 25, title: 'Fleet Commander', description: 'Collected 25 bots!', icon: 'robot', celebrationType: 'fireworks', rewards: { xp: 1500, coins: 2000, badge: 'fleet-commander' } },
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
