/**
 * useTimerRewards Hook
 *
 * Handles XP and coin rewards for completed focus sessions.
 * Extracted from useTimerLogic for better separation of concerns.
 */

import { useCallback } from 'react';
import { useBackendAppState } from '@/hooks/useBackendAppState';
import { timerLogger } from '@/lib/logger';
import { toast } from 'sonner';
import { dispatchAchievementEvent, ACHIEVEMENT_EVENTS } from '@/hooks/useAchievementTracking';
import { FOCUS_BONUS } from '@/lib/constants';

interface RewardResult {
  xpEarned: number;
  coinsEarned: number;
  focusBonusType: string;
}

interface SessionInfo {
  sessionType: string;
  sessionDuration: number;
  category?: string;
  taskLabel?: string;
}

export function useTimerRewards() {
  const { awardXP, coinSystem, xpSystem } = useBackendAppState();

  /**
   * Calculate and award rewards for a completed session
   */
  const awardSessionRewards = useCallback(async (
    completedMinutes: number,
    shieldAttempts: number,
    hasAppsConfigured: boolean,
    blockedAppsCount: number,
    sessionInfo: SessionInfo
  ): Promise<RewardResult> => {
    const result: RewardResult = {
      xpEarned: 0,
      coinsEarned: 0,
      focusBonusType: '',
    };

    // Calculate focus bonus based on shield attempts
    let focusMultiplier: number = FOCUS_BONUS.DISTRACTED.multiplier;
    if (hasAppsConfigured && blockedAppsCount > 0) {
      if (shieldAttempts === 0) {
        focusMultiplier = FOCUS_BONUS.PERFECT_FOCUS.multiplier;
        result.focusBonusType = FOCUS_BONUS.PERFECT_FOCUS.label;
      } else if (shieldAttempts <= FOCUS_BONUS.GOOD_FOCUS_MAX_ATTEMPTS) {
        focusMultiplier = FOCUS_BONUS.GOOD_FOCUS.multiplier;
        result.focusBonusType = FOCUS_BONUS.GOOD_FOCUS.label;
      }
    }

    // Award XP for work sessions (minimum 25 minutes)
    if (sessionInfo.sessionType !== 'break' && completedMinutes >= 25) {
      try {
        const reward = await awardXP(completedMinutes);
        result.xpEarned = reward?.xpGained || 0;

        // Apply focus bonus to XP
        if (focusMultiplier > 1.0 && result.xpEarned > 0 && xpSystem && 'addDirectXP' in xpSystem) {
          const bonusXP = Math.floor(result.xpEarned * (focusMultiplier - 1));
          if (bonusXP > 0) {
            (xpSystem as { addDirectXP: (xp: number) => void }).addDirectXP(bonusXP);
            result.xpEarned += bonusXP;
          }
        }
      } catch (error) {
        timerLogger.error('Failed to award XP:', error);
      }
    }

    // Award focus bonus coins
    if (focusMultiplier > 1.0 && sessionInfo.sessionType !== 'break' && coinSystem) {
      const bonusCoins = focusMultiplier === FOCUS_BONUS.PERFECT_FOCUS.multiplier
        ? FOCUS_BONUS.PERFECT_FOCUS.coinBonus
        : FOCUS_BONUS.GOOD_FOCUS.coinBonus;
      coinSystem.addCoins(bonusCoins);
      result.coinsEarned = bonusCoins;
    }

    // Dispatch achievement tracking event for focus sessions
    if (sessionInfo.sessionType !== 'break' && completedMinutes >= 1) {
      dispatchAchievementEvent(ACHIEVEMENT_EVENTS.FOCUS_SESSION_COMPLETE, {
        minutes: completedMinutes,
        hasNotes: false,
      });
    }

    return result;
  }, [awardXP, coinSystem, xpSystem]);

  /**
   * Show focus bonus toast notification
   */
  const showFocusBonusToast = useCallback((focusBonusType: string) => {
    if (!focusBonusType) return;

    const isPerfect = focusBonusType === FOCUS_BONUS.PERFECT_FOCUS.label;
    toast.success(`${focusBonusType}!`, {
      description: isPerfect
        ? FOCUS_BONUS.PERFECT_FOCUS.description
        : FOCUS_BONUS.GOOD_FOCUS.description,
      duration: 4000,
    });
  }, []);

  return {
    awardSessionRewards,
    showFocusBonusToast,
  };
}
