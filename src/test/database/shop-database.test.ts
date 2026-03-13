/**
 * Shop Database Tests
 *
 * Tests the shop purchase flows as they interact with the database layer,
 * including server-validated coin spending, inventory persistence,
 * and error handling when the backend rejects operations.
 *
 * The shop sells backgrounds, bundles, boosters, and streak freezes.
 * Eggs and species selectors are handled by landStore, not shopStore.
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShop } from '@/hooks/useShop';
import { useShopStore } from '@/stores';
import { useCoinStore } from '@/stores/coinStore';
import type { ShopInventory } from '@/hooks/useShop';

// ─── Mock Dependencies ───────────────────────────────────────────────

const mockCoinSystem = {
  balance: 5000,
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

vi.mock('@/hooks/useAchievementTracking', () => ({
  dispatchAchievementEvent: vi.fn(),
  ACHIEVEMENT_EVENTS: { PURCHASE_MADE: 'PURCHASE_MADE' },
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

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
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
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

vi.mock('@/data/ShopData', () => ({
  PREMIUM_BACKGROUNDS: [
    { id: 'bg-ocean', name: 'Ocean View', coinPrice: 200, category: 'backgrounds' },
    { id: 'bg-forest', name: 'Forest', coinPrice: 250, category: 'backgrounds' },
    { id: 'bg-mountain', name: 'Mountain', coinPrice: 300, category: 'backgrounds' },
  ],
  UTILITY_ITEMS: [
    { id: 'streak-freeze-1', name: 'Time Crystal', quantity: 1, coinPrice: 200, category: 'utilities' },
    { id: 'streak-freeze-3', name: 'Crystal Cluster', quantity: 3, coinPrice: 550, category: 'utilities' },
  ],
  BACKGROUND_BUNDLES: [
    {
      id: 'bundle-nature',
      name: 'Nature Bundle',
      bundleType: 'backgrounds',
      itemIds: ['bg-ocean', 'bg-forest'],
      coinPrice: 400,
      category: 'bundles',
    },
  ],
  ALL_BUNDLES: [
    {
      id: 'bundle-nature',
      name: 'Nature Bundle',
      bundleType: 'backgrounds',
      itemIds: ['bg-ocean', 'bg-forest'],
      coinPrice: 400,
      category: 'bundles',
    },
  ],
  STARTER_BUNDLES: [],
}));

// ─── Helper ──────────────────────────────────────────────────────────

const setShopState = (inventory: Partial<ShopInventory>) => {
  useShopStore.setState({
    ownedCharacters: inventory.ownedCharacters ?? [],
    ownedBackgrounds: inventory.ownedBackgrounds ?? [],
    equippedBackground: inventory.equippedBackground ?? null,
    purchasedStarterBundleIds: inventory.purchasedStarterBundleIds ?? [],
  });
};

// ─── Tests ───────────────────────────────────────────────────────────

describe('Shop Database – Purchase Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    useShopStore.setState({
      ownedCharacters: [],
      ownedBackgrounds: [],
      equippedBackground: null,
      purchasedStarterBundleIds: [],
      dailyDealPurchasedDate: null,
    });
    mockCoinSystem.balance = 5000;
    mockCoinSystem.canAfford.mockReturnValue(true);
    mockCoinSystem.spendCoins.mockResolvedValue(true);
    mockBoosterSystem.isBoosterActive.mockReturnValue(false);
    mockBoosterSystem.getBoosterType.mockReturnValue({
      id: 'boost-2x',
      name: 'Focus Boost',
      coinPrice: 400,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Background Purchases ─────────────────────────────────────────

  describe('Background Purchase – Server Validation', () => {
    it('should call server-validated spendCoins for background purchase', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBackground('bg-ocean');
      });

      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(200, 'cosmetic', 'bg-ocean');
    });

    it('should add background to inventory only after server confirms spend', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        const res = await result.current.purchaseBackground('bg-ocean');
        expect(res.success).toBe(true);
      });

      expect(result.current.inventory.ownedBackgrounds).toContain('bg-ocean');
    });

    it('should NOT add background when server rejects spend', async () => {
      mockCoinSystem.spendCoins.mockResolvedValue(false);

      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBackground('bg-ocean');
      });

      expect(result.current.inventory.ownedBackgrounds).not.toContain('bg-ocean');
    });

    it('should trigger balance sync when server rejects spend', async () => {
      mockCoinSystem.spendCoins.mockResolvedValue(false);

      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBackground('bg-ocean');
      });

      expect(mockCoinSystem.syncFromServer).toHaveBeenCalled();
    });

    it('should reject purchase of non-existent background', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBackground('bg-nonexistent');
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        message: 'Background not found',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });

    it('should not call server when client knows balance is too low', async () => {
      mockCoinSystem.canAfford.mockReturnValue(false);

      const { result } = renderHook(() => useShop());

      const res = await act(async () => result.current.purchaseBackground('bg-ocean'));

      expect(res).toMatchObject({ success: false, message: 'Not enough coins' });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });
  });

  // ── Bundle Purchases ──────────────────────────────────────────────

  describe('Bundle Purchases – Server Validation', () => {
    it('should purchase background bundle and add all items', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBundle('bundle-nature');
      });

      expect(purchaseResult).toMatchObject({ success: true });
      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(400, 'cosmetic', 'bundle-nature');
      expect(result.current.inventory.ownedBackgrounds).toContain('bg-ocean');
      expect(result.current.inventory.ownedBackgrounds).toContain('bg-forest');
    });

    it('should skip already-owned items in bundle but still charge full price', async () => {
      setShopState({ ownedBackgrounds: ['bg-ocean'] });

      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBundle('bundle-nature');
      });

      // Should only add bg-forest since bg-ocean already owned
      const backgrounds = result.current.inventory.ownedBackgrounds;
      expect(backgrounds.filter(b => b === 'bg-ocean')).toHaveLength(1);
      expect(backgrounds).toContain('bg-forest');
    });

    it('should reject bundle if all items already owned', async () => {
      setShopState({ ownedBackgrounds: ['bg-ocean', 'bg-forest'] });

      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBundle('bundle-nature');
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        message: 'You already own all items in this bundle',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });

    it('should NOT add bundle items when server rejects spend', async () => {
      mockCoinSystem.spendCoins.mockResolvedValue(false);

      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBundle('bundle-nature');
      });

      expect(result.current.inventory.ownedBackgrounds).toEqual([]);
    });

    it('should reject purchase of non-existent bundle', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBundle('bundle-nonexistent');
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        message: 'Bundle not found',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });

    it('should report isBundleOwned correctly', () => {
      setShopState({ ownedBackgrounds: ['bg-ocean', 'bg-forest'] });

      const { result } = renderHook(() => useShop());

      expect(result.current.isBundleOwned('bundle-nature')).toBe(true);
    });

    it('should report isBundleOwned false when partially owned', () => {
      setShopState({ ownedBackgrounds: ['bg-ocean'] });

      const { result } = renderHook(() => useShop());

      expect(result.current.isBundleOwned('bundle-nature')).toBe(false);
    });
  });

  // ── Booster Purchases ─────────────────────────────────────────────

  describe('Booster Purchase – Server Validation', () => {
    it('should activate booster after server confirms spend', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBooster('boost-2x');
      });

      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(400, 'booster', 'boost-2x');
      expect(mockBoosterSystem.activateBooster).toHaveBeenCalledWith('boost-2x');
    });

    it('should NOT activate booster when server rejects spend', async () => {
      mockCoinSystem.spendCoins.mockResolvedValue(false);

      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBooster('boost-2x');
      });

      expect(mockBoosterSystem.activateBooster).not.toHaveBeenCalled();
    });

    it('should reject booster if one is already active', async () => {
      mockBoosterSystem.isBoosterActive.mockReturnValue(true);

      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBooster('boost-2x');
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        message: 'You already have an active booster',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });

    it('should reject non-existent booster', async () => {
      mockBoosterSystem.getBoosterType.mockReturnValue(null);

      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseBooster('boost-nonexistent');
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        message: 'Booster not found',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });
  });

  // ── Streak Freeze Purchase ────────────────────────────────────────

  describe('Streak Freeze Purchase – Server Validation', () => {
    it('should award streak freezes after server confirms spend', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseStreakFreeze(3, 550);
      });

      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(550, 'streak_freeze', 'streak_freeze_x3');
      expect(mockStreakSystem.earnStreakFreeze).toHaveBeenCalledTimes(3);
    });

    it('should NOT award streak freezes when server rejects', async () => {
      mockCoinSystem.spendCoins.mockResolvedValue(false);

      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseStreakFreeze(3, 550);
      });

      expect(mockStreakSystem.earnStreakFreeze).not.toHaveBeenCalled();
    });

    it('should reject when client cannot afford streak freeze', async () => {
      mockCoinSystem.canAfford.mockReturnValue(false);

      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        purchaseResult = await result.current.purchaseStreakFreeze(1, 200);
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        message: 'Not enough coins',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });

    it('should award single streak freeze', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseStreakFreeze(1, 200);
      });

      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(200, 'streak_freeze', 'streak_freeze_x1');
      expect(mockStreakSystem.earnStreakFreeze).toHaveBeenCalledTimes(1);
    });
  });

  // ── purchaseItem Routing ──────────────────────────────────────────

  describe('purchaseItem – Category Routing', () => {
    it('should route customize category to purchaseBackground', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseItem('bg-ocean', 'customize');
      });

      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(200, 'cosmetic', 'bg-ocean');
      expect(result.current.inventory.ownedBackgrounds).toContain('bg-ocean');
    });

    it('should route powerups booster to purchaseBooster', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseItem('boost-2x', 'powerups');
      });

      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(400, 'booster', 'boost-2x');
      expect(mockBoosterSystem.activateBooster).toHaveBeenCalledWith('boost-2x');
    });

    it('should route powerups streak freeze to purchaseStreakFreeze', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseItem('streak-freeze-1', 'powerups');
      });

      expect(mockCoinSystem.spendCoins).toHaveBeenCalledWith(200, 'streak_freeze', 'streak_freeze_x1');
      expect(mockStreakSystem.earnStreakFreeze).toHaveBeenCalledTimes(1);
    });

    it('should return failure for invalid category', async () => {
      const { result } = renderHook(() => useShop());

      let purchaseResult;
      await act(async () => {
        // @ts-expect-error - testing invalid category
        purchaseResult = await result.current.purchaseItem('bg-ocean', 'invalid');
      });

      expect(purchaseResult).toMatchObject({
        success: false,
        message: 'Invalid category',
      });
    });
  });

  // ── Duplicate Prevention ──────────────────────────────────────────

  describe('Duplicate Purchase Prevention', () => {
    it('should prevent buying the same background twice', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBackground('bg-ocean');
      });

      vi.clearAllMocks();

      let secondPurchase;
      await act(async () => {
        secondPurchase = await result.current.purchaseBackground('bg-ocean');
      });

      expect(secondPurchase).toMatchObject({
        success: false,
        message: 'You already own this background',
      });
      expect(mockCoinSystem.spendCoins).not.toHaveBeenCalled();
    });
  });

  // ── Equip Operations ──────────────────────────────────────────────

  describe('Equip Background – Ownership Check', () => {
    it('should allow equipping an owned background', () => {
      setShopState({ ownedBackgrounds: ['bg-ocean'] });

      const { result } = renderHook(() => useShop());

      let success;
      act(() => {
        success = result.current.equipBackground('bg-ocean');
      });

      expect(success).toBe(true);
      expect(result.current.inventory.equippedBackground).toBe('bg-ocean');
    });

    it('should reject equipping an unowned background', () => {
      const { result } = renderHook(() => useShop());

      let success;
      act(() => {
        success = result.current.equipBackground('bg-ocean');
      });

      expect(success).toBe(false);
      expect(result.current.inventory.equippedBackground).toBeNull();
    });

    it('should allow unequipping by passing null', () => {
      setShopState({ ownedBackgrounds: ['bg-ocean'], equippedBackground: 'bg-ocean' });

      const { result } = renderHook(() => useShop());

      let success;
      act(() => {
        success = result.current.equipBackground(null);
      });

      expect(success).toBe(true);
      expect(result.current.inventory.equippedBackground).toBeNull();
    });
  });

  // ── isOwned Helper ────────────────────────────────────────────────

  describe('isOwned Helper', () => {
    it('should return true for owned background via customize category', () => {
      setShopState({ ownedBackgrounds: ['bg-ocean'] });

      const { result } = renderHook(() => useShop());

      expect(result.current.isOwned('bg-ocean', 'customize')).toBe(true);
    });

    it('should return false for unowned background', () => {
      const { result } = renderHook(() => useShop());

      expect(result.current.isOwned('bg-ocean', 'customize')).toBe(false);
    });

    it('should return false for non-customize categories', () => {
      const { result } = renderHook(() => useShop());

      expect(result.current.isOwned('some-item', 'powerups')).toBe(false);
    });
  });

  // ── Shop Reset ────────────────────────────────────────────────────

  describe('Shop Reset', () => {
    it('should clear all owned items and equipped background', async () => {
      setShopState({
        ownedBackgrounds: ['bg-ocean', 'bg-forest'],
        equippedBackground: 'bg-ocean',
      });

      const { result } = renderHook(() => useShop());

      act(() => {
        result.current.resetShop();
      });

      expect(result.current.inventory.ownedCharacters).toEqual([]);
      expect(result.current.inventory.ownedBackgrounds).toEqual([]);
      expect(result.current.inventory.equippedBackground).toBeNull();
    });
  });

  // ── Inventory Persistence ─────────────────────────────────────────

  describe('Inventory State Persistence', () => {
    it('should persist purchased background in Zustand store', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBackground('bg-ocean');
      });

      const storeState = useShopStore.getState();
      expect(storeState.ownedBackgrounds).toContain('bg-ocean');
    });

    it('should persist across hook re-renders', async () => {
      const { result, rerender } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBackground('bg-ocean');
      });

      rerender();

      expect(result.current.inventory.ownedBackgrounds).toContain('bg-ocean');
    });

    it('should persist to localStorage via Zustand', async () => {
      const { result } = renderHook(() => useShop());

      await act(async () => {
        await result.current.purchaseBackground('bg-ocean');
      });

      // Wait for Zustand persistence
      await new Promise(resolve => setTimeout(resolve, 50));

      const saved = localStorage.getItem('nomo_shop_inventory');
      expect(saved).not.toBeNull();
      const parsed = JSON.parse(saved!);
      expect(parsed.state.ownedBackgrounds).toContain('bg-ocean');
    });
  });
});

describe('Shop Database – Coin Store Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    useCoinStore.setState({
      balance: 500,
      totalEarned: 500,
      totalSpent: 0,
      lastServerSync: null,
      pendingServerValidation: false,
    });
  });

  it('should track balance correctly after adding coins', () => {
    const { addCoins } = useCoinStore.getState();

    act(() => {
      addCoins(100);
    });

    const state = useCoinStore.getState();
    expect(state.balance).toBe(600);
    expect(state.totalEarned).toBe(600);
    expect(state.pendingServerValidation).toBe(true);
  });

  it('should deduct balance and track spending', () => {
    const { spendCoins } = useCoinStore.getState();

    let success;
    act(() => {
      success = spendCoins(200);
    });

    expect(success).toBe(true);
    const state = useCoinStore.getState();
    expect(state.balance).toBe(300);
    expect(state.totalSpent).toBe(200);
  });

  it('should reject spending more than balance', () => {
    const { spendCoins } = useCoinStore.getState();

    let success;
    act(() => {
      success = spendCoins(999);
    });

    expect(success).toBe(false);
    expect(useCoinStore.getState().balance).toBe(500);
  });

  it('should override local state on server sync', () => {
    const { addCoins, syncFromServer } = useCoinStore.getState();

    act(() => {
      addCoins(100); // Local: 600
    });

    act(() => {
      syncFromServer(550, 550, 0); // Server says 550
    });

    const state = useCoinStore.getState();
    expect(state.balance).toBe(550);
    expect(state.totalEarned).toBe(550);
    expect(state.pendingServerValidation).toBe(false);
    expect(state.lastServerSync).not.toBeNull();
  });

  it('should reject negative coin amounts', () => {
    const { addCoins } = useCoinStore.getState();

    act(() => {
      addCoins(-100);
    });

    expect(useCoinStore.getState().balance).toBe(500);
  });

  it('should correctly report canAfford', () => {
    const state = useCoinStore.getState();

    expect(state.canAfford(500)).toBe(true);
    expect(state.canAfford(501)).toBe(false);
    expect(state.canAfford(0)).toBe(true);
  });
});

describe('Shop Database – Shop Store Direct Operations', () => {
  beforeEach(() => {
    localStorage.clear();
    useShopStore.setState({
      ownedCharacters: [],
      ownedBackgrounds: [],
      equippedBackground: null,
      purchasedStarterBundleIds: [],
      dailyDealPurchasedDate: null,
    });
  });

  it('should add characters to inventory without duplicates', () => {
    const store = useShopStore.getState();
    store.addOwnedCharacter('pet-1');
    store.addOwnedCharacter('pet-1'); // duplicate
    store.addOwnedCharacter('pet-2');

    const state = useShopStore.getState();
    expect(state.ownedCharacters).toEqual(['pet-1', 'pet-2']);
  });

  it('should add backgrounds to inventory without duplicates', () => {
    const store = useShopStore.getState();
    store.addOwnedBackground('bg-1');
    store.addOwnedBackground('bg-1'); // duplicate
    store.addOwnedBackground('bg-2');

    const state = useShopStore.getState();
    expect(state.ownedBackgrounds).toEqual(['bg-1', 'bg-2']);
  });

  it('should batch-add characters', () => {
    const store = useShopStore.getState();
    store.addOwnedCharacters(['pet-1', 'pet-2', 'pet-3']);

    expect(useShopStore.getState().ownedCharacters).toEqual(['pet-1', 'pet-2', 'pet-3']);
  });

  it('should batch-add backgrounds without duplicates', () => {
    useShopStore.getState().addOwnedBackground('bg-1');
    useShopStore.getState().addOwnedBackgrounds(['bg-1', 'bg-2', 'bg-3']);

    expect(useShopStore.getState().ownedBackgrounds).toEqual(['bg-1', 'bg-2', 'bg-3']);
  });

  it('should track purchased starter bundle IDs', () => {
    const store = useShopStore.getState();
    store.addPurchasedStarterBundleId('co.phonoinc.app.bundle.welcome');
    store.addPurchasedStarterBundleId('co.phonoinc.app.bundle.welcome'); // duplicate

    expect(useShopStore.getState().purchasedStarterBundleIds).toEqual([
      'co.phonoinc.app.bundle.welcome',
    ]);
  });

  it('should set and check equipped background', () => {
    const store = useShopStore.getState();
    store.setEquippedBackground('bg-ocean');

    expect(useShopStore.getState().equippedBackground).toBe('bg-ocean');

    store.setEquippedBackground(null);
    expect(useShopStore.getState().equippedBackground).toBeNull();
  });

  it('should report character and background ownership via selectors', () => {
    useShopStore.getState().addOwnedCharacter('pet-1');
    useShopStore.getState().addOwnedBackground('bg-ocean');

    const state = useShopStore.getState();
    expect(state.isCharacterOwned('pet-1')).toBe(true);
    expect(state.isCharacterOwned('pet-2')).toBe(false);
    expect(state.isBackgroundOwned('bg-ocean')).toBe(true);
    expect(state.isBackgroundOwned('bg-forest')).toBe(false);
  });

  it('should set inventory partially', () => {
    useShopStore.getState().setInventory({
      ownedBackgrounds: ['bg-ocean'],
      equippedBackground: 'bg-ocean',
    });

    const state = useShopStore.getState();
    expect(state.ownedBackgrounds).toEqual(['bg-ocean']);
    expect(state.equippedBackground).toBe('bg-ocean');
    expect(state.ownedCharacters).toEqual([]); // untouched
  });

  it('should reset shop to initial state', () => {
    const store = useShopStore.getState();
    store.addOwnedCharacter('pet-1');
    store.addOwnedBackground('bg-ocean');
    store.setEquippedBackground('bg-ocean');
    store.addPurchasedStarterBundleId('bundle-1');

    store.resetShop();

    const state = useShopStore.getState();
    expect(state.ownedCharacters).toEqual([]);
    expect(state.ownedBackgrounds).toEqual([]);
    expect(state.equippedBackground).toBeNull();
    expect(state.purchasedStarterBundleIds).toEqual([]);
  });

  it('should track daily deal purchase by date', () => {
    const store = useShopStore.getState();

    expect(store.isDailyDealPurchased()).toBe(false);

    store.setDailyDealPurchased();

    const today = new Date().toISOString().split('T')[0];
    expect(useShopStore.getState().dailyDealPurchasedDate).toBe(today);
    expect(useShopStore.getState().isDailyDealPurchased()).toBe(true);
  });

  it('should use nomo_shop_inventory as storage key', async () => {
    useShopStore.getState().addOwnedBackground('bg-test');

    // Wait for Zustand persistence
    await new Promise(resolve => setTimeout(resolve, 50));

    const saved = localStorage.getItem('nomo_shop_inventory');
    expect(saved).not.toBeNull();
    const parsed = JSON.parse(saved!);
    expect(parsed.state.ownedBackgrounds).toContain('bg-test');
  });
});

describe('Shop Database – Egg Data Structure', () => {
  it('should export egg types with correct structure', async () => {
    const { EGG_TYPES } = await import('@/data/EggData');

    expect(EGG_TYPES.length).toBeGreaterThanOrEqual(4);

    for (const egg of EGG_TYPES) {
      expect(egg).toHaveProperty('id');
      expect(egg).toHaveProperty('name');
      expect(egg).toHaveProperty('coinPrice');
      expect(egg).toHaveProperty('rarityWeights');
      expect(typeof egg.coinPrice).toBe('number');
      expect(egg.coinPrice).toBeGreaterThan(0);

      // Rarity weights should sum to 100
      const weights = egg.rarityWeights;
      const sum = weights.common + weights.uncommon + weights.rare + weights.epic + weights.legendary;
      expect(sum).toBe(100);
    }
  });

  it('should have getEggById function that finds eggs', async () => {
    const { getEggById } = await import('@/data/EggData');

    const starterEgg = getEggById('egg-starter');
    expect(starterEgg).toBeDefined();
    expect(starterEgg!.name).toBe('Starter Egg');
    expect(starterEgg!.coinPrice).toBe(50);

    const noEgg = getEggById('egg-nonexistent');
    expect(noEgg).toBeUndefined();
  });

  it('should have correct species selector prices', async () => {
    const { SPECIES_SELECTOR_DISCOVERED_PRICE, SPECIES_SELECTOR_UNDISCOVERED_PRICE } =
      await import('@/data/EggData');

    expect(SPECIES_SELECTOR_DISCOVERED_PRICE).toBe(5000);
    expect(SPECIES_SELECTOR_UNDISCOVERED_PRICE).toBe(8000);
  });
});

describe('Shop Database – Egg Discount Helper', () => {
  it('should calculate discounted egg price', async () => {
    const { getEggDiscountedPrice } = await import('@/hooks/useShop');

    expect(getEggDiscountedPrice(1000, 30)).toBe(700); // 30% off
    expect(getEggDiscountedPrice(1000, 0)).toBe(1000); // no discount
    expect(getEggDiscountedPrice(1000, -10)).toBe(1000); // negative = no discount
    expect(getEggDiscountedPrice(600, 35)).toBe(390); // ceil(600 * 0.65)
  });
});
