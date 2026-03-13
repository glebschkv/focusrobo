import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShop } from '@/hooks/useShop';
import type { ShopInventory } from '@/hooks/useShop';
import { useShopStore } from '@/stores';

// Mock dependencies
const mockCoinSystem = {
  balance: 1000,
  canAfford: vi.fn(),
  spendCoins: vi.fn(),
  addCoins: vi.fn(),
  syncFromServer: vi.fn().mockResolvedValue(false),
};

const mockBoosterSystem = {
  isBoosterActive: vi.fn(),
  activateBooster: vi.fn(),
  getBoosterType: vi.fn(),
};

const mockStreakSystem = {
  earnStreakFreeze: vi.fn(),
};

vi.mock('@/hooks/useCoinSystem', () => ({
  useCoinSystem: () => mockCoinSystem,
}));

vi.mock('@/hooks/useCoinBooster', () => ({
  useCoinBooster: () => mockBoosterSystem,
}));

vi.mock('@/hooks/useStreakSystem', () => ({
  useStreakSystem: () => mockStreakSystem,
}));

// Helper to set up Zustand store state
const setShopState = (inventory: Partial<ShopInventory>) => {
  useShopStore.setState({
    ownedCharacters: inventory.ownedCharacters ?? [],
    ownedBackgrounds: inventory.ownedBackgrounds ?? [],
    equippedBackground: inventory.equippedBackground ?? null,
    purchasedStarterBundleIds: inventory.purchasedStarterBundleIds ?? [],
  });
};

// Mock achievement tracking
vi.mock('@/hooks/useAchievementTracking', () => ({
  dispatchAchievementEvent: vi.fn(),
  ACHIEVEMENT_EVENTS: {
    PURCHASE_MADE: 'PURCHASE_MADE',
  },
}));

// Mock logger
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

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }), getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    from: vi.fn(() => ({ select: vi.fn(), insert: vi.fn(), update: vi.fn() })),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
  isSupabaseConfigured: false,
}));

vi.mock('@/hooks/useStoreKit', () => ({
  IAP_EVENTS: {
    COINS_GRANTED: 'iap:coinsGranted',
    BUNDLE_GRANTED: 'iap:bundleGranted',
  },
  dispatchCoinsGranted: vi.fn(),
}));

