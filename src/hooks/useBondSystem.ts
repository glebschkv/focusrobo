import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { bondLogger } from '@/lib/logger';

export interface BondData {
  botId: string;
  bondLevel: number; // 1-10
  experience: number; // 0-100 per level
  lastInteraction: number;
  totalInteractions: number;
  favoriteActivities: string[];
  personality: {
    energy: number; // 1-5
    curiosity: number; // 1-5
    loyalty: number; // 1-5
  };
  moodState: 'happy' | 'content' | 'lonely' | 'excited' | 'sleepy';
  unlockedAbilities: string[];
}

export interface BondSystemReturn {
  bonds: Record<string, BondData>;
  getBondLevel: (botId: string) => number;
  getExperienceProgress: (botId: string) => number;
  getMoodState: (botId: string) => string;
  interactWithBot: (botId: string, activity: string) => Promise<boolean>;
  feedBot: (botId: string) => Promise<boolean>;
  playWithBot: (botId: string) => Promise<boolean>;
  trainBot: (botId: string, skill: string) => Promise<boolean>;
  giftUpgrade: (botId: string) => Promise<boolean>;
  getAbilityBonuses: (botId: string) => Record<string, number>;
  getBotPersonality: (botId: string) => BondData['personality'];
  resetBond: (botId: string) => void;
}

const BOND_STORAGE_KEY = 'bot-bond-data';
const EXPERIENCE_PER_LEVEL = 100;
const ABILITIES_BY_LEVEL = {
  1: ['Basic Companion'],
  3: ['Focus Boost +5%'],
  5: ['Experience Bonus +10%'],
  7: ['Special Animation'],
  10: ['Master Bond', 'Ultimate Ability']
};

