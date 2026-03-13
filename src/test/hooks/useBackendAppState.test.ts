import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBackendAppState } from '@/hooks/useBackendAppState';

// Mock all the subsystem hooks
vi.mock('@/lib/logger', () => {
  const l = () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() });
  return {
    logger: l(),
    createLogger: () => l(),
    xpLogger: l(),
    coinLogger: l(),
    shopLogger: l(),
    storageLogger: l(),
    supabaseLogger: l(),
    authLogger: l(),
    storeKitLogger: l(),
    notificationLogger: l(),
    syncLogger: l(),
    deviceActivityLogger: l(),
    focusModeLogger: l(),
    widgetLogger: l(),
    backupLogger: l(),
    threeLogger: l(),
    timerLogger: l(),
    questLogger: l(),
    achievementLogger: l(),
    bondLogger: l(),
    streakLogger: l(),
    soundLogger: l(),
    performanceLogger: l(),
    appReviewLogger: l(),
    settingsLogger: l(),
    collectionLogger: l(),
    nativePluginLogger: l(),
    analyticsLogger: l(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-123' },
    isAuthenticated: true,
    isGuestMode: false,
  })),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
  isSupabaseConfigured: false, // Disable real-time for tests
}));

// Mock XP System
const mockXPSystem = {
  currentXP: 500,
  currentLevel: 5,
  xpToNextLevel: 100,
  totalXPForCurrentLevel: 400,
  isLoading: false,
  awardXP: vi.fn(() => ({
    xpGained: 50,
    oldLevel: 5,
    newLevel: 5,
    leveledUp: false,
    unlockedRewards: [],
  })),
  getLevelProgress: vi.fn(() => 50),
};

vi.mock('@/hooks/useXPSystem', () => ({
  useXPSystem: vi.fn(() => mockXPSystem),
}));

// Mock Achievement System
const mockAchievements = {
  achievements: [{ id: '1' }, { id: '2' }],
  unlockedAchievements: [{ id: '1' }],
  isLoading: false,
  getTotalAchievementPoints: vi.fn(() => 100),
  checkAndUnlockAchievements: vi.fn(),
  loadAchievements: vi.fn(),
};

vi.mock('@/hooks/useAchievementSystem', () => ({
  useAchievementSystem: vi.fn(() => mockAchievements),
}));

// Mock Quests
const mockQuests = {
  activeQuests: [{ id: 'q1' }],
  completedQuests: [{ id: 'q2' }, { id: 'q3' }],
  isLoading: false,
  updateQuestProgress: vi.fn(),
};

vi.mock('@/hooks/useBackendQuests', () => ({
  useBackendQuests: vi.fn(() => mockQuests),
}));

// Mock Streaks
const mockStreaks = {
  streakData: {
    currentStreak: 7,
    longestStreak: 14,
    streakFreezeCount: 2,
  },
  isLoading: false,
  recordSession: vi.fn(() => Promise.resolve({ streakIncreased: true })),
};

vi.mock('@/hooks/useBackendStreaks', () => ({
  useBackendStreaks: vi.fn(() => mockStreaks),
}));

// Mock Supabase Data
const mockSupabaseData = {
  profile: { id: 'profile-1', display_name: 'Test User' },
  progress: { total_xp: 500, current_level: 5 },
  loadUserData: vi.fn(),
};

vi.mock('@/hooks/useSupabaseData', () => ({
  useSupabaseData: vi.fn(() => mockSupabaseData),
}));

// Mock Coin System
const mockCoinSystem = {
  balance: 1000,
  totalEarned: 2500,
  totalSpent: 1500,
  awardCoins: vi.fn(() => ({ coinsGained: 25 })),
};

vi.mock('@/hooks/useCoinSystem', () => ({
  useCoinSystem: vi.fn(() => mockCoinSystem),
}));

