import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useXPStore,
  useCurrentXP,
  useCurrentLevel,
  useUnlockedPets,
  subscribeToXPChanges,
  calculateLevelRequirement,
  calculateLevelFromXP,
  MAX_LEVEL,
} from '@/stores/xpStore';

// Mock the logger to avoid console noise
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

// Mock the validated storage
vi.mock('@/lib/validated-zustand-storage', () => ({
  createValidatedStorage: () => ({
    getItem: () => null,
    setItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}));

describe('xpStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useXPStore.getState().resetXP();
    });
    vi.clearAllMocks();
  });

  describe('Constants', () => {
    it('MAX_LEVEL should be 50', () => {
      expect(MAX_LEVEL).toBe(50);
    });
  });

  describe('calculateLevelRequirement', () => {
    it('should return 0 for level 0', () => {
      expect(calculateLevelRequirement(0)).toBe(0);
    });

    it('should return 30 for level 1', () => {
      expect(calculateLevelRequirement(1)).toBe(30);
    });

    it('should return increasing values for higher levels', () => {
      const level2 = calculateLevelRequirement(2);
      const level3 = calculateLevelRequirement(3);
      const level4 = calculateLevelRequirement(4);

      expect(level2).toBeGreaterThan(30);
      expect(level3).toBeGreaterThan(level2);
      expect(level4).toBeGreaterThan(level3);
    });

    it('should match the LEVEL_REQUIREMENTS lookup table for known levels', () => {
      // Values from xpConstants.ts LEVEL_REQUIREMENTS array
      expect(calculateLevelRequirement(0)).toBe(0);
      expect(calculateLevelRequirement(1)).toBe(30);
      expect(calculateLevelRequirement(2)).toBe(70);
      expect(calculateLevelRequirement(3)).toBe(120);
      expect(calculateLevelRequirement(4)).toBe(180);
      expect(calculateLevelRequirement(5)).toBe(260);
      expect(calculateLevelRequirement(10)).toBe(920);
    });
  });

  describe('calculateLevelFromXP', () => {
    it('should return 0 for 0 XP', () => {
      expect(calculateLevelFromXP(0)).toBe(0);
    });

    it('should return 0 for XP below level 1 threshold', () => {
      expect(calculateLevelFromXP(29)).toBe(0);
    });

    it('should return level 1 when XP meets requirement', () => {
      expect(calculateLevelFromXP(30)).toBe(1);
    });

    it('should return correct level for XP at exact thresholds', () => {
      expect(calculateLevelFromXP(70)).toBe(2);
      expect(calculateLevelFromXP(120)).toBe(3);
      expect(calculateLevelFromXP(260)).toBe(5);
    });

    it('should return correct level for XP between thresholds', () => {
      // 70 = level 2, 120 = level 3, so 100 should be level 2
      expect(calculateLevelFromXP(100)).toBe(2);
    });

    it('should cap at MAX_LEVEL', () => {
      expect(calculateLevelFromXP(Number.MAX_SAFE_INTEGER)).toBe(MAX_LEVEL);
    });
  });

  describe('Initial State', () => {
    it('should have zero XP initially', () => {
      const { currentXP } = useXPStore.getState();
      expect(currentXP).toBe(0);
    });

    it('should have level 0 initially', () => {
      const { currentLevel } = useXPStore.getState();
      expect(currentLevel).toBe(0);
    });

    it('should have 15 XP to next level initially (hardcoded initial state)', () => {
      const { xpToNextLevel } = useXPStore.getState();
      expect(xpToNextLevel).toBe(15);
    });

    it('should have empty unlocked pets initially', () => {
      const { unlockedPets } = useXPStore.getState();
      expect(unlockedPets).toEqual([]);
    });

    it('should have Assembly Line as default zone', () => {
      const { currentZone } = useXPStore.getState();
      expect(currentZone).toBe('Assembly Line');
    });

    it('should have Assembly Line in available zones', () => {
      const { availableZones } = useXPStore.getState();
      expect(availableZones).toContain('Assembly Line');
    });

    it('should have prestige level 0 initially', () => {
      const { prestigeLevel } = useXPStore.getState();
      expect(prestigeLevel).toBe(0);
    });
  });

  describe('setXP', () => {
    it('should set XP to specific value', () => {
      const { setXP } = useXPStore.getState();

      act(() => {
        setXP(100);
      });

      expect(useXPStore.getState().currentXP).toBe(100);
    });

    it('should allow setting to zero', () => {
      const { setXP } = useXPStore.getState();

      act(() => {
        setXP(500);
      });

      act(() => {
        setXP(0);
      });

      expect(useXPStore.getState().currentXP).toBe(0);
    });
  });

  describe('addXP', () => {
    it('should add XP to current amount', () => {
      const { addXP } = useXPStore.getState();

      act(() => {
        addXP(50);
      });

      expect(useXPStore.getState().currentXP).toBe(50);
    });

    it('should accumulate XP over multiple additions', () => {
      const { addXP } = useXPStore.getState();

      act(() => {
        addXP(25);
        addXP(25);
        addXP(50);
      });

      expect(useXPStore.getState().currentXP).toBe(100);
    });

    it('should update level when XP crosses threshold', () => {
      const { addXP } = useXPStore.getState();

      act(() => {
        addXP(30); // Level 1 threshold is 30
      });

      expect(useXPStore.getState().currentLevel).toBe(1);
    });

    it('should update xpToNextLevel correctly after addXP', () => {
      const { addXP } = useXPStore.getState();

      act(() => {
        addXP(30); // Reaches level 1, next level at 70
      });

      // xpToNextLevel = calculateLevelRequirement(2) - currentXP = 70 - 30 = 40
      expect(useXPStore.getState().xpToNextLevel).toBe(40);
    });

    it('should handle negative XP (allowing it for corrections)', () => {
      const { addXP, setXP } = useXPStore.getState();

      act(() => {
        setXP(100);
        addXP(-50);
      });

      expect(useXPStore.getState().currentXP).toBe(50);
    });
  });

  describe('setLevel', () => {
    it('should set level directly', () => {
      const { setLevel } = useXPStore.getState();

      act(() => {
        setLevel(5);
      });

      expect(useXPStore.getState().currentLevel).toBe(5);
    });

    it('should update totalXPForCurrentLevel', () => {
      const { setLevel } = useXPStore.getState();

      act(() => {
        setLevel(5);
      });

      const expectedXP = calculateLevelRequirement(5);
      expect(useXPStore.getState().totalXPForCurrentLevel).toBe(expectedXP);
    });

    it('should update xpToNextLevel', () => {
      const { setLevel, setXP } = useXPStore.getState();

      act(() => {
        setXP(100);
        setLevel(3);
      });

      const nextLevelXP = calculateLevelRequirement(4);
      const currentXP = useXPStore.getState().currentXP;
      expect(useXPStore.getState().xpToNextLevel).toBe(nextLevelXP - currentXP);
    });
  });

  describe('addPet', () => {
    it('should add a new pet', () => {
      const { addPet } = useXPStore.getState();

      act(() => {
        addPet('panda');
      });

      expect(useXPStore.getState().unlockedPets).toContain('panda');
    });

    it('should not add duplicate pets', () => {
      const { addPet } = useXPStore.getState();

      act(() => {
        addPet('cat');
        addPet('cat');
        addPet('cat');
      });

      const pets = useXPStore.getState().unlockedPets;
      expect(pets.filter(a => a === 'cat')).toHaveLength(1);
    });

    it('should maintain existing pets when adding new', () => {
      const { addPet } = useXPStore.getState();

      act(() => {
        addPet('dog');
        addPet('cat');
      });

      const { unlockedPets } = useXPStore.getState();
      expect(unlockedPets).toContain('dog');
      expect(unlockedPets).toContain('cat');
    });
  });

  describe('addPets', () => {
    it('should add multiple pets at once', () => {
      const { addPets } = useXPStore.getState();

      act(() => {
        addPets(['bird', 'fish', 'rabbit']);
      });

      const { unlockedPets } = useXPStore.getState();
      expect(unlockedPets).toContain('bird');
      expect(unlockedPets).toContain('fish');
      expect(unlockedPets).toContain('rabbit');
    });

    it('should filter out duplicates when adding multiple', () => {
      const { addPet, addPets } = useXPStore.getState();

      act(() => {
        addPet('dog');
        addPets(['dog', 'cat', 'bird']);
      });

      const { unlockedPets } = useXPStore.getState();
      expect(unlockedPets.filter(a => a === 'dog')).toHaveLength(1);
      expect(unlockedPets).toHaveLength(3);
    });

    it('should not update state if no new pets', () => {
      const { addPets } = useXPStore.getState();

      act(() => {
        addPets(['cat', 'dog']);
      });

      const initialPets = [...useXPStore.getState().unlockedPets];

      act(() => {
        addPets(['cat', 'dog']);
      });

      expect(useXPStore.getState().unlockedPets).toEqual(initialPets);
    });
  });

  describe('switchZone', () => {
    it('should switch to available zone', () => {
      const { addZone, switchZone } = useXPStore.getState();

      act(() => {
        addZone('Forest');
        switchZone('Forest');
      });

      expect(useXPStore.getState().currentZone).toBe('Forest');
    });

    it('should not switch to unavailable zone', () => {
      const { switchZone } = useXPStore.getState();

      act(() => {
        switchZone('Desert');
      });

      expect(useXPStore.getState().currentZone).toBe('Assembly Line');
    });

    it('should allow switching back to original zone', () => {
      const { addZone, switchZone } = useXPStore.getState();

      act(() => {
        addZone('Beach');
        switchZone('Beach');
      });

      expect(useXPStore.getState().currentZone).toBe('Beach');

      act(() => {
        switchZone('Assembly Line');
      });

      expect(useXPStore.getState().currentZone).toBe('Assembly Line');
    });
  });

  describe('addZone', () => {
    it('should add a new zone', () => {
      const { addZone } = useXPStore.getState();

      act(() => {
        addZone('Mountain');
      });

      expect(useXPStore.getState().availableZones).toContain('Mountain');
    });

    it('should not add duplicate zones', () => {
      const { addZone } = useXPStore.getState();

      act(() => {
        addZone('Forest');
        addZone('Forest');
      });

      const zones = useXPStore.getState().availableZones;
      expect(zones.filter(b => b === 'Forest')).toHaveLength(1);
    });

    it('should keep default Assembly Line when adding new zones', () => {
      const { addZone } = useXPStore.getState();

      act(() => {
        addZone('Ocean');
        addZone('Cave');
      });

      expect(useXPStore.getState().availableZones).toContain('Assembly Line');
    });
  });

  describe('updateState', () => {
    it('should update multiple state properties at once', () => {
      const { updateState } = useXPStore.getState();

      act(() => {
        updateState({
          currentXP: 500,
          currentLevel: 10,
          currentZone: 'Meadow',
        });
      });

      const state = useXPStore.getState();
      expect(state.currentXP).toBe(500);
      expect(state.currentLevel).toBe(10);
    });

    it('should not affect unspecified properties', () => {
      const { addPet, updateState } = useXPStore.getState();

      act(() => {
        addPet('tiger');
      });

      act(() => {
        updateState({ currentXP: 100 });
      });

      expect(useXPStore.getState().unlockedPets).toContain('tiger');
    });
  });

  describe('resetXP', () => {
    it('should reset all state to initial values', () => {
      const { addXP, setLevel, addPet, addZone, resetXP } = useXPStore.getState();

      act(() => {
        addXP(1000);
        setLevel(15);
        addPet('lion');
        addZone('Jungle');
      });

      act(() => {
        resetXP();
      });

      const state = useXPStore.getState();
      expect(state.currentXP).toBe(0);
      expect(state.currentLevel).toBe(0);
      expect(state.unlockedPets).toEqual([]);
      expect(state.availableZones).toEqual(['Assembly Line']);
      expect(state.currentZone).toBe('Assembly Line');
    });
  });

  describe('prestige', () => {
    it('should not allow prestige below MAX_LEVEL', () => {
      const { setLevel } = useXPStore.getState();

      act(() => {
        setLevel(49);
      });

      let result: boolean = false;
      act(() => {
        result = useXPStore.getState().prestige();
      });

      expect(result).toBe(false);
      expect(useXPStore.getState().prestigeLevel).toBe(0);
    });

    it('should allow prestige at MAX_LEVEL', () => {
      const { setLevel } = useXPStore.getState();

      act(() => {
        setLevel(MAX_LEVEL);
      });

      let result: boolean = false;
      act(() => {
        result = useXPStore.getState().prestige();
      });

      expect(result).toBe(true);
      expect(useXPStore.getState().prestigeLevel).toBe(1);
      expect(useXPStore.getState().currentLevel).toBe(0);
      expect(useXPStore.getState().currentXP).toBe(0);
    });

    it('should not allow prestige beyond level 10', () => {
      // Set up prestige level 10 via updateState
      act(() => {
        useXPStore.getState().updateState({ prestigeLevel: 10, currentLevel: MAX_LEVEL });
      });

      let result: boolean = false;
      act(() => {
        result = useXPStore.getState().prestige();
      });

      expect(result).toBe(false);
    });
  });

  describe('Selector Hooks', () => {
    it('useCurrentXP should return current XP', () => {
      act(() => {
        useXPStore.getState().setXP(250);
      });

      const { result } = renderHook(() => useCurrentXP());
      expect(result.current).toBe(250);
    });

    it('useCurrentLevel should return current level', () => {
      act(() => {
        useXPStore.getState().setLevel(7);
      });

      const { result } = renderHook(() => useCurrentLevel());
      expect(result.current).toBe(7);
    });

    it('useUnlockedPets should return pets array', () => {
      act(() => {
        useXPStore.getState().addPets(['bear', 'deer']);
      });

      const { result } = renderHook(() => useUnlockedPets());
      expect(result.current).toContain('bear');
      expect(result.current).toContain('deer');
    });

    it('currentZone should be accessible via getState', () => {
      expect(useXPStore.getState().currentZone).toBe('Assembly Line');
    });

    it('availableZones should be accessible via getState', () => {
      act(() => {
        useXPStore.getState().addZone('Meadow');
      });

      const { availableZones } = useXPStore.getState();
      expect(availableZones).toContain('Assembly Line');
      expect(availableZones).toContain('Meadow');
    });

    it('selectors should update on state change', () => {
      const { result } = renderHook(() => useCurrentXP());
      expect(result.current).toBe(0);

      act(() => {
        useXPStore.getState().addXP(75);
      });

      expect(result.current).toBe(75);
    });
  });

  describe('subscribeToXPChanges', () => {
    it('should call callback on XP changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToXPChanges(callback);

      act(() => {
        useXPStore.getState().addXP(100);
      });

      expect(callback).toHaveBeenCalled();
      unsubscribe();
    });

    it('should call callback on level changes', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToXPChanges(callback);

      act(() => {
        useXPStore.getState().setLevel(5);
      });

      expect(callback).toHaveBeenCalled();
      unsubscribe();
    });

    it('should not call callback after unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = subscribeToXPChanges(callback);

      unsubscribe();

      act(() => {
        useXPStore.getState().addXP(100);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large XP values', () => {
      const { addXP } = useXPStore.getState();

      act(() => {
        addXP(1000000);
      });

      expect(useXPStore.getState().currentXP).toBe(1000000);
    });

    it('should handle rapid successive XP additions', () => {
      const { addXP } = useXPStore.getState();

      act(() => {
        for (let i = 0; i < 100; i++) {
          addXP(10);
        }
      });

      expect(useXPStore.getState().currentXP).toBe(1000);
    });

    it('should handle many pets without issue', () => {
      const { addPets } = useXPStore.getState();
      const manyPets = Array.from({ length: 50 }, (_, i) => `pet_${i}`);

      act(() => {
        addPets(manyPets);
      });

      expect(useXPStore.getState().unlockedPets).toHaveLength(50);
    });

    it('should set xpToNextLevel to 0 at MAX_LEVEL', () => {
      const { addXP } = useXPStore.getState();

      act(() => {
        addXP(Number.MAX_SAFE_INTEGER);
      });

      expect(useXPStore.getState().currentLevel).toBe(MAX_LEVEL);
      expect(useXPStore.getState().xpToNextLevel).toBe(0);
    });
  });
});
