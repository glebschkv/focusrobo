/**
 * Unified XP System Hook
 *
 * Architecture:
 * - localStorage is the primary storage (offline-first)
 * - When authenticated, changes sync to Supabase in the background
 * - All operations are synchronous for immediate UI response
 * - Backend sync happens asynchronously without blocking
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { getAvailablePets } from '@/data/PetDatabase';
import { xpLogger as logger } from '@/lib/logger';
import { safeJsonParse } from '@/lib/apiUtils';
import { usePremiumStore } from '@/stores/premiumStore';
import { useAuth } from '../useAuth';
import { useSupabaseData } from '../useSupabaseData';
import { validateXPAmount, validateLevel, validateSessionMinutes } from '@/lib/validation';

import { XPReward, XPSystemState } from './xpTypes';

/**
 * SECURITY: Rate limiting for client-side debouncing
 */
let lastXPAwardTime = 0;
const MIN_XP_AWARD_INTERVAL_MS = 2000;

function canAwardXP(): boolean {
  const now = Date.now();
  if (now - lastXPAwardTime < MIN_XP_AWARD_INTERVAL_MS) {
    return false;
  }
  lastXPAwardTime = now;
  return true;
}

/**
 * SECURITY: Session tracking for duplicate prevention
 */
const rewardedSessions = new Set<string>();
const MAX_TRACKED_SESSIONS = 100;

function markSessionRewarded(sessionId: string): boolean {
  if (rewardedSessions.has(sessionId)) {
    return false;
  }
  if (rewardedSessions.size >= MAX_TRACKED_SESSIONS) {
    const iterator = rewardedSessions.values();
    const firstValue = iterator.next().value;
    if (firstValue) {
      rewardedSessions.delete(firstValue);
    }
  }
  rewardedSessions.add(sessionId);
  return true;
}

import {
  STORAGE_KEY,
  XP_UPDATE_EVENT,
  PET_PURCHASED_EVENT,
  MAX_LEVEL,
  XP_REWARDS,
  UNLOCKS_BY_LEVEL,
} from './xpConstants';
import {
  calculateRandomBonus,
  calculateLevelRequirement,
  normalizePetList,
  calculateLevel,
} from './xpUtils';

const LEGACY_KEY = 'petIsland_xpSystem';

const extractXPData = (data: unknown): { xp: number; level: number; pets?: string[]; totalStudyMinutes?: number } | null => {
  if (!data || typeof data !== 'object') return null;

  const stateData = ('state' in (data as Record<string, unknown>))
    ? (data as Record<string, unknown>).state as Record<string, unknown>
    : data as Record<string, unknown>;

  if (!stateData || typeof stateData !== 'object') return null;

  const xp = validateXPAmount(stateData.currentXP ?? stateData.totalXP ?? 0);
  if (xp === 0) return null;

  // Support both old and new field names for migration
  const pets = Array.isArray(stateData.unlockedPets)
    ? stateData.unlockedPets as string[]
    : Array.isArray(stateData.unlockedRobots)
      ? stateData.unlockedRobots as string[]
      : undefined;

  return {
    xp,
    level: validateLevel(stateData.currentLevel),
    pets,
    totalStudyMinutes: typeof stateData.totalStudyMinutes === 'number' ? stateData.totalStudyMinutes : undefined,
  };
};

const loadXPState = (defaultPets: string[]): XPSystemState => {
  const defaultState: XPSystemState = {
    currentXP: 0,
    currentLevel: 0,
    xpToNextLevel: 15,
    totalXPForCurrentLevel: 0,
    unlockedPets: defaultPets,
    totalStudyMinutes: 0,
  };

  const storageKeys = [STORAGE_KEY, LEGACY_KEY];
  let bestData: ReturnType<typeof extractXPData> = null;

  for (const key of storageKeys) {
    try {
      const savedData = localStorage.getItem(key);
      if (!savedData) continue;

      const parsed = JSON.parse(savedData);
      const extracted = extractXPData(parsed);

      if (extracted && (!bestData || extracted.xp > bestData.xp)) {
        bestData = extracted;
        logger.debug(`Found valid XP data in ${key}: ${extracted.xp} XP`);
      }
    } catch {
      logger.warn(`Failed to parse data from ${key}`);
    }
  }

  if (!bestData || bestData.xp === 0) {
    logger.debug('No saved XP state, starting fresh');
    return defaultState;
  }

  const calculatedLevel = calculateLevel(bestData.xp);
  const level = (bestData.level > calculatedLevel &&
    bestData.xp >= calculateLevelRequirement(bestData.level) * 0.9)
    ? bestData.level
    : calculatedLevel;

  const currentLevelXP = calculateLevelRequirement(level);
  const nextLevelXP = level >= MAX_LEVEL ? currentLevelXP : calculateLevelRequirement(level + 1);

  const savedPets = normalizePetList(bestData.pets);
  const allPets = Array.from(new Set([...defaultPets, ...savedPets]));

  const recoveredState: XPSystemState = {
    currentXP: bestData.xp,
    currentLevel: level,
    xpToNextLevel: level >= MAX_LEVEL ? 0 : Math.max(0, nextLevelXP - bestData.xp),
    totalXPForCurrentLevel: currentLevelXP,
    unlockedPets: allPets,
    totalStudyMinutes: bestData.totalStudyMinutes ?? 0,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(recoveredState));
  logger.debug(`Restored XP state: Level ${level}, ${bestData.xp} XP, ${allPets.length} pets`);

  return recoveredState;
};