vi.mock('@/lib/errorReporting', () => ({
  reportError: vi.fn(),
  initErrorReporting: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

// Mock shop data
vi.mock('@/data/ShopData', () => ({
  PREMIUM_BACKGROUNDS: [
    {
      id: 'bg-ocean',
      name: 'Ocean View',
      coinPrice: 200,
      category: 'backgrounds',
    },
    {
      id: 'bg-forest',
      name: 'Forest',
      coinPrice: 250,
      category: 'backgrounds',
    },
  ],
  UTILITY_ITEMS: [
    {
      id: 'streak-freeze-1',
      name: 'Streak Freeze',
      quantity: 1,
      coinPrice: 50,
    },
  ],
  BACKGROUND_BUNDLES: [
    {
      id: 'bundle-nature',
      name: 'Nature Bundle',
      bundleType: 'backgrounds',
      itemIds: ['bg-ocean', 'bg-forest'],
      coinPrice: 400,
    },
  ],
  ALL_BUNDLES: [
    {
      id: 'bundle-nature',
      name: 'Nature Bundle',
      bundleType: 'backgrounds',
      itemIds: ['bg-ocean', 'bg-forest'],
      coinPrice: 400,
    },
  ],
  STARTER_BUNDLES: [
    {
      id: 'starter-basic',
      name: 'Starter Pack',
      contents: {
        coins: 500,
        boosterId: 'boost-2x',
        characterId: 'dog',
      },
    },
  ],
}));

vi.mock('@/data/EggData', () => ({
  getEggById: vi.fn(() => null),
}));

describe('useShop', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    // Reset Zustand store to initial state
    useShopStore.setState({
      ownedCharacters: [],
      ownedBackgrounds: [],
      equippedBackground: null,
      purchasedStarterBundleIds: [],
      dailyDealPurchasedDate: null,
    });

    // Default mock implementations
    mockCoinSystem.canAfford.mockReturnValue(true);
    mockCoinSystem.spendCoins.mockResolvedValue(true);
    mockBoosterSystem.isBoosterActive.mockReturnValue(false);
    mockBoosterSystem.getBoosterType.mockReturnValue({
      id: 'boost-2x',
      name: '2x Booster',
      coinPrice: 100,
    });
  });

  describe('Inventory Loading', () => {
    it('should initialize with empty inventory', () => {
      const { result } = renderHook(() => useShop());

      expect(result.current.inventory).toEqual({
        ownedCharacters: [],
        ownedBackgrounds: [],
        equippedBackground: null,
        purchasedStarterBundleIds: [],
      });
    });

    it('should load saved inventory from store', () => {
      const savedInventory: ShopInventory = {
        ownedCharacters: ['dog'],
        ownedBackgrounds: ['bg-ocean'],
        equippedBackground: 'bg-ocean',
        purchasedStarterBundleIds: [],
      };

      setShopState(savedInventory);

      const { result } = renderHook(() => useShop());

      expect(result.current.inventory).toEqual(savedInventory);
    });

    it('should handle empty store gracefully', () => {
      const { result } = renderHook(() => useShop());

      expect(result.current.inventory.ownedCharacters).toEqual([]);
    });

    it('should handle partial inventory data', () => {
      setShopState({
        ownedCharacters: ['dog'],
      });

      const { result } = renderHook(() => useShop());

      expect(result.current.inventory.ownedCharacters).toEqual(['dog']);
      expect(result.current.inventory.ownedBackgrounds).toEqual([]);
    });
  });

  describe('isOwned Checks', () => {
    it('should correctly identify owned backgrounds', () => {
      setShopState({
        ownedBackgrounds: ['bg-ocean'],
      });

      const { result } = renderHook(() => useShop());

      expect(result.current.isOwned('bg-ocean', 'customize')).toBe(true);
      expect(result.current.isOwned('bg-forest', 'customize')).toBe(false);
    });

    it('should return false for non-customize categories', () => {
      setShopState({
        ownedCharacters: ['dog'],
      });

      const { result } = renderHook(() => useShop());

      // The isOwned function only checks backgrounds for 'customize' category
      // and returns false for other categories
      expect(result.current.isOwned('dog', 'pets')).toBe(false);
    });
  });

  describe('Purchase Functions - Success Cases', () => {
    it('should successfully purchase a background', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBackground('bg-ocean');
      });

      expect(purchaseResult).toEqual({
        success: true,
        message: 'Ocean View purchased!',
      });
      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(200, 'cosmetic', 'bg-ocean');
      expect(result.current.inventory.ownedBackgrounds).toContain('bg-ocean');
    });

    it('should successfully purchase streak freeze', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseStreakFreeze(3, 150);
      });

      expect(purchaseResult).toEqual({
        success: true,
        message: '3 Streak Freezes added!',
      });
      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(150, 'streak_freeze', 'streak_freeze_x3');
      expect(mockStreakSystem.earnStreakFreeze).toHaveBeenCalledTimes(3);
    });

    it('should successfully purchase a background bundle', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        purchaseResult = await result.current.purchaseBundle('bundle-nature');
      });

      expect(purchaseResult?.success).toBe(true);
      expect(purchaseResult?.message).toContain('Nature Bundle purchased!');
      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(400, 'cosmetic', 'bundle-nature');
      expect(result.current.inventory.ownedBackgrounds).toContain('bg-ocean');
      expect(result.current.inventory.ownedBackgrounds).toContain('bg-forest');
    });
  });

  describe('Purchase Functions - Failure Cases', () => {
    it('should fail to purchase non-existent background', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBackground('bg-non-existent');
      });

      expect(purchaseResult).toEqual({
        success: false,
        message: 'Background not found',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });

    it('should fail to purchase when insufficient coins', async () => {
      mockCoinSystem.canAfford.mockReturnValue(false);

      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBackground('bg-ocean');
      });

      expect(purchaseResult).toEqual({
        success: false,
        message: 'Not enough coins',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });

    it('should fail when coin spend fails', async () => {
      mockCoinSystem.spendCoins.mockResolvedValue(false);

      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBackground('bg-ocean');
      });

      // spendCoinsWithSync tries syncFromServer, which returns false, so message is about connection
      expect(purchaseResult).toEqual({
        success: false,
        message: 'Purchase failed. Please check your connection and try again.',
      });
    });

    it('should fail to purchase already owned background', async () => {
      setShopState({
        ownedBackgrounds: ['bg-ocean'],
      });

      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBackground('bg-ocean');
      });

      expect(purchaseResult).toEqual({
        success: false,
        message: 'You already own this background',
      });
    });

    it('should fail to purchase bundle when all items owned', async () => {
      setShopState({
        ownedBackgrounds: ['bg-ocean', 'bg-forest'],
      });

      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBundle('bundle-nature');
      });

      expect(purchaseResult).toEqual({
        success: false,
        message: 'You already own all items in this bundle',
      });
    });
  });

  describe('equipBackground Function', () => {
    it('should successfully equip owned background', () => {
      setShopState({
        ownedBackgrounds: ['bg-ocean'],
      });

      const { result } = renderHook(() => useShop());

      let success;
      act(() => {
        success = result.current.equipBackground('bg-ocean');
      });

      expect(success).toBe(true);
      expect(result.current.inventory.equippedBackground).toBe('bg-ocean');
    });

    it('should fail to equip unowned background', () => {
      const { result } = renderHook(() => useShop());

      let success;
      act(() => {
        success = result.current.equipBackground('bg-ocean');
      });

      expect(success).toBe(false);
      expect(result.current.inventory.equippedBackground).toBeNull();
    });

    it('should allow unequipping background by passing null', () => {
      setShopState({
        ownedBackgrounds: ['bg-ocean'],
        equippedBackground: 'bg-ocean',
      });

      const { result } = renderHook(() => useShop());

      let success;
      act(() => {
        success = result.current.equipBackground(null);
      });

      expect(success).toBe(true);
      expect(result.current.inventory.equippedBackground).toBeNull();
    });
  });

  describe('Bundle Ownership Checks', () => {
    it('should correctly check if background bundle is owned', () => {
      setShopState({
        ownedBackgrounds: ['bg-ocean', 'bg-forest'],
      });

      const { result } = renderHook(() => useShop());

      expect(result.current.isBundleOwned('bundle-nature')).toBe(true);
    });

    it('should return false if bundle partially owned', () => {
      setShopState({
        ownedBackgrounds: ['bg-ocean'],
      });

      const { result } = renderHook(() => useShop());

      expect(result.current.isBundleOwned('bundle-nature')).toBe(false);
    });

    it('should return false for non-existent bundle', () => {
      const { result } = renderHook(() => useShop());

      expect(result.current.isBundleOwned('non-existent')).toBe(false);
    });
  });

  describe('resetShop', () => {
    it('should reset shop inventory to defaults', () => {
      setShopState({
        ownedCharacters: ['dog'],
        ownedBackgrounds: ['bg-ocean'],
        equippedBackground: 'bg-ocean',
      });

      const { result } = renderHook(() => useShop());

      act(() => {
        result.current.resetShop();
      });

      expect(result.current.inventory).toEqual({
        ownedCharacters: [],
        ownedBackgrounds: [],
        equippedBackground: null,
        purchasedStarterBundleIds: [],
      });
    });
  });

  describe('Coin System Integration', () => {
    it('should expose coin balance from coin system', () => {
      const { result } = renderHook(() => useShop());

      expect(result.current.coinBalance).toBe(1000);
    });

    it('should expose canAfford from coin system', () => {
      const { result } = renderHook(() => useShop());

      expect(typeof result.current.canAfford).toBe('function');
    });
  });

  describe('purchaseItem routing', () => {
    it('should route customize items to purchaseBackground', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseItem('bg-ocean', 'customize');
      });

      expect(purchaseResult?.success).toBe(true);
      expect(result.current.inventory.ownedBackgrounds).toContain('bg-ocean');
    });

    it('should return error for invalid category', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseItem('some-item', 'pets');
      });

      expect(purchaseResult).toEqual({
        success: false,
        message: 'Invalid category',
      });
    });
  });
});
