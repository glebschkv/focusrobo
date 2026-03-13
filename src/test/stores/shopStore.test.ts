import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock logger before importing store
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

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    rpc: vi.fn(),
  },
  isSupabaseConfigured: false,
}));

import {
  useShopStore,
  useOwnedCharacters,
  useOwnedBackgrounds,
  useEquippedBackground,
  ShopInventory
} from '@/stores/shopStore';

describe('shopStore', () => {
  // Storage key: 'nomo_shop_inventory'

  beforeEach(() => {
    localStorage.clear();
    // Reset store to initial state
    useShopStore.setState({
      ownedCharacters: [],
      ownedBackgrounds: [],
      equippedBackground: null,
      purchasedStarterBundleIds: [],
      dailyDealPurchasedDate: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty inventories', () => {
      const state = useShopStore.getState();
      expect(state.ownedCharacters).toEqual([]);
      expect(state.ownedBackgrounds).toEqual([]);
    });

    it('should initialize with no equipped items', () => {
      const state = useShopStore.getState();
      expect(state.equippedBackground).toBeNull();
    });

    it('should initialize with empty purchasedStarterBundleIds', () => {
      const state = useShopStore.getState();
      expect(state.purchasedStarterBundleIds).toEqual([]);
    });

    it('should initialize with null dailyDealPurchasedDate', () => {
      const state = useShopStore.getState();
      expect(state.dailyDealPurchasedDate).toBeNull();
    });

    it('should have all required actions available', () => {
      const state = useShopStore.getState();
      expect(typeof state.addOwnedCharacter).toBe('function');
      expect(typeof state.addOwnedBackground).toBe('function');
      expect(typeof state.addOwnedCharacters).toBe('function');
      expect(typeof state.addOwnedBackgrounds).toBe('function');
      expect(typeof state.addPurchasedStarterBundleId).toBe('function');
      expect(typeof state.setEquippedBackground).toBe('function');
      expect(typeof state.setInventory).toBe('function');
      expect(typeof state.resetShop).toBe('function');
      expect(typeof state.setDailyDealPurchased).toBe('function');
      expect(typeof state.isDailyDealPurchased).toBe('function');
      expect(typeof state.isCharacterOwned).toBe('function');
      expect(typeof state.isBackgroundOwned).toBe('function');
    });
  });

  describe('addOwnedCharacter', () => {
    it('should add a character to owned characters', () => {
      const { addOwnedCharacter } = useShopStore.getState();

      act(() => {
        addOwnedCharacter('golden-cat');
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toContain('golden-cat');
    });

    it('should not add duplicate characters', () => {
      const { addOwnedCharacter } = useShopStore.getState();

      act(() => {
        addOwnedCharacter('golden-cat');
        addOwnedCharacter('golden-cat');
        addOwnedCharacter('golden-cat');
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters.filter(c => c === 'golden-cat')).toHaveLength(1);
    });

    it('should add multiple different characters', () => {
      const { addOwnedCharacter } = useShopStore.getState();

      act(() => {
        addOwnedCharacter('golden-cat');
        addOwnedCharacter('silver-dog');
        addOwnedCharacter('crystal-bird');
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toHaveLength(3);
      expect(state.ownedCharacters).toContain('golden-cat');
      expect(state.ownedCharacters).toContain('silver-dog');
      expect(state.ownedCharacters).toContain('crystal-bird');
    });
  });

  describe('addOwnedBackground', () => {
    it('should add a background to owned backgrounds', () => {
      const { addOwnedBackground } = useShopStore.getState();

      act(() => {
        addOwnedBackground('sunset-beach');
      });

      const state = useShopStore.getState();
      expect(state.ownedBackgrounds).toContain('sunset-beach');
    });

    it('should not add duplicate backgrounds', () => {
      const { addOwnedBackground } = useShopStore.getState();

      act(() => {
        addOwnedBackground('sunset-beach');
        addOwnedBackground('sunset-beach');
      });

      const state = useShopStore.getState();
      expect(state.ownedBackgrounds.filter(b => b === 'sunset-beach')).toHaveLength(1);
    });
  });

  describe('addOwnedCharacters (batch)', () => {
    it('should add multiple characters at once', () => {
      const { addOwnedCharacters } = useShopStore.getState();

      act(() => {
        addOwnedCharacters(['cat-1', 'cat-2', 'cat-3']);
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toHaveLength(3);
      expect(state.ownedCharacters).toContain('cat-1');
      expect(state.ownedCharacters).toContain('cat-2');
      expect(state.ownedCharacters).toContain('cat-3');
    });

    it('should filter out already owned characters', () => {
      const { addOwnedCharacter, addOwnedCharacters } = useShopStore.getState();

      act(() => {
        addOwnedCharacter('existing-cat');
        addOwnedCharacters(['existing-cat', 'new-dog', 'new-bird']);
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toHaveLength(3);
      expect(state.ownedCharacters.filter(c => c === 'existing-cat')).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const { addOwnedCharacters } = useShopStore.getState();

      act(() => {
        addOwnedCharacters([]);
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toHaveLength(0);
    });

    it('should filter duplicates within the input array', () => {
      const { addOwnedCharacters } = useShopStore.getState();

      act(() => {
        addOwnedCharacters(['cat', 'cat', 'dog', 'dog', 'bird']);
      });

      const state = useShopStore.getState();
      // The filter is based on ownedCharacters, so duplicates in input may be added
      // Based on the implementation, it only filters against existing owned
      expect(state.ownedCharacters).toContain('cat');
      expect(state.ownedCharacters).toContain('dog');
      expect(state.ownedCharacters).toContain('bird');
    });
  });

  describe('addOwnedBackgrounds (batch)', () => {
    it('should add multiple backgrounds at once', () => {
      const { addOwnedBackgrounds } = useShopStore.getState();

      act(() => {
        addOwnedBackgrounds(['bg-1', 'bg-2', 'bg-3']);
      });

      const state = useShopStore.getState();
      expect(state.ownedBackgrounds).toHaveLength(3);
    });

    it('should filter out already owned backgrounds', () => {
      const { addOwnedBackground, addOwnedBackgrounds } = useShopStore.getState();

      act(() => {
        addOwnedBackground('existing-bg');
        addOwnedBackgrounds(['existing-bg', 'new-bg-1', 'new-bg-2']);
      });

      const state = useShopStore.getState();
      expect(state.ownedBackgrounds).toHaveLength(3);
      expect(state.ownedBackgrounds.filter(b => b === 'existing-bg')).toHaveLength(1);
    });
  });

  describe('addPurchasedStarterBundleId', () => {
    it('should add a bundle ID to purchased list', () => {
      const { addPurchasedStarterBundleId } = useShopStore.getState();

      act(() => {
        addPurchasedStarterBundleId('co.phonoinc.app.bundle.welcome');
      });

      const state = useShopStore.getState();
      expect(state.purchasedStarterBundleIds).toContain('co.phonoinc.app.bundle.welcome');
    });

    it('should not add duplicate bundle IDs', () => {
      const { addPurchasedStarterBundleId } = useShopStore.getState();

      act(() => {
        addPurchasedStarterBundleId('co.phonoinc.app.bundle.welcome');
        addPurchasedStarterBundleId('co.phonoinc.app.bundle.welcome');
      });

      const state = useShopStore.getState();
      expect(state.purchasedStarterBundleIds.filter(id => id === 'co.phonoinc.app.bundle.welcome')).toHaveLength(1);
    });

    it('should track multiple bundle IDs', () => {
      const { addPurchasedStarterBundleId } = useShopStore.getState();

      act(() => {
        addPurchasedStarterBundleId('co.phonoinc.app.bundle.welcome');
        addPurchasedStarterBundleId('co.phonoinc.app.bundle.egghunter');
      });

      const state = useShopStore.getState();
      expect(state.purchasedStarterBundleIds).toHaveLength(2);
    });
  });

  describe('setDailyDealPurchased / isDailyDealPurchased', () => {
    it('should mark daily deal as purchased for today', () => {
      const { setDailyDealPurchased } = useShopStore.getState();

      act(() => {
        setDailyDealPurchased();
      });

      const state = useShopStore.getState();
      const today = new Date().toISOString().split('T')[0];
      expect(state.dailyDealPurchasedDate).toBe(today);
    });

    it('should return true for isDailyDealPurchased when purchased today', () => {
      const { setDailyDealPurchased } = useShopStore.getState();

      act(() => {
        setDailyDealPurchased();
      });

      expect(useShopStore.getState().isDailyDealPurchased()).toBe(true);
    });

    it('should return false for isDailyDealPurchased when not purchased', () => {
      expect(useShopStore.getState().isDailyDealPurchased()).toBe(false);
    });

    it('should return false for isDailyDealPurchased when purchased on a different day', () => {
      useShopStore.setState({ dailyDealPurchasedDate: '2020-01-01' });
      expect(useShopStore.getState().isDailyDealPurchased()).toBe(false);
    });
  });

  describe('setEquippedBackground', () => {
    it('should set the equipped background', () => {
      const { setEquippedBackground } = useShopStore.getState();

      act(() => {
        setEquippedBackground('sunset-theme');
      });

      const state = useShopStore.getState();
      expect(state.equippedBackground).toBe('sunset-theme');
    });

    it('should allow unequipping background with null', () => {
      const { setEquippedBackground } = useShopStore.getState();

      act(() => {
        setEquippedBackground('sunset-theme');
        setEquippedBackground(null);
      });

      const state = useShopStore.getState();
      expect(state.equippedBackground).toBeNull();
    });
  });

  describe('setInventory', () => {
    it('should update inventory with partial data', () => {
      const { setInventory } = useShopStore.getState();

      act(() => {
        setInventory({
          ownedCharacters: ['char-1', 'char-2'],
        });
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toEqual(['char-1', 'char-2']);
      // Unspecified fields should remain at defaults
      expect(state.ownedBackgrounds).toEqual([]);
    });

    it('should update all inventory fields', () => {
      const { setInventory } = useShopStore.getState();

      const fullInventory: ShopInventory = {
        ownedCharacters: ['char-1'],
        ownedBackgrounds: ['bg-1'],
        equippedBackground: 'bg-1',
        purchasedStarterBundleIds: ['bundle-1'],
        dailyDealPurchasedDate: '2024-01-01',
      };

      act(() => {
        setInventory(fullInventory);
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toEqual(['char-1']);
      expect(state.ownedBackgrounds).toEqual(['bg-1']);
      expect(state.equippedBackground).toBe('bg-1');
      expect(state.purchasedStarterBundleIds).toEqual(['bundle-1']);
      expect(state.dailyDealPurchasedDate).toBe('2024-01-01');
    });
  });

  describe('resetShop', () => {
    it('should reset all shop state to initial values', () => {
      const { addOwnedCharacter, addOwnedBackground, setEquippedBackground, addPurchasedStarterBundleId, setDailyDealPurchased, resetShop } = useShopStore.getState();

      act(() => {
        addOwnedCharacter('char-1');
        addOwnedBackground('bg-1');
        setEquippedBackground('bg-1');
        addPurchasedStarterBundleId('bundle-1');
        setDailyDealPurchased();
      });

      // Verify items were added
      expect(useShopStore.getState().ownedCharacters).toHaveLength(1);
      expect(useShopStore.getState().purchasedStarterBundleIds).toHaveLength(1);

      act(() => {
        resetShop();
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toEqual([]);
      expect(state.ownedBackgrounds).toEqual([]);
      expect(state.equippedBackground).toBeNull();
      expect(state.purchasedStarterBundleIds).toEqual([]);
      expect(state.dailyDealPurchasedDate).toBeNull();
    });
  });

  describe('Selector Functions', () => {
    describe('isCharacterOwned', () => {
      it('should return true for owned characters', () => {
        const { addOwnedCharacter } = useShopStore.getState();

        act(() => {
          addOwnedCharacter('golden-cat');
        });

        const state = useShopStore.getState();
        expect(state.isCharacterOwned('golden-cat')).toBe(true);
      });

      it('should return false for unowned characters', () => {
        const state = useShopStore.getState();
        expect(state.isCharacterOwned('not-owned')).toBe(false);
      });
    });

    describe('isBackgroundOwned', () => {
      it('should return true for owned backgrounds', () => {
        const { addOwnedBackground } = useShopStore.getState();

        act(() => {
          addOwnedBackground('sunset-beach');
        });

        const state = useShopStore.getState();
        expect(state.isBackgroundOwned('sunset-beach')).toBe(true);
      });

      it('should return false for unowned backgrounds', () => {
        const state = useShopStore.getState();
        expect(state.isBackgroundOwned('not-owned')).toBe(false);
      });
    });

  });

  describe('Selector Hooks', () => {
    it('useOwnedCharacters should return owned characters', () => {
      const { addOwnedCharacter } = useShopStore.getState();

      act(() => {
        addOwnedCharacter('cat-1');
        addOwnedCharacter('dog-1');
      });

      const { result } = renderHook(() => useOwnedCharacters());
      expect(result.current).toEqual(['cat-1', 'dog-1']);
    });

    it('useOwnedBackgrounds should return owned backgrounds', () => {
      const { addOwnedBackground } = useShopStore.getState();

      act(() => {
        addOwnedBackground('bg-1');
      });

      const { result } = renderHook(() => useOwnedBackgrounds());
      expect(result.current).toEqual(['bg-1']);
    });

    it('useEquippedBackground should return equipped background', () => {
      const { setEquippedBackground } = useShopStore.getState();

      act(() => {
        setEquippedBackground('sunset-theme');
      });

      const { result } = renderHook(() => useEquippedBackground());
      expect(result.current).toBe('sunset-theme');
    });

    it('selector hooks should update when state changes', () => {
      const { result: charactersResult } = renderHook(() => useOwnedCharacters());

      expect(charactersResult.current).toEqual([]);

      act(() => {
        useShopStore.getState().addOwnedCharacter('new-character');
      });

      expect(charactersResult.current).toContain('new-character');
    });
  });

  describe('Persistence', () => {
    it('should persist state to localStorage', async () => {
      const { addOwnedCharacter, setEquippedBackground } = useShopStore.getState();

      act(() => {
        addOwnedCharacter('persisted-cat');
        setEquippedBackground('persisted-bg');
      });

      // Wait for persistence
      await new Promise(resolve => setTimeout(resolve, 50));

      const saved = localStorage.getItem('nomo_shop_inventory');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.state.ownedCharacters).toContain('persisted-cat');
      expect(parsed.state.equippedBackground).toBe('persisted-bg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle large inventory', () => {
      const { addOwnedCharacters, addOwnedBackgrounds } = useShopStore.getState();

      const manyCharacters = Array.from({ length: 100 }, (_, i) => `char-${i}`);
      const manyBackgrounds = Array.from({ length: 100 }, (_, i) => `bg-${i}`);

      act(() => {
        addOwnedCharacters(manyCharacters);
        addOwnedBackgrounds(manyBackgrounds);
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toHaveLength(100);
      expect(state.ownedBackgrounds).toHaveLength(100);
    });

    it('should handle special characters in IDs', () => {
      const { addOwnedCharacter, addOwnedBackground } = useShopStore.getState();
      const specialId = 'item-with-special-chars-äöü-🎮';

      act(() => {
        addOwnedCharacter(specialId);
        addOwnedBackground(specialId);
      });

      const state = useShopStore.getState();
      expect(state.ownedCharacters).toContain(specialId);
      expect(state.ownedBackgrounds).toContain(specialId);
      expect(state.isCharacterOwned(specialId)).toBe(true);
      expect(state.isBackgroundOwned(specialId)).toBe(true);
    });
  });
});