// Mock Coin Booster
const mockCoinBooster = {
  activeBooster: null,
  isBoosterActive: vi.fn(() => false),
  getCurrentMultiplier: vi.fn(() => 1),
  getTimeRemainingFormatted: vi.fn(() => '00:00'),
};

vi.mock('@/hooks/useCoinBooster', () => ({
  useCoinBooster: vi.fn(() => mockCoinBooster),
}));

describe('useBackendAppState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return all subsystem data', () => {
      const { result } = renderHook(() => useBackendAppState());

      // XP data
      expect(result.current.currentXP).toBe(500);
      expect(result.current.currentLevel).toBe(5);
      expect(result.current.xpToNextLevel).toBe(100);

      // Coin data
      expect(result.current.coinBalance).toBe(1000);
      expect(result.current.totalCoinsEarned).toBe(2500);
      expect(result.current.totalCoinsSpent).toBe(1500);

      // Achievement data
      expect(result.current.totalAchievements).toBe(2);
      expect(result.current.unlockedAchievements).toBe(1);

      // Quest data
      expect(result.current.activeQuests).toBe(1);
      expect(result.current.completedQuests).toBe(2);

      // Streak data
      expect(result.current.currentStreak).toBe(7);
      expect(result.current.longestStreak).toBe(14);
      expect(result.current.streakFreezes).toBe(2);
    });

    it('should provide access to subsystems', () => {
      const { result } = renderHook(() => useBackendAppState());

      expect(result.current.xpSystem).toBeDefined();
      expect(result.current.achievements).toBeDefined();
      expect(result.current.quests).toBeDefined();
      expect(result.current.streaks).toBeDefined();
      expect(result.current.supabaseData).toBeDefined();
      expect(result.current.coinSystem).toBeDefined();
      expect(result.current.coinBooster).toBeDefined();
    });

    it('should provide main action functions', () => {
      const { result } = renderHook(() => useBackendAppState());

      expect(typeof result.current.awardXP).toBe('function');
      expect(typeof result.current.getLevelProgress).toBe('function');
      expect(typeof result.current.getAppState).toBe('function');
    });
  });

  describe('getAppState', () => {
    it('should return memoized app state', () => {
      const { result } = renderHook(() => useBackendAppState());

      const state1 = result.current.getAppState();
      const state2 = result.current.getAppState();

      // Should return same reference (memoized)
      expect(state1).toBe(state2);
    });

    it('should include all state properties', () => {
      const { result } = renderHook(() => useBackendAppState());

      const state = result.current.getAppState();

      // XP properties
      expect(state).toHaveProperty('currentXP');
      expect(state).toHaveProperty('currentLevel');
      expect(state).toHaveProperty('xpToNextLevel');
      expect(state).toHaveProperty('levelProgress');

      // Coin properties
      expect(state).toHaveProperty('coinBalance');
      expect(state).toHaveProperty('totalCoinsEarned');
      expect(state).toHaveProperty('totalCoinsSpent');

      // Booster properties
      expect(state).toHaveProperty('isBoosterActive');
      expect(state).toHaveProperty('activeBooster');
      expect(state).toHaveProperty('boosterMultiplier');
      expect(state).toHaveProperty('boosterTimeRemaining');

      // Achievement properties
      expect(state).toHaveProperty('totalAchievements');
      expect(state).toHaveProperty('unlockedAchievements');
      expect(state).toHaveProperty('achievementPoints');

      // Quest properties
      expect(state).toHaveProperty('activeQuests');
      expect(state).toHaveProperty('completedQuests');

      // Streak properties
      expect(state).toHaveProperty('currentStreak');
      expect(state).toHaveProperty('longestStreak');
      expect(state).toHaveProperty('streakFreezes');

      // Backend data
      expect(state).toHaveProperty('profile');
      expect(state).toHaveProperty('progress');

      // Loading state
      expect(state).toHaveProperty('isLoading');
    });
  });

  describe('getLevelProgress', () => {
    it('should return level progress from XP system', () => {
      const { result } = renderHook(() => useBackendAppState());

      const progress = result.current.getLevelProgress();

      expect(mockXPSystem.getLevelProgress).toHaveBeenCalled();
      expect(progress).toBe(50);
    });
  });

  describe('awardXP', () => {
    it('should award XP and return result', async () => {
      const { result } = renderHook(() => useBackendAppState());

      let xpResult: unknown;
      await act(async () => {
        xpResult = await result.current.awardXP(25);
      });

      expect(xpResult).not.toBeNull();
      expect((xpResult as { xpGained: number }).xpGained).toBe(50);
    });

    it('should award coins with session', async () => {
      const { result } = renderHook(() => useBackendAppState());

      await act(async () => {
        await result.current.awardXP(25);
      });

      expect(mockCoinSystem.awardCoins).toHaveBeenCalledWith(25, 1);
    });

    it('should not record streak (handled by useTimerLogic)', async () => {
      const { result } = renderHook(() => useBackendAppState());

      await act(async () => {
        await result.current.awardXP(25);
      });

      // Streak recording is handled exclusively by useTimerLogic.handleComplete()
      expect(mockStreaks.recordSession).not.toHaveBeenCalled();
    });

    it('should update quest progress', async () => {
      const { result } = renderHook(() => useBackendAppState());

      await act(async () => {
        await result.current.awardXP(30);
      });

      expect(mockQuests.updateQuestProgress).toHaveBeenCalledWith('focus_time', 30);
    });

    it('should return coin reward in result', async () => {
      const { result } = renderHook(() => useBackendAppState());

      let xpResult: unknown;
      await act(async () => {
        xpResult = await result.current.awardXP(25);
      });

      expect((xpResult as { coinReward: number }).coinReward).toBeDefined();
    });

    it('should include unlocked rewards in result', async () => {
      const { result } = renderHook(() => useBackendAppState());

      let xpResult: unknown;
      await act(async () => {
        xpResult = await result.current.awardXP(25);
      });

      expect((xpResult as { unlockedRewards: unknown[] }).unlockedRewards).toBeDefined();
      expect(Array.isArray((xpResult as { unlockedRewards: unknown[] }).unlockedRewards)).toBe(true);
    });
  });

  describe('Booster Integration', () => {
    it('should reflect booster status in state', () => {
      const { result } = renderHook(() => useBackendAppState());

      expect(result.current.isBoosterActive).toBe(false);
      expect(result.current.boosterMultiplier).toBe(1);
    });

    it('should apply booster multiplier to coin rewards', async () => {
      mockCoinBooster.getCurrentMultiplier.mockReturnValue(2);

      const { result } = renderHook(() => useBackendAppState());

      await act(async () => {
        await result.current.awardXP(25);
      });

      expect(mockCoinSystem.awardCoins).toHaveBeenCalledWith(25, 2);
    });
  });

  describe('Loading State', () => {
    it('should aggregate loading states from subsystems', () => {
      const { result } = renderHook(() => useBackendAppState());

      // All subsystems have isLoading: false in mocks
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Backend Data Access', () => {
    it('should provide profile data', () => {
      const { result } = renderHook(() => useBackendAppState());

      expect(result.current.profile).toEqual({
        id: 'profile-1',
        display_name: 'Test User',
      });
    });

    it('should provide progress data', () => {
      const { result } = renderHook(() => useBackendAppState());

      expect(result.current.progress).toEqual({
        total_xp: 500,
        current_level: 5,
      });
    });
  });

  describe('Achievement Points', () => {
    it('should return achievement points from system', () => {
      const { result } = renderHook(() => useBackendAppState());
      const state = result.current.getAppState();

      expect(state.achievementPoints).toBe(100);
      expect(mockAchievements.getTotalAchievementPoints).toHaveBeenCalled();
    });
  });
});