export const useXPSystem = () => {
  const { isAuthenticated } = useAuth();
  const { progress, updateProgress, addFocusSession } = useSupabaseData();

  const startingPets = getAvailablePets(0).map(p => p.name);

  const xpStateRef = useRef<XPSystemState | null>(null);

  const [xpState, setXPState] = useState<XPSystemState>({
    currentXP: 0,
    currentLevel: 0,
    xpToNextLevel: 15,
    totalXPForCurrentLevel: 0,
    unlockedPets: startingPets,
    totalStudyMinutes: 0,
  });

  // Sync state from backend when authenticated
  useEffect(() => {
    if (isAuthenticated && progress) {
      const backendLevel = progress.current_level;
      const backendXP = progress.total_xp;

      const currentLocal = xpStateRef.current;
      const effectiveLevel = currentLocal
        ? Math.max(backendLevel, currentLocal.currentLevel)
        : backendLevel;
      const effectiveXP = currentLocal
        ? Math.max(backendXP, currentLocal.currentXP)
        : backendXP;

      if (effectiveLevel !== currentLocal?.currentLevel || effectiveXP !== currentLocal?.currentXP) {
        const currentLevelXP = calculateLevelRequirement(effectiveLevel);
        const nextLevelXP = effectiveLevel >= MAX_LEVEL
          ? calculateLevelRequirement(effectiveLevel)
          : calculateLevelRequirement(effectiveLevel + 1);
        const xpToNextLevel = effectiveLevel >= MAX_LEVEL ? 0 : nextLevelXP - effectiveXP;

        const unlockedPets = getAvailablePets(effectiveLevel).map(p => p.name);

        const newState = {
          currentXP: effectiveXP,
          currentLevel: effectiveLevel,
          xpToNextLevel,
          totalXPForCurrentLevel: currentLevelXP,
          unlockedPets,
          totalStudyMinutes: currentLocal?.totalStudyMinutes ?? 0,
        };

        setXPState(newState);
        xpStateRef.current = newState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        logger.debug('Synced with backend:', newState);
      }
    }
  }, [isAuthenticated, progress]);

  // Load saved state from localStorage
  useEffect(() => {
    const defaultPets = getAvailablePets(0).map(p => p.name);
    const recoveredState = loadXPState(defaultPets);
    setXPState(recoveredState);
    xpStateRef.current = recoveredState;
  }, []);

  // Cross-component sync
  useEffect(() => {
    const handleXPUpdate = (event: CustomEvent<XPSystemState>) => {
      setXPState(event.detail);
      xpStateRef.current = event.detail;
    };

    window.addEventListener(XP_UPDATE_EVENT, handleXPUpdate as EventListener);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        const parsed = safeJsonParse<XPSystemState>(event.newValue, xpStateRef.current || xpState);
        setXPState(parsed);
        xpStateRef.current = parsed;
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(XP_UPDATE_EVENT, handleXPUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [xpState]);

  // Listen for pet purchase events (from shop)
  useEffect(() => {
    const handlePetPurchased = (event: CustomEvent<{ petId: string; petName: string }>) => {
      logger.debug('Pet purchased:', event.detail);
      const { petName } = event.detail;

      setXPState(prev => {
        if (prev.unlockedPets.includes(petName)) {
          return prev;
        }

        const updatedState = {
          ...prev,
          unlockedPets: [...prev.unlockedPets, petName],
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
        xpStateRef.current = updatedState;
        window.dispatchEvent(new CustomEvent(XP_UPDATE_EVENT, { detail: updatedState }));
        return updatedState;
      });
    };

    window.addEventListener(PET_PURCHASED_EVENT, handlePetPurchased as EventListener);

    return () => {
      window.removeEventListener(PET_PURCHASED_EVENT, handlePetPurchased as EventListener);
    };
  }, []);

  const saveState = useCallback((newState: Partial<XPSystemState>) => {
    setXPState(prev => {
      const merged = { ...prev, ...newState };
      const normalizedPets = normalizePetList(merged.unlockedPets);
      const updatedState = { ...merged, unlockedPets: normalizedPets };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      xpStateRef.current = updatedState;
      window.dispatchEvent(new CustomEvent(XP_UPDATE_EVENT, { detail: updatedState }));
      return updatedState;
    });
  }, []);

  const syncToBackend = useCallback(async (newTotalXP: number, newLevel: number, sessionMinutes?: number, xpGained?: number) => {
    if (!isAuthenticated) return;

    try {
      if (sessionMinutes && xpGained) {
        await addFocusSession(sessionMinutes, xpGained);
      }
      await updateProgress({
        total_xp: newTotalXP,
        current_level: newLevel,
        last_session_date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      logger.error('Failed to sync to backend:', error);
    }
  }, [isAuthenticated, addFocusSession, updateProgress]);

  const sortedDurations = useMemo(() =>
    Object.keys(XP_REWARDS)
      .map(Number)
      .sort((a, b) => b - a),
    []
  );

  const getSubscriptionMultiplier = useCallback((): number => {
    return usePremiumStore.getState().getXPMultiplier();
  }, []);

  const calculateXPFromDuration = useCallback((minutes: number): number => {
    for (const duration of sortedDurations) {
      if (minutes >= duration) {
        return XP_REWARDS[duration as keyof typeof XP_REWARDS];
      }
    }
    return 0;
  }, [sortedDurations]);

  const awardXP = useCallback((sessionMinutes: number, sessionId?: string): XPReward => {
    if (!canAwardXP()) {
      return { xpGained: 0, baseXP: 0, bonusXP: 0, bonusMultiplier: 1, hasBonusXP: false, bonusType: 'none', oldLevel: xpState.currentLevel, newLevel: xpState.currentLevel, leveledUp: false, unlockedRewards: [], subscriptionMultiplier: 1 };
    }

    const effectiveSessionId = sessionId || `xp_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (!markSessionRewarded(effectiveSessionId)) {
      return { xpGained: 0, baseXP: 0, bonusXP: 0, bonusMultiplier: 1, hasBonusXP: false, bonusType: 'none', oldLevel: xpState.currentLevel, newLevel: xpState.currentLevel, leveledUp: false, unlockedRewards: [], subscriptionMultiplier: 1 };
    }

    const validMinutes = validateSessionMinutes(sessionMinutes);
    const baseXP = calculateXPFromDuration(validMinutes);
    const subscriptionMultiplier = getSubscriptionMultiplier();
    const bonus = calculateRandomBonus();

    const xpAfterSubscription = Math.round(baseXP * subscriptionMultiplier);
    const xpGained = Math.round(xpAfterSubscription * bonus.bonusMultiplier);
    const bonusXP = xpGained - baseXP;

    const oldLevel = xpState.currentLevel;
    const newTotalXP = xpState.currentXP + xpGained;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    const currentLevelXP = calculateLevelRequirement(newLevel);
    const nextLevelXP = newLevel >= MAX_LEVEL
      ? calculateLevelRequirement(newLevel)
      : calculateLevelRequirement(newLevel + 1);
    const xpToNextLevel = newLevel >= MAX_LEVEL ? 0 : nextLevelXP - newTotalXP;

    const unlockedRewards: typeof UNLOCKS_BY_LEVEL[number] = [];
    if (leveledUp) {
      for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
        if (UNLOCKS_BY_LEVEL[lvl]) {
          unlockedRewards.push(...UNLOCKS_BY_LEVEL[lvl]);
        }
      }
    }

    const newPets = [...xpState.unlockedPets];
    unlockedRewards.forEach(reward => {
      if (reward.type === 'pet' && !newPets.includes(reward.name)) {
        newPets.push(reward.name);
      }
    });

    const newTotalStudyMinutes = (xpState.totalStudyMinutes || 0) + validMinutes;

    saveState({
      currentXP: newTotalXP,
      currentLevel: newLevel,
      xpToNextLevel,
      totalXPForCurrentLevel: currentLevelXP,
      unlockedPets: newPets,
      totalStudyMinutes: newTotalStudyMinutes,
    });

    syncToBackend(newTotalXP, newLevel, validMinutes, xpGained);

    return {
      xpGained, baseXP, bonusXP,
      bonusMultiplier: bonus.bonusMultiplier,
      hasBonusXP: bonus.hasBonusXP,
      bonusType: bonus.bonusType,
      oldLevel, newLevel, leveledUp,
      unlockedRewards, subscriptionMultiplier,
    };
  }, [xpState, calculateXPFromDuration, saveState, getSubscriptionMultiplier, syncToBackend]);

  const addDirectXP = useCallback((xpAmount: number): XPReward => {
    if (!canAwardXP()) {
      return { xpGained: 0, baseXP: 0, bonusXP: 0, bonusMultiplier: 1, hasBonusXP: false, bonusType: 'none', oldLevel: xpState.currentLevel, newLevel: xpState.currentLevel, leveledUp: false, unlockedRewards: [], subscriptionMultiplier: 1 };
    }

    const validAmount = validateXPAmount(xpAmount);
    if (validAmount <= 0) {
      return { xpGained: 0, baseXP: 0, bonusXP: 0, bonusMultiplier: 1, hasBonusXP: false, bonusType: 'none', oldLevel: xpState.currentLevel, newLevel: xpState.currentLevel, leveledUp: false, unlockedRewards: [], subscriptionMultiplier: 1 };
    }

    const oldLevel = xpState.currentLevel;
    const newTotalXP = xpState.currentXP + validAmount;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    const currentLevelXP = calculateLevelRequirement(newLevel);
    const nextLevelXP = newLevel >= MAX_LEVEL
      ? calculateLevelRequirement(newLevel)
      : calculateLevelRequirement(newLevel + 1);
    const xpToNextLevel = newLevel >= MAX_LEVEL ? 0 : nextLevelXP - newTotalXP;

    const unlockedRewards: typeof UNLOCKS_BY_LEVEL[number] = [];
    if (leveledUp) {
      for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
        if (UNLOCKS_BY_LEVEL[lvl]) {
          unlockedRewards.push(...UNLOCKS_BY_LEVEL[lvl]);
        }
      }
    }

    const newPets = [...xpState.unlockedPets];
    unlockedRewards.forEach(reward => {
      if (reward.type === 'pet' && !newPets.includes(reward.name)) {
        newPets.push(reward.name);
      }
    });

    saveState({
      currentXP: newTotalXP,
      currentLevel: newLevel,
      xpToNextLevel,
      totalXPForCurrentLevel: currentLevelXP,
      unlockedPets: newPets,
    });

    syncToBackend(newTotalXP, newLevel);

    return {
      xpGained: validAmount, baseXP: validAmount, bonusXP: 0,
      bonusMultiplier: 1, hasBonusXP: false, bonusType: 'none',
      oldLevel, newLevel, leveledUp, unlockedRewards, subscriptionMultiplier: 1,
    };
  }, [xpState, saveState, syncToBackend]);

  const getLevelProgress = useCallback((): number => {
    if (xpState.currentLevel >= MAX_LEVEL) return 100;
    const currentLevelXP = calculateLevelRequirement(xpState.currentLevel);
    const nextLevelXP = calculateLevelRequirement(xpState.currentLevel + 1);
    const progressXP = xpState.currentXP - currentLevelXP;
    const totalXPNeeded = Math.max(1, nextLevelXP - currentLevelXP);
    return Math.min(100, (progressXP / totalXPNeeded) * 100);
  }, [xpState]);

  const resetProgress = useCallback(() => {
    const startPets = getAvailablePets(0).map(p => p.name);
    const resetState: XPSystemState = {
      currentXP: 0,
      currentLevel: 0,
      xpToNextLevel: 15,
      totalXPForCurrentLevel: 0,
      unlockedPets: startPets,
      totalStudyMinutes: 0,
    };
    setXPState(resetState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
  }, []);

  return {
    ...xpState,
    awardXP,
    addDirectXP,
    getLevelProgress,
    resetProgress,
    calculateXPFromDuration,
    getSubscriptionMultiplier,
    isLoading: false,
  };
};
