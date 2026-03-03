/**
 * XP System Types
 * Type definitions for the XP and leveling system
 */

export interface XPReward {
  xpGained: number;
  baseXP: number;
  bonusXP: number;
  bonusMultiplier: number;
  hasBonusXP: boolean;
  bonusType: 'none' | 'lucky' | 'super_lucky' | 'mega_bonus';
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  unlockedRewards: UnlockedReward[];
  subscriptionMultiplier: number;
}

export interface UnlockedReward {
  type: 'pet' | 'zone';
  name: string;
  description: string;
  level: number;
}

export interface XPSystemState {
  currentXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  totalXPForCurrentLevel: number;
  unlockedPets: string[];
  totalStudyMinutes: number;
}

export interface BonusResult {
  hasBonusXP: boolean;
  bonusMultiplier: number;
  bonusType: 'none' | 'lucky' | 'super_lucky' | 'mega_bonus';
}
