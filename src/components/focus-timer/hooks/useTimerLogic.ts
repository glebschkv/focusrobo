/**
 * useTimerLogic Hook
 *
 * Main timer orchestration hook that composes smaller focused hooks.
 * Coordinates timer state, controls, countdown, rewards, and breaks.
 *
 * Extracted hooks:
 * - useTimerPersistence: State persistence to localStorage
 * - useTimerRewards: XP/coin rewards for sessions
 * - useSessionNotes: Post-session reflection notes
 * - useBreakTransition: Break modal and auto-break logic
 * - useTimerControls: Timer start/pause/stop/skip actions
 * - useTimerCountdown: Countdown interval and visibility handling
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from 'sonner';
import { useBackendAppState } from "@/hooks/useBackendAppState";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useDeviceActivity } from "@/hooks/useDeviceActivity";
import { useStreakSystem } from "@/hooks/useStreakSystem";
import { useNotifications } from "@/hooks/useNotifications";
import { TimerPreset, MAX_COUNTUP_DURATION } from "../constants";
import { useTimerPersistence } from "./useTimerPersistence";
import { useSoundMixer } from "@/hooks/useSoundMixer";
import { useTimerRewards } from "./useTimerRewards";
import { useSessionNotes } from "./useSessionNotes";
import { useBreakTransition } from "./useBreakTransition";
import { useTimerControls } from "./useTimerControls";
import { useTimerCountdown } from "./useTimerCountdown";
import { timerLogger } from "@/lib/logger";
import { playSoundEffect } from "@/hooks/useSoundEffects";
import { widgetDataService } from "@/plugins/widget-data";
import { DeviceActivity } from "@/plugins/device-activity";
import { markBlockingStopped } from "@/hooks/useTimerExpiryGuard";
import { useLandStore, type PendingPet, type PendingEgg } from "@/stores/landStore";
import { useNavigationStore } from "@/stores/navigationStore";
import { useMilestoneCelebrations } from "@/hooks/useMilestoneCelebrations";
import type { Milestone } from "@/data/GamificationData";
import { usePremiumStore } from "@/stores/premiumStore";
import { useQuestStore } from "@/stores/questStore";
import { useStreakStore } from "@/stores/streakStore";
import { WEEKLY_CHALLENGES } from "@/data/GamificationData";
import type { QuestDelta } from "../SessionCompleteView";

export const useTimerLogic = () => {
  const { awardXP, coinSystem, xpSystem } = useBackendAppState();
  const { recordSession, updateSessionMeta } = useAnalytics();
  const { stopAll: stopAmbientSound, isPlaying: isAmbientPlaying } = useSoundMixer();
  const { recordSession: recordStreakSession } = useStreakSystem();
  const { scheduleStreakNotification, scheduleRewardNotification, cancelTimerCompletionNotification } = useNotifications();

  // Composed hooks
  const { awardSessionRewards, showFocusBonusToast } = useTimerRewards();
  const { checkMilestone } = useMilestoneCelebrations();
  const { saveSessionNote } = useSessionNotes();
  const {
    showBreakModal: showBreakTransitionModal,
    autoBreakEnabled,
    openBreakModal,
    closeBreakModal,
    getBreakPreset,
    toggleAutoBreak,
    handleSkipBreak: breakSkipHandler,
  } = useBreakTransition();

  // App blocking integration
  const {
    isPermissionGranted: appBlockingEnabled,
    hasAppsConfigured,
    blockedAppsCount,
    startAppBlocking,
    stopAppBlocking,
    triggerHaptic,
  } = useDeviceActivity();

  const {
    timerState,
    selectedPreset,
    setSelectedPreset,
    saveTimerState,
    clearPersistence
  } = useTimerPersistence();

  // Local state
  const [displayTime, setDisplayTime] = useState<number>(timerState.timeLeft);
  const [elapsedTime, setElapsedTime] = useState<number>(timerState.elapsedTime || 0);
  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [showSessionNotesModal, setShowSessionNotesModal] = useState(false);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [lastPlacedPet, setLastPlacedPet] = useState<PendingPet | null>(null);
  const [lastPlacedCellIndex, setLastPlacedCellIndex] = useState(-1);
  const [pendingSessionEgg, setPendingSessionEgg] = useState<PendingEgg | null>(null);
  const [lastSessionXP, setLastSessionXP] = useState(0);
  const [lastCoinsEarned, setLastCoinsEarned] = useState(0);
  const [lastSessionTaskLabel, setLastSessionTaskLabel] = useState<string | undefined>();
  const [lastSessionDuration, setLastSessionDuration] = useState(0);
  const [lastQuestDeltas, setLastQuestDeltas] = useState<QuestDelta[]>([]);
  const [lastDailySweepCompleted, setLastDailySweepCompleted] = useState(false);
  const [lastStreakDay, setLastStreakDay] = useState(0);
  const [lastLevelUpInfo, setLastLevelUpInfo] = useState<{ newLevel: number; oldLevel: number; unlockedRewards: Array<{ name: string; description: string }> } | null>(null);
  const [lastMilestoneInfo, setLastMilestoneInfo] = useState<Milestone | null>(null);
  const [lastFocusBonusType, setLastFocusBonusType] = useState('');
  // Preserve category/taskLabel/sessionId for session notes — handleComplete clears
  // them from timerState before the notes modal opens, so we snapshot here.
  const lastSessionMetaRef = useRef<{ category?: string; taskLabel?: string; sessionDuration: number; sessionId?: string }>({
    sessionDuration: timerState.sessionDuration,
  });

  // Refs for stable timer management
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // SECURITY: Async lock to prevent race conditions in timer completion
  const completionLockRef = useRef<Promise<void> | null>(null);
  const completionIdRef = useRef<string | null>(null);

  // Store latest values in refs to avoid callback dependency bloat
  const stateRef = useRef({
    timerState,
    hasAppsConfigured,
    blockedAppsCount,
    isAmbientPlaying,
  });

  useEffect(() => {
    stateRef.current = {
      timerState,
      hasAppsConfigured,
      blockedAppsCount,
      isAmbientPlaying,
    };
  });

  // ============================================================================
  // PRESET SELECTION
  // ============================================================================

  const setPreset = useCallback((preset: TimerPreset) => {
    if (!stateRef.current.timerState.isRunning) {
      triggerHaptic('light');
      setSelectedPreset(preset);

      if (preset.isCountup) {
        // Countup mode: start at 0, max duration is 6 hours
        setElapsedTime(0);
        setDisplayTime(0);
        saveTimerState({
          timeLeft: 0,
          elapsedTime: 0,
          sessionDuration: MAX_COUNTUP_DURATION,
          sessionType: 'countup',
          isRunning: false,
          startTime: null,
          isCountup: true,
        });
      } else {
        // Countdown mode: start at preset duration
        const newTimeLeft = preset.duration * 60;
        setDisplayTime(newTimeLeft);
        setElapsedTime(0);
        saveTimerState({
          timeLeft: newTimeLeft,
          elapsedTime: 0,
          sessionDuration: preset.duration * 60,
          sessionType: preset.type,
          isRunning: false,
          startTime: null,
          isCountup: false,
        });
      }
    }
  }, [setSelectedPreset, saveTimerState, triggerHaptic]);

  // ============================================================================
  // SESSION COMPLETION
  // ============================================================================

  const handleComplete = useCallback(async () => {
    const state = stateRef.current;

    // Guard: if the timer was already stopped/reset by stopTimer or skipTimer,
    // bail out. This prevents double-completion when the tick fires at 0:00
    // concurrently with the user pressing Stop.
    if (!state.timerState.isRunning) {
      timerLogger.debug('handleComplete: timer not running, skipping');
      return;
    }

    // SECURITY: Prevent race conditions with async lock pattern
    const completionId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    if (completionLockRef.current) {
      await completionLockRef.current;
      // After waiting for the lock, re-check if timer is still running
      // (stopTimer may have run while we waited)
      if (!stateRef.current.timerState.isRunning) {
        timerLogger.debug('handleComplete: timer stopped while waiting for lock');
        return;
      }
      if (completionIdRef.current && completionIdRef.current !== completionId) {
        return;
      }
    }

    completionIdRef.current = completionId;

    let releaseLock: (() => void) | undefined;
    completionLockRef.current = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    try {
      // For countup mode, compute elapsed from startTime directly (the periodically-
      // saved elapsedTime can be up to 4s stale). For countdown, use full session duration.
      const actualSeconds = state.timerState.isCountup
        ? Math.min(
            state.timerState.startTime
              ? Math.floor((Date.now() - state.timerState.startTime) / 1000)
              : (state.timerState.elapsedTime || 0),
            MAX_COUNTUP_DURATION
          )
        : state.timerState.sessionDuration;
      const completedMinutes = actualSeconds / 60;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Cancel the OS-scheduled notification — the in-app completion UI is showing instead
      cancelTimerCompletionNotification();

      // NOTE: clearPersistence() is intentionally NOT called here.
      // It runs after rewards/recording so that if iOS kills the WebView
      // during async work below, the timer is still marked "running" on
      // relaunch and the expiry guard will stop blocking. The session can
      // then be re-completed rather than silently lost.

      let shieldAttempts = 0;
      if (state.timerState.sessionType !== 'break') {
        // Mark blocking as stopped FIRST so the expiry guard won't try to
        // stop it again if the WebView reloads during cleanup
        markBlockingStopped();
        // Always attempt to stop blocking — don't rely on hasAppsConfigured
        // which can be stale if plugin init had issues
        let blockingStopped = false;
        try {
          const blockingResult = await stopAppBlocking();
          shieldAttempts = blockingResult.shieldAttempts;
          blockingStopped = blockingResult.success;
        } catch (e) {
          timerLogger.error('Failed to stop app blocking via hook:', e);
        }

        // Fallback: direct plugin call if hook-based call failed or bailed
        if (!blockingStopped) {
          try {
            await DeviceActivity.stopAppBlocking();
            timerLogger.info('Stopped app blocking via direct plugin call fallback');
          } catch {
            // Plugin not available — nothing more we can do
          }
        }
      }

      if (state.isAmbientPlaying) {
        stopAmbientSound();
      }

      if (state.timerState.soundEnabled) {
        playSoundEffect('timerComplete');
      }

      // Snapshot quest progress before rewards are applied
      const questSnapshot = state.timerState.sessionType !== 'break'
        ? useQuestStore.getState().quests
            .filter(q => !q.isCompleted && (!q.expiresAt || q.expiresAt > Date.now()))
            .map(q => ({
              id: q.id,
              title: q.title,
              pct: q.objectives.length > 0
                ? q.objectives.reduce((sum, o) => sum + Math.min(o.current / o.target, 1), 0) / q.objectives.length * 100
                : 0,
            }))
        : [];

      let xpEarned = 0;
      let coinsEarned = 0;
      let capturedMilestone: Milestone | null = null;
      if (state.timerState.sessionType !== 'break') {
        const rewardResult = await awardSessionRewards(
          completedMinutes,
          shieldAttempts,
          state.hasAppsConfigured,
          state.blockedAppsCount,
          {
            sessionType: state.timerState.sessionType,
            sessionDuration: state.timerState.sessionDuration,
            category: state.timerState.category,
            taskLabel: state.timerState.taskLabel,
          }
        );

        xpEarned = rewardResult.xpEarned;
        coinsEarned = rewardResult.coinsEarned;

        // Capture level-up info for inline display in SessionCompleteView
        if (rewardResult.leveledUp) {
          setLastLevelUpInfo({
            newLevel: rewardResult.newLevel,
            oldLevel: rewardResult.oldLevel,
            unlockedRewards: rewardResult.unlockedRewards,
          });

          // Check for level milestones (shown inline instead of separate modal)
          capturedMilestone = checkMilestone('level', rewardResult.newLevel);
          if (capturedMilestone) {
            setLastMilestoneInfo(capturedMilestone);
          }
        } else {
          setLastLevelUpInfo(null);
          setLastMilestoneInfo(null);
        }

        // Capture focus bonus type for inline card
        setLastFocusBonusType(rewardResult.focusBonusType);

        if (rewardResult.focusBonusType === 'PERFECT FOCUS') {
          triggerHaptic('success');
        }

        showFocusBonusToast(rewardResult.focusBonusType);
      }

      // Determine focus quality from shield attempts
      // When app blocking isn't configured, quality is undefined (neutral) rather
      // than 'distracted' — users shouldn't be penalized for not using app blocking
      const focusQuality = state.timerState.sessionType !== 'break'
        ? (state.hasAppsConfigured
            ? (shieldAttempts === 0
                ? 'perfect' as const
                : shieldAttempts <= 2
                  ? 'good' as const
                  : 'distracted' as const)
            : undefined)
        : undefined;

      // For countup, plannedDuration = actualDuration (no plan); for countdown, use full session duration
      const actualDuration = actualSeconds;
      const plannedDuration = state.timerState.isCountup
        ? actualDuration
        : state.timerState.sessionDuration;

      const recordedSession = recordSession(
        state.timerState.sessionType,
        plannedDuration,
        actualDuration,
        'completed',
        xpEarned,
        state.timerState.category,
        state.timerState.taskLabel,
        state.timerState.sessionType !== 'break' ? shieldAttempts : undefined,
        focusQuality,
        state.hasAppsConfigured,
      );

      // Update streak system and trigger notifications for work sessions
      if (state.timerState.sessionType !== 'break') {
        const streakReward = recordStreakSession();
        if (streakReward) {
          scheduleStreakNotification(streakReward.milestone);

          // Apply streak milestone bonuses (XP and coins)
          if (streakReward.xpBonus && xpSystem && 'addDirectXP' in xpSystem) {
            (xpSystem as { addDirectXP: (xp: number) => void }).addDirectXP(streakReward.xpBonus);
          }
          if (streakReward.coinBonus && coinSystem) {
            coinSystem.addCoins(streakReward.coinBonus);
          }

          // Check for streak milestone (show inline if no level milestone already captured)
          if (!capturedMilestone) {
            const currentStreak = useStreakStore.getState().currentStreak;
            const streakMilestone = checkMilestone('streak', currentStreak);
            if (streakMilestone) {
              capturedMilestone = streakMilestone;
              setLastMilestoneInfo(streakMilestone);
            }
          }
        }
        if (xpEarned > 0) {
          scheduleRewardNotification(xpEarned);
        }
      }

      // Update daily + weekly challenge progress
      if (state.timerState.sessionType !== 'break' && completedMinutes >= 1) {
        const questStoreState = useQuestStore.getState();
        questStoreState.updateDailyChallengeProgress('sessions', 1);
        questStoreState.updateDailyChallengeProgress('focus_time', completedMinutes);
        questStoreState.updateWeeklyChallengeProgress('sessions', 1);
        questStoreState.updateWeeklyChallengeProgress('focus_time', completedMinutes);
        if (shieldAttempts === 0 && state.hasAppsConfigured) {
          questStoreState.updateDailyChallengeProgress('perfect_focus', 1);
          questStoreState.updateWeeklyChallengeProgress('perfect_focus', 1);
        }
        // For streak-type weekly challenges, set progress to current streak value
        const currentStreak = useStreakStore.getState().currentStreak;
        if (currentStreak > 0) {
          const wc = questStoreState.getWeeklyChallenge();
          if (wc && !wc.completed) {
            const template = WEEKLY_CHALLENGES.find(c => c.id === wc.templateId);
            if (template?.objectiveType === 'streak' && currentStreak > wc.progress) {
              questStoreState.updateWeeklyChallengeProgress('streak', currentStreak - wc.progress);
            }
          }
        }
      }

      // Generate a session egg reward for work sessions (≥25 min)
      if (state.timerState.sessionType !== 'break' && completedMinutes >= 25) {
        try {
          const playerLevel = xpSystem?.currentLevel ?? 1;
          const egg = useLandStore.getState().generateSessionEgg(completedMinutes, playerLevel);
          setPendingSessionEgg(egg);
        } catch (e) {
          timerLogger.error('Failed to generate session egg:', e);
        }
      }

      // All critical async work (rewards, recording, streak) is done.
      // NOW clear persistence so the timer won't re-complete on WebView reload.
      clearPersistence();

      // Sync completed session to widgets: stop the timer, then pull
      // accumulated totals (streak, progress, stats) from localStorage
      widgetDataService.updateTimer({
        isRunning: false,
        timeRemaining: 0,
        sessionType: null,
        startTime: null,
      }).catch(e => timerLogger.error('Widget timer sync failed:', e));

      // Full sync picks up updated streak, daily progress, and XP/stats
      // from the stores that were just written above.
      widgetDataService.syncFromAppState()
        .catch(e => timerLogger.error('Widget full sync failed:', e));

      // Reset display based on mode
      if (state.timerState.isCountup) {
        // For countup, reset to 0
        setElapsedTime(0);
        setDisplayTime(0);
        saveTimerState({
          isRunning: false,
          timeLeft: 0,
          elapsedTime: 0,
          startTime: null,
          completedSessions: state.timerState.completedSessions + 1,
          category: undefined,
          taskLabel: undefined,
        });
      } else {
        // For countdown, reset to session duration
        setDisplayTime(state.timerState.sessionDuration);
        saveTimerState({
          isRunning: false,
          timeLeft: state.timerState.sessionDuration,
          startTime: null,
          completedSessions: state.timerState.completedSessions + 1,
          category: undefined,
          taskLabel: undefined,
        });
      }

      if (state.timerState.sessionType !== 'break') {
        // Snapshot metadata BEFORE it gets cleared by saveTimerState below
        lastSessionMetaRef.current = {
          category: state.timerState.category,
          taskLabel: state.timerState.taskLabel,
          sessionDuration: state.timerState.sessionDuration,
          sessionId: recordedSession?.id,
        };
        setLastSessionXP(xpEarned);
        setLastCoinsEarned(coinsEarned);
        setLastSessionTaskLabel(state.timerState.taskLabel);
        setLastSessionDuration(actualSeconds);

        // Compute quest deltas by comparing snapshot to current state
        const currentQuests = useQuestStore.getState().quests;
        const deltas: QuestDelta[] = [];
        for (const snap of questSnapshot) {
          const current = currentQuests.find(q => q.id === snap.id);
          if (!current) continue;
          const newPct = current.objectives.length > 0
            ? current.objectives.reduce((sum, o) => sum + Math.min(o.current / o.target, 1), 0) / current.objectives.length * 100
            : 0;
          if (newPct > snap.pct || current.isCompleted) {
            const coinReward = current.isCompleted
              ? current.rewards.filter(r => r.type === 'coins').reduce((sum, r) => sum + (r.amount || 0), 0)
              : undefined;
            deltas.push({
              name: snap.title,
              oldPct: snap.pct,
              newPct,
              completed: current.isCompleted,
              coinReward,
            });
          }
        }
        setLastQuestDeltas(deltas);

        // Check if daily sweep was just completed
        const questState = useQuestStore.getState();
        const today = new Date().toDateString();
        setLastDailySweepCompleted(questState.dailySweepClaimed && questState.dailySweepClaimedDate === today);

        setLastStreakDay(useStreakStore.getState().currentStreak);

        setShowSessionComplete(true);
        useNavigationStore.getState().setSessionRewardsActive(true);
      } else {
        toast.info('Break Complete!', {
          description: 'Time to get back to work!',
          duration: 3000,
        });
      }
    } finally {
      completionLockRef.current = null;
      if (releaseLock) releaseLock();
    }
  }, [
    clearPersistence,
    stopAppBlocking,
    stopAmbientSound,
    awardSessionRewards,
    showFocusBonusToast,
    recordSession,
    recordStreakSession,
    scheduleStreakNotification,
    scheduleRewardNotification,
    cancelTimerCompletionNotification,
    saveTimerState,
    triggerHaptic,
    coinSystem,
    xpSystem,
    checkMilestone,
  ]);

  // ============================================================================
  // TIMER CONTROLS (Composed)
  // ============================================================================

  const {
    requestStartTimer,
    startTimerWithIntent,
    pauseTimer,
    stopTimer,
    skipTimer,
    toggleSound,
  } = useTimerControls({
    timerState,
    selectedPreset,
    saveTimerState,
    clearPersistence,
    setDisplayTime,
    setShowIntentionModal,
    intervalRef,
    appBlockingEnabled,
    hasAppsConfigured,
    blockedAppsCount,
    startAppBlocking,
    stopAppBlocking,
    triggerHaptic,
    awardXP,
  });

  // ============================================================================
  // TIMER COUNTDOWN (Composed)
  // ============================================================================

  useTimerCountdown({
    timerState,
    saveTimerState,
    setDisplayTime,
    setElapsedTime,
    setShowLockScreen,
    handleComplete,
    intervalRef,
  });

  // ============================================================================
  // SESSION NOTES
  // ============================================================================

  const handleSessionNotesSave = useCallback((notes: string, rating: number) => {
    // Use the snapshot taken before handleComplete cleared the metadata
    const meta = lastSessionMetaRef.current;

    saveSessionNote({
      notes,
      rating,
      sessionDuration: meta.sessionDuration,
      category: meta.category,
      taskLabel: meta.taskLabel,
      xpEarned: lastSessionXP,
    });

    // Link rating and hasNotes back to the session record for analytics
    if (meta.sessionId) {
      updateSessionMeta(meta.sessionId, {
        rating,
        hasNotes: notes.trim().length > 0,
      });
    }

    setShowSessionNotesModal(false);
    setTimeout(() => openBreakModal(), 350);
  }, [saveSessionNote, lastSessionXP, openBreakModal, updateSessionMeta]);

  // ============================================================================
  // UNIFIED SESSION COMPLETE DISMISS
  // ============================================================================

  const handleSessionCompleteDismiss = useCallback((notes: string, rating: number) => {
    // Save session notes (same logic as handleSessionNotesSave)
    const meta = lastSessionMetaRef.current;
    saveSessionNote({
      notes,
      rating,
      sessionDuration: meta.sessionDuration,
      category: meta.category,
      taskLabel: meta.taskLabel,
      xpEarned: lastSessionXP,
    });
    if (meta.sessionId) {
      updateSessionMeta(meta.sessionId, {
        rating,
        hasNotes: notes.trim().length > 0,
      });
    }

    // Auto-hatch egg if user dismisses before animation finishes
    if (pendingSessionEgg) {
      const store = useLandStore.getState();
      const pet = store.hatchSessionEgg();
      if (pet) {
        store.placePendingPet();
      }
    }

    // Clean up pet/egg state and session reward data
    setLastPlacedPet(null);
    setLastPlacedCellIndex(-1);
    setPendingSessionEgg(null);
    setLastLevelUpInfo(null);
    setLastMilestoneInfo(null);
    setLastFocusBonusType('');
    setShowSessionComplete(false);
    useNavigationStore.getState().setSessionRewardsActive(false);
  }, [saveSessionNote, lastSessionXP, updateSessionMeta, pendingSessionEgg]);

  const handleSessionCompleteTakeBreak = useCallback(() => {
    openBreakModal();
  }, [openBreakModal]);

  // ============================================================================
  // BREAK HANDLING
  // ============================================================================

  const handleHatchEgg = useCallback(() => {
    const pet = useLandStore.getState().hatchSessionEgg();
    if (pet) {
      const cellIndex = useLandStore.getState().placePendingPet();
      setLastPlacedPet(pet);
      setLastPlacedCellIndex(cellIndex);
      setPendingSessionEgg(null);
    }
  }, []);

  const handleGoToIsland = useCallback(() => {
    // Dismiss the session complete view
    setShowSessionComplete(false);
    setLastPlacedPet(null);
    setPendingSessionEgg(null);

    // Switch to home tab and signal PetLand to focus on the new pet
    useNavigationStore.getState().setActiveTab('home');
    if (lastPlacedCellIndex >= 0) {
      window.dispatchEvent(new CustomEvent('goToPet', {
        detail: { cellIndex: lastPlacedCellIndex },
      }));
    }
    setLastPlacedCellIndex(-1);
  }, [lastPlacedCellIndex]);

  const handleStartBreak = useCallback((duration: number) => {
    closeBreakModal();

    const breakPreset = getBreakPreset(duration);
    if (breakPreset) {
      setSelectedPreset(breakPreset);
      const newTimeLeft = duration * 60;
      setDisplayTime(newTimeLeft);

      if (autoBreakEnabled) {
        const now = Date.now();
        saveTimerState({
          timeLeft: newTimeLeft,
          sessionDuration: newTimeLeft,
          sessionType: 'break',
          isRunning: true,
          startTime: now,
          category: undefined,
          taskLabel: undefined,
        });
      } else {
        saveTimerState({
          timeLeft: newTimeLeft,
          sessionDuration: newTimeLeft,
          sessionType: 'break',
          isRunning: false,
          startTime: null,
          category: undefined,
          taskLabel: undefined,
        });
      }
    }
  }, [closeBreakModal, getBreakPreset, setSelectedPreset, saveTimerState, autoBreakEnabled]);

  const handleSkipBreak = useCallback(() => {
    breakSkipHandler();
  }, [breakSkipHandler]);

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    // State
    timerState,
    displayTime,
    elapsedTime,
    selectedPreset,
    showIntentionModal,
    showLockScreen,
    showSessionNotesModal,
    showSessionComplete,
    showBreakTransitionModal,
    lastPlacedPet,
    lastPlacedCellIndex,
    pendingSessionEgg,
    lastSessionXP,
    lastCoinsEarned,
    lastSessionTaskLabel,
    lastSessionDuration,
    lastQuestDeltas,
    lastDailySweepCompleted,
    lastStreakDay,
    lastLevelUpInfo,
    lastMilestoneInfo,
    lastFocusBonusType,
    autoBreakEnabled,

    // Actions
    setPreset,
    requestStartTimer,
    startTimerWithIntent,
    pauseTimer,
    stopTimer,
    skipTimer,
    toggleSound,
    handleSessionNotesSave,
    handleHatchEgg,
    handleGoToIsland,
    handleSessionCompleteDismiss,
    handleSessionCompleteTakeBreak,
    handleStartBreak,
    handleSkipBreak,
    toggleAutoBreak,
    setShowIntentionModal,
    setShowSessionNotesModal,
    setShowSessionComplete,
    setShowBreakTransitionModal: (show: boolean) => { if (show) openBreakModal(); else closeBreakModal(); },
    setShowLockScreen,
  };
};