export const useBondSystem = (): BondSystemReturn => {
  const [bonds, setBonds] = useState<Record<string, BondData>>({});
  // Load bond data from localStorage
  const loadBondData = useCallback(() => {
    try {
      const saved = localStorage.getItem(BOND_STORAGE_KEY);
      if (saved) {
        setBonds(JSON.parse(saved));
      }
    } catch (error) {
      bondLogger.error('Failed to load bond data:', error);
    }
  }, []);

  // Save bond data to localStorage
  const saveBondData = useCallback((bondData: Record<string, BondData>) => {
    try {
      localStorage.setItem(BOND_STORAGE_KEY, JSON.stringify(bondData));
    } catch (error) {
      bondLogger.error('Failed to save bond data:', error);
    }
  }, []);

  // Initialize bond data for new bot
  const initializeBond = useCallback((botId: string): BondData => {
    return {
      botId,
      bondLevel: 1,
      experience: 0,
      lastInteraction: Date.now(),
      totalInteractions: 0,
      favoriteActivities: [],
      personality: {
        energy: Math.floor(Math.random() * 5) + 1,
        curiosity: Math.floor(Math.random() * 5) + 1,
        loyalty: Math.floor(Math.random() * 5) + 1
      },
      moodState: 'content',
      unlockedAbilities: ['Basic Companion']
    };
  }, []);

  // Get bond level for bot
  const getBondLevel = useCallback((botId: string): number => {
    return bonds[botId]?.bondLevel || 1;
  }, [bonds]);

  // Get experience progress (0-100)
  const getExperienceProgress = useCallback((botId: string): number => {
    return bonds[botId]?.experience || 0;
  }, [bonds]);

  // Get mood state
  const getMoodState = useCallback((botId: string): string => {
    return bonds[botId]?.moodState || 'content';
  }, [bonds]);

  // Calculate mood based on interactions
  const calculateMood = useCallback((bondData: BondData): BondData['moodState'] => {
    const timeSinceLastInteraction = Date.now() - bondData.lastInteraction;
    const hoursAgo = timeSinceLastInteraction / (1000 * 60 * 60);

    if (hoursAgo > 24) return 'lonely';
    if (hoursAgo < 1) return 'excited';
    if (bondData.totalInteractions % 5 === 0) return 'happy';
    return 'content';
  }, []);

  // Add experience and handle level ups
  const addExperience = useCallback((botId: string, amount: number): boolean => {
    setBonds(prev => {
      const current = prev[botId] || initializeBond(botId);
      const newExperience = current.experience + amount;
      const newLevel = Math.min(10, current.bondLevel + Math.floor(newExperience / EXPERIENCE_PER_LEVEL));
      const remainingExp = newExperience % EXPERIENCE_PER_LEVEL;

      const leveledUp = newLevel > current.bondLevel;
      const newAbilities = leveledUp ? [...current.unlockedAbilities] : current.unlockedAbilities;

      // Add new abilities for level up
      if (leveledUp && ABILITIES_BY_LEVEL[newLevel as keyof typeof ABILITIES_BY_LEVEL]) {
        newAbilities.push(...ABILITIES_BY_LEVEL[newLevel as keyof typeof ABILITIES_BY_LEVEL]);
      }

      const updated = {
        ...current,
        bondLevel: newLevel,
        experience: newLevel === 10 ? 100 : remainingExp,
        lastInteraction: Date.now(),
        totalInteractions: current.totalInteractions + 1,
        moodState: calculateMood({ ...current, lastInteraction: Date.now() }),
        unlockedAbilities: newAbilities
      };

      const newBonds = { ...prev, [botId]: updated };
      saveBondData(newBonds);

      if (leveledUp) {
        toast.success("Bond Level Up!", {
          description: `Your bond with ${botId} reached level ${newLevel}!`,
        });
      }

      return newBonds;
    });

    return true;
  }, [initializeBond, calculateMood, saveBondData]);

  // Generic interaction method.
  // Automatic interactions (like 'focus_session') skip the toast to avoid
  // spamming the user on every timer completion.
  const interactWithBot = useCallback(async (botId: string, activity: string): Promise<boolean> => {
    const experienceGain = Math.floor(Math.random() * 15) + 10;
    addExperience(botId, experienceGain);

    // Only show toast for explicit user-initiated interactions
    if (activity !== 'focus_session') {
      toast.success("Bot Interaction", {
        description: `${activity} with your bot! +${experienceGain} bond experience`,
      });
    }

    return true;
  }, [addExperience]);

  // Specific interaction methods
  const feedBot = useCallback(async (botId: string): Promise<boolean> => {
    return interactWithBot(botId, "Fed");
  }, [interactWithBot]);

  const playWithBot = useCallback(async (botId: string): Promise<boolean> => {
    return interactWithBot(botId, "Played");
  }, [interactWithBot]);

  const trainBot = useCallback(async (botId: string, skill: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const experienceGain = Math.floor(Math.random() * 25) + 20;
        addExperience(botId, experienceGain);
        
        toast.success("Training Complete", {
          description: `Trained ${skill}! +${experienceGain} bond experience`,
        });
        
        resolve(true);
      }, 2000);
    });
  }, [addExperience]);

  const giftUpgrade = useCallback(async (botId: string): Promise<boolean> => {
    return interactWithBot(botId, "Gave treat to");
  }, [interactWithBot]);

  // Get ability bonuses based on bond level
  const getAbilityBonuses = useCallback((botId: string): Record<string, number> => {
    const bondLevel = getBondLevel(botId);
    return {
      focusBonus: bondLevel * 2, // 2% per level
      experienceBonus: Math.floor(bondLevel / 2) * 5, // 5% every 2 levels
      timeBonus: bondLevel >= 5 ? 10 : 0 // 10% at level 5+
    };
  }, [getBondLevel]);

  // Get bot personality
  const getBotPersonality = useCallback((botId: string): BondData['personality'] => {
    return bonds[botId]?.personality || { energy: 3, curiosity: 3, loyalty: 3 };
  }, [bonds]);

  // Reset bond (for testing)
  const resetBond = useCallback((botId: string): void => {
    setBonds(prev => {
      const updated = { ...prev };
      delete updated[botId];
      saveBondData(updated);
      return updated;
    });
  }, [saveBondData]);

  // Load data on mount
  useEffect(() => {
    loadBondData();
  }, [loadBondData]);

  return {
    bonds,
    getBondLevel,
    getExperienceProgress,
    getMoodState,
    interactWithBot,
    feedBot,
    playWithBot,
    trainBot,
    giftUpgrade,
    getAbilityBonuses,
    getBotPersonality,
    resetBond
  };
};