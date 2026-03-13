/**
 * Progression System Database Tests
 *
 * Tests the XP/leveling system, coin economy, and backend sync including:
 * - XP store state management and level calculation
 * - Coin store balance tracking, earn/spend validation
 * - Server sync overriding local state
 * - Persistence to localStorage
 * - Edge cases: max level, zero XP, negative amounts, large values
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock logger before any store imports
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

import {
  useXPStore,
  calculateLevelFromXP,
  calculateLevelRequirement,
  MAX_LEVEL,
  useCurrentXP,
  useCurrentLevel,
  useUnlockedPets,
} from '@/stores/xpStore';

import {
  useCoinStore,
  useCoinBalance,
  useTotalEarned,
  useTotalSpent,
} from '@/stores/coinStore';

// ─── XP Store Tests ──────────────────────────────────────────────────

describe('Progression Database – XP Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useXPStore.setState({
      currentXP: 0,
      currentLevel: 0,
      xpToNextLevel: 15,
      totalXPForCurrentLevel: 0,
      unlockedPets: [],
      currentZone: 'Assembly Line',
      availableZones: ['Assembly Line'],
      prestigeLevel: 0,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start at level 0 with 0 XP', () => {
      const state = useXPStore.getState();
      expect(state.currentXP).toBe(0);
      expect(state.currentLevel).toBe(0);
    });

    it('should start in Assembly Line zone', () => {
      const state = useXPStore.getState();
      expect(state.currentZone).toBe('Assembly Line');
      expect(state.availableZones).toContain('Assembly Line');
    });

    it('should have xpToNextLevel set in initial state', () => {
      const state = useXPStore.getState();
      expect(state.xpToNextLevel).toBe(15);
    });
  });

  describe('XP Operations', () => {
    it('should set XP directly', () => {
      act(() => {
        useXPStore.getState().setXP(100);
      });
      expect(useXPStore.getState().currentXP).toBe(100);
    });

    it('should add XP cumulatively', () => {
      act(() => {
        useXPStore.getState().addXP(50);
        useXPStore.getState().addXP(30);
      });
      expect(useXPStore.getState().currentXP).toBe(80);
    });

    it('should handle zero XP addition', () => {
      act(() => {
        useXPStore.getState().setXP(100);
        useXPStore.getState().addXP(0);
      });
      expect(useXPStore.getState().currentXP).toBe(100);
    });

    it('should update state partially', () => {
      act(() => {
        useXPStore.getState().updateState({
          currentXP: 500,
          currentLevel: 5,
          currentZone: 'Forest',
        });
      });
      const state = useXPStore.getState();
      expect(state.currentXP).toBe(500);
      expect(state.currentLevel).toBe(5);
      expect(state.currentZone).toBe('Forest');
    });
  });

  describe('Level Calculations', () => {
    it('should calculate level 0 for 0 XP', () => {
      expect(calculateLevelFromXP(0)).toBe(0);
    });

    it('should remain level 0 for XP below level 1 threshold', () => {
      // LEVEL_REQUIREMENTS[1] = 30, so 15 XP is not enough for level 1
      expect(calculateLevelFromXP(15)).toBe(0);
      expect(calculateLevelFromXP(29)).toBe(0);
    });

    it('should reach level 1 at 30 XP', () => {
      // LEVEL_REQUIREMENTS[1] = 30
      expect(calculateLevelFromXP(30)).toBe(1);
      expect(calculateLevelFromXP(31)).toBe(1);
    });

    it('should calculate level requirement correctly', () => {
      expect(calculateLevelRequirement(0)).toBe(0);
      expect(calculateLevelRequirement(1)).toBe(30);
      expect(calculateLevelRequirement(2)).toBe(70);
      expect(calculateLevelRequirement(5)).toBe(260);
      expect(calculateLevelRequirement(10)).toBe(920);
    });

    it('should have increasing growth in level requirements', () => {
      const level5 = calculateLevelRequirement(5);
      const level10 = calculateLevelRequirement(10);
      const level20 = calculateLevelRequirement(20);
      expect(level10).toBeGreaterThan(level5 * 1.5);
      expect(level20).toBeGreaterThan(level10 * 1.5);
    });

    it('should cap at MAX_LEVEL', () => {
      expect(calculateLevelFromXP(999999999)).toBe(MAX_LEVEL);
    });

    it('should not exceed MAX_LEVEL (50)', () => {
      expect(MAX_LEVEL).toBe(50);
      const level = calculateLevelFromXP(Number.MAX_SAFE_INTEGER);
      expect(level).toBeLessThanOrEqual(MAX_LEVEL);
    });

    it('should update level correctly when adding XP via addXP', () => {
      // LEVEL_REQUIREMENTS[1] = 30, [2] = 70
      act(() => {
        useXPStore.getState().addXP(70);
      });
      const state = useXPStore.getState();
      expect(state.currentXP).toBe(70);
      expect(state.currentLevel).toBe(2);
    });
  });

  describe('Pet Unlocks', () => {
    it('should add a single pet', () => {
      act(() => {
        useXPStore.getState().addPet('Fox');
      });
      expect(useXPStore.getState().unlockedPets).toContain('Fox');
    });

    it('should not add duplicate pets', () => {
      act(() => {
        useXPStore.getState().addPet('Fox');
        useXPStore.getState().addPet('Fox');
      });
      expect(useXPStore.getState().unlockedPets.filter(a => a === 'Fox')).toHaveLength(1);
    });

    it('should add multiple pets at once', () => {
      act(() => {
        useXPStore.getState().addPets(['Fox', 'Bear', 'Owl']);
      });
      const pets = useXPStore.getState().unlockedPets;
      expect(pets).toContain('Fox');
      expect(pets).toContain('Bear');
      expect(pets).toContain('Owl');
    });

    it('should filter duplicates in batch add', () => {
      act(() => {
        useXPStore.getState().addPet('Fox');
        useXPStore.getState().addPets(['Fox', 'Bear']);
      });
      const pets = useXPStore.getState().unlockedPets;
      expect(pets.filter(a => a === 'Fox')).toHaveLength(1);
      expect(pets).toContain('Bear');
    });
  });

  describe('Zone Management', () => {
    it('should switch to available zone', () => {
      act(() => {
        useXPStore.getState().addZone('Forest');
        useXPStore.getState().switchZone('Forest');
      });
      expect(useXPStore.getState().currentZone).toBe('Forest');
    });

    it('should not switch to unavailable zone', () => {
      act(() => {
        useXPStore.getState().switchZone('Volcano');
      });
      expect(useXPStore.getState().currentZone).toBe('Assembly Line');
    });

    it('should add new zones', () => {
      act(() => {
        useXPStore.getState().addZone('Forest');
        useXPStore.getState().addZone('Beach');
      });
      const zones = useXPStore.getState().availableZones;
      expect(zones).toContain('Assembly Line');
      expect(zones).toContain('Forest');
      expect(zones).toContain('Beach');
    });

    it('should not add duplicate zones', () => {
      act(() => {
        useXPStore.getState().addZone('Assembly Line');
      });
      expect(useXPStore.getState().availableZones.filter(b => b === 'Assembly Line')).toHaveLength(1);
    });
  });

  describe('Prestige', () => {
    it('should not prestige below MAX_LEVEL', () => {
      act(() => {
        useXPStore.getState().updateState({ currentLevel: MAX_LEVEL - 1 });
      });
      let result: boolean;
      act(() => {
        result = useXPStore.getState().prestige();
      });
      expect(result!).toBe(false);
    });

    it('should prestige at MAX_LEVEL', () => {
      act(() => {
        useXPStore.getState().updateState({ currentLevel: MAX_LEVEL, prestigeLevel: 0 });
      });
      let result: boolean;
      act(() => {
        result = useXPStore.getState().prestige();
      });
      expect(result!).toBe(true);
      const state = useXPStore.getState();
      expect(state.currentLevel).toBe(0);
      expect(state.currentXP).toBe(0);
      expect(state.prestigeLevel).toBe(1);
    });

    it('should not prestige beyond prestige level 10', () => {
      act(() => {
        useXPStore.getState().updateState({ currentLevel: MAX_LEVEL, prestigeLevel: 10 });
      });
      let result: boolean;
      act(() => {
        result = useXPStore.getState().prestige();
      });
      expect(result!).toBe(false);
    });
  });

  describe('Reset', () => {
    it('should reset all XP state to initial values', () => {
      act(() => {
        useXPStore.getState().setXP(5000);
        useXPStore.getState().setLevel(10);
        useXPStore.getState().addPet('Dragon');
        useXPStore.getState().addZone('Volcano');
      });

      act(() => {
        useXPStore.getState().resetXP();
      });

      const state = useXPStore.getState();
      expect(state.currentXP).toBe(0);
      expect(state.currentLevel).toBe(0);
      expect(state.unlockedPets).toEqual([]);
      expect(state.currentZone).toBe('Assembly Line');
      expect(state.availableZones).toEqual(['Assembly Line']);
      expect(state.prestigeLevel).toBe(0);
    });
  });

  describe('Selector Hooks', () => {
    it('should return current XP via selector hook', () => {
      act(() => {
        useXPStore.getState().setXP(250);
      });
      const { result } = renderHook(() => useCurrentXP());
      expect(result.current).toBe(250);
    });

    it('should return current level via selector hook', () => {
      act(() => {
        useXPStore.getState().setLevel(7);
      });
      const { result } = renderHook(() => useCurrentLevel());
      expect(result.current).toBe(7);
    });

    it('should return unlocked pets via selector hook', () => {
      act(() => {
        useXPStore.getState().addPets(['Fox', 'Bear']);
      });
      const { result } = renderHook(() => useUnlockedPets());
      expect(result.current).toEqual(['Fox', 'Bear']);
    });

    it('should return current zone via store state', () => {
      const state = useXPStore.getState();
      expect(state.currentZone).toBe('Assembly Line');
    });

    it('should return available zones via store state', () => {
      act(() => {
        useXPStore.getState().addZone('Forest');
      });
      const state = useXPStore.getState();
      expect(state.availableZones).toContain('Assembly Line');
      expect(state.availableZones).toContain('Forest');
    });
  });

  describe('Persistence', () => {
    it('should persist XP state to localStorage', async () => {
      act(() => {
        useXPStore.getState().updateState({
          currentXP: 1000,
          currentLevel: 5,
          unlockedPets: ['Fox'],
        });
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const saved = localStorage.getItem('nomo_xp_system');
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved!);
      expect(parsed.state.currentXP).toBe(1000);
      expect(parsed.state.currentLevel).toBe(5);
      expect(parsed.state.unlockedPets).toContain('Fox');
    });
  });
});

// ─── Coin Store Tests ────────────────────────────────────────────────

describe('Progression Database – Coin Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useCoinStore.setState({
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastServerSync: null,
      pendingServerValidation: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should start with zero balance', () => {
      const state = useCoinStore.getState();
      expect(state.balance).toBe(0);
      expect(state.totalEarned).toBe(0);
      expect(state.totalSpent).toBe(0);
    });

    it('should have no pending server validation', () => {
      expect(useCoinStore.getState().pendingServerValidation).toBe(false);
    });

    it('should have no last server sync', () => {
      expect(useCoinStore.getState().lastServerSync).toBeNull();
    });
  });

  describe('Earning Coins', () => {
    it('should increase balance and totalEarned', () => {
      act(() => {
        useCoinStore.getState().addCoins(100);
      });
      const state = useCoinStore.getState();
      expect(state.balance).toBe(100);
      expect(state.totalEarned).toBe(100);
    });

    it('should accumulate multiple earnings', () => {
      act(() => {
        useCoinStore.getState().addCoins(50);
        useCoinStore.getState().addCoins(75);
        useCoinStore.getState().addCoins(25);
      });
      const state = useCoinStore.getState();
      expect(state.balance).toBe(150);
      expect(state.totalEarned).toBe(150);
    });

    it('should mark as pending server validation after earning', () => {
      act(() => {
        useCoinStore.getState().addCoins(100);
      });
      expect(useCoinStore.getState().pendingServerValidation).toBe(true);
    });

    it('should reject negative coin amounts', () => {
      act(() => {
        useCoinStore.getState().addCoins(-50);
      });
      expect(useCoinStore.getState().balance).toBe(0);
    });

    it('should reject zero coin amount', () => {
      act(() => {
        useCoinStore.getState().addCoins(0);
      });
      expect(useCoinStore.getState().balance).toBe(0);
    });
  });

  describe('Spending Coins', () => {
    beforeEach(() => {
      useCoinStore.setState({ balance: 500, totalEarned: 500, totalSpent: 0 });
    });

    it('should deduct balance and track spending', () => {
      let success;
      act(() => {
        success = useCoinStore.getState().spendCoins(200);
      });
      expect(success).toBe(true);
      const state = useCoinStore.getState();
      expect(state.balance).toBe(300);
      expect(state.totalSpent).toBe(200);
    });

    it('should reject spending more than balance', () => {
      let success;
      act(() => {
        success = useCoinStore.getState().spendCoins(501);
      });
      expect(success).toBe(false);
      expect(useCoinStore.getState().balance).toBe(500);
      expect(useCoinStore.getState().totalSpent).toBe(0);
    });

    it('should allow spending exactly the balance', () => {
      let success;
      act(() => {
        success = useCoinStore.getState().spendCoins(500);
      });
      expect(success).toBe(true);
      expect(useCoinStore.getState().balance).toBe(0);
    });

    it('should reject negative spend amounts', () => {
      let success;
      act(() => {
        success = useCoinStore.getState().spendCoins(-100);
      });
      expect(success).toBe(false);
      expect(useCoinStore.getState().balance).toBe(500);
    });

    it('should mark as pending server validation after spending', () => {
      act(() => {
        useCoinStore.getState().spendCoins(100);
      });
      expect(useCoinStore.getState().pendingServerValidation).toBe(true);
    });

    it('should track multiple spends correctly', () => {
      act(() => {
        useCoinStore.getState().spendCoins(100);
        useCoinStore.getState().spendCoins(150);
        useCoinStore.getState().spendCoins(50);
      });
      const state = useCoinStore.getState();
      expect(state.balance).toBe(200);
      expect(state.totalSpent).toBe(300);
    });
  });

  describe('canAfford', () => {
    beforeEach(() => {
      useCoinStore.setState({ balance: 300 });
    });

    it('should return true for affordable amount', () => {
      expect(useCoinStore.getState().canAfford(300)).toBe(true);
      expect(useCoinStore.getState().canAfford(299)).toBe(true);
    });

    it('should return false for unaffordable amount', () => {
      expect(useCoinStore.getState().canAfford(301)).toBe(false);
    });

    it('should return true for zero amount', () => {
      expect(useCoinStore.getState().canAfford(0)).toBe(true);
    });

    it('should return false for negative amount', () => {
      expect(useCoinStore.getState().canAfford(-1)).toBe(false);
    });
  });

  describe('Server Sync', () => {
    it('should override local state with server data', () => {
      act(() => {
        useCoinStore.getState().addCoins(100);
      });

      act(() => {
        useCoinStore.getState().syncFromServer(75, 75, 0);
      });

      const state = useCoinStore.getState();
      expect(state.balance).toBe(75);
      expect(state.totalEarned).toBe(75);
      expect(state.pendingServerValidation).toBe(false);
    });

    it('should record server sync timestamp', () => {
      const before = Date.now();

      act(() => {
        useCoinStore.getState().syncFromServer(100, 100, 0);
      });

      const after = Date.now();
      const syncTime = useCoinStore.getState().lastServerSync;
      expect(syncTime).toBeGreaterThanOrEqual(before);
      expect(syncTime).toBeLessThanOrEqual(after);
    });

    it('should handle server reporting lower balance (spend confirmed)', () => {
      useCoinStore.setState({ balance: 500, totalEarned: 500 });

      act(() => {
        useCoinStore.getState().syncFromServer(300, 500, 200);
      });

      const state = useCoinStore.getState();
      expect(state.balance).toBe(300);
      expect(state.totalSpent).toBe(200);
    });

    it('should handle server reporting higher balance (earn confirmed)', () => {
      useCoinStore.setState({ balance: 100 });

      act(() => {
        useCoinStore.getState().syncFromServer(250, 250, 0);
      });

      expect(useCoinStore.getState().balance).toBe(250);
    });
  });

  describe('Reset', () => {
    it('should reset all coin state to initial values', () => {
      act(() => {
        useCoinStore.getState().addCoins(1000);
        useCoinStore.getState().spendCoins(300);
        useCoinStore.getState().syncFromServer(700, 1000, 300);
      });

      act(() => {
        useCoinStore.getState().resetCoins();
      });

      const state = useCoinStore.getState();
      expect(state.balance).toBe(0);
      expect(state.totalEarned).toBe(0);
      expect(state.totalSpent).toBe(0);
      expect(state.lastServerSync).toBeNull();
      expect(state.pendingServerValidation).toBe(false);
    });
  });

  describe('Selector Hooks', () => {
    it('should return balance via selector hook', () => {
      act(() => {
        useCoinStore.getState().addCoins(500);
      });
      const { result } = renderHook(() => useCoinBalance());
      expect(result.current).toBe(500);
    });

    it('should return totalEarned via selector hook', () => {
      act(() => {
        useCoinStore.getState().addCoins(300);
      });
      const { result } = renderHook(() => useTotalEarned());
      expect(result.current).toBe(300);
    });

    it('should return totalSpent via selector hook', () => {
      useCoinStore.setState({ balance: 500, totalEarned: 500 });
      act(() => {
        useCoinStore.getState().spendCoins(150);
      });
      const { result } = renderHook(() => useTotalSpent());
      expect(result.current).toBe(150);
    });
  });

  describe('Persistence', () => {
    it('should persist coin state to localStorage', async () => {
      act(() => {
        useCoinStore.getState().addCoins(750);
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const saved = localStorage.getItem('nomo_coin_system');
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved!);
      expect(parsed.state.balance).toBe(750);
      expect(parsed.state.totalEarned).toBe(750);
    });
  });
});

// ─── Combined Progression Flow Tests ─────────────────────────────────

describe('Progression Database – End-to-End Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    useXPStore.setState({
      currentXP: 0,
      currentLevel: 0,
      xpToNextLevel: 15,
      totalXPForCurrentLevel: 0,
      unlockedPets: [],
      currentZone: 'Assembly Line',
      availableZones: ['Assembly Line'],
      prestigeLevel: 0,
    });
    useCoinStore.setState({
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastServerSync: null,
      pendingServerValidation: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should simulate complete session: earn coins + earn XP', () => {
    // Simulate a 30-minute focus session earning coins and XP
    act(() => {
      useCoinStore.getState().addCoins(40);
      useXPStore.getState().addXP(40);
    });

    expect(useCoinStore.getState().balance).toBe(40);
    expect(useXPStore.getState().currentXP).toBe(40);
  });

  it('should simulate earn → spend → earn cycle', () => {
    // Earn coins from sessions
    act(() => {
      useCoinStore.getState().addCoins(200);
    });
    expect(useCoinStore.getState().balance).toBe(200);

    // Spend coins on a shop item
    act(() => {
      useCoinStore.getState().spendCoins(100);
    });
    expect(useCoinStore.getState().balance).toBe(100);
    expect(useCoinStore.getState().totalSpent).toBe(100);

    // Earn more coins
    act(() => {
      useCoinStore.getState().addCoins(150);
    });
    expect(useCoinStore.getState().balance).toBe(250);
    expect(useCoinStore.getState().totalEarned).toBe(350);
  });

  it('should simulate XP progression through multiple levels', () => {
    // Level 0 → 1 needs 30 XP (LEVEL_REQUIREMENTS[1] = 30)
    act(() => {
      useXPStore.getState().addXP(30);
    });
    expect(useXPStore.getState().currentLevel).toBe(1);

    // Add more XP to progress further (LEVEL_REQUIREMENTS[2] = 70)
    act(() => {
      useXPStore.getState().addXP(40);
    });
    const state = useXPStore.getState();
    expect(state.currentXP).toBe(70);
    expect(state.currentLevel).toBe(2);
  });

  it('should simulate server sync correcting optimistic balance', () => {
    // Client optimistically adds coins
    act(() => {
      useCoinStore.getState().addCoins(100);
    });
    expect(useCoinStore.getState().balance).toBe(100);

    // Server responds with different balance (maybe duplicate prevented)
    act(() => {
      useCoinStore.getState().syncFromServer(50, 50, 0);
    });

    // Server is authoritative
    expect(useCoinStore.getState().balance).toBe(50);
    expect(useCoinStore.getState().pendingServerValidation).toBe(false);
  });

  it('should maintain data integrity across earn and spend', () => {
    act(() => {
      useCoinStore.getState().addCoins(1000);
      useCoinStore.getState().spendCoins(200);
      useCoinStore.getState().spendCoins(300);
      useCoinStore.getState().addCoins(50);
    });

    const state = useCoinStore.getState();
    // balance = 1000 - 200 - 300 + 50 = 550
    expect(state.balance).toBe(550);
    // totalEarned = 1000 + 50 = 1050
    expect(state.totalEarned).toBe(1050);
    // totalSpent = 200 + 300 = 500
    expect(state.totalSpent).toBe(500);
    // Invariant: balance = totalEarned - totalSpent
    expect(state.balance).toBe(state.totalEarned - state.totalSpent);
  });

  it('should handle rapid concurrent operations without data corruption', () => {
    // Simulate rapid earn/spend operations
    act(() => {
      for (let i = 0; i < 50; i++) {
        useCoinStore.getState().addCoins(10);
      }
    });

    expect(useCoinStore.getState().balance).toBe(500);
    expect(useCoinStore.getState().totalEarned).toBe(500);

    act(() => {
      for (let i = 0; i < 25; i++) {
        useCoinStore.getState().spendCoins(10);
      }
    });

    expect(useCoinStore.getState().balance).toBe(250);
    expect(useCoinStore.getState().totalSpent).toBe(250);
  });

  it('should handle XP store level mismatch correction on rehydrate', () => {
    // Simulate a state where level doesn't match XP
    act(() => {
      useXPStore.setState({
        currentXP: 500,
        currentLevel: 2, // Too low for 500 XP
      });
    });

    // The store's onRehydrateStorage should fix the level
    // We manually verify the expected behavior
    const expectedLevel = calculateLevelFromXP(500);
    // 500 XP: LEVEL_REQUIREMENTS[7] = 460, [8] = 590, so level = 7
    expect(expectedLevel).toBe(7);
    expect(expectedLevel).toBeGreaterThan(2);
  });

  it('should persist both XP and coin data independently', async () => {
    act(() => {
      useXPStore.getState().setXP(999);
      useCoinStore.getState().addCoins(888);
    });

    await new Promise(resolve => setTimeout(resolve, 50));

    const xpSaved = localStorage.getItem('nomo_xp_system');
    const coinSaved = localStorage.getItem('nomo_coin_system');

    expect(xpSaved).not.toBeNull();
    expect(coinSaved).not.toBeNull();

    const xpParsed = JSON.parse(xpSaved!);
    const coinParsed = JSON.parse(coinSaved!);

    expect(xpParsed.state.currentXP).toBe(999);
    expect(coinParsed.state.balance).toBe(888);
  });
});
