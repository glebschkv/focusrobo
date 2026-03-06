import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePremiumStatus, dispatchSubscriptionChange, TIER_BENEFITS, SUBSCRIPTION_PLANS } from '@/hooks/usePremiumStatus';

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

// Mock authStore
vi.mock('@/stores/authStore', () => ({
  useIsGuestMode: () => false,
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ session: null }),
}));

// Mock Supabase
const mockSupabaseInvoke = vi.fn();
const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });
const mockRpc = vi.fn().mockResolvedValue({ data: [], error: null });
vi.mock('@/integrations/supabase/client', () => ({
  isSupabaseConfigured: false,
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockSupabaseInvoke(...args),
    },
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

// Mock import.meta.env (stored for reference)

describe('usePremiumStatus', () => {
  const STORAGE_KEY = 'petIsland_premium';

  // Helper to create a future date
  const getFutureDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  };

  // Helper to create a past date
  const getPastDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset to dev mode
    vi.stubGlobal('import', { meta: { env: { PROD: false, DEV: true } } });
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  describe('Initialization', () => {
    it('should initialize with default free tier when no saved data', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.tier).toBe('free');
      expect(result.current.isPremium).toBe(false);
      expect(result.current.expiresAt).toBeNull();
      expect(result.current.purchasedAt).toBeNull();
      expect(result.current.currentPlan).toBeNull();
    });

    it('should load saved premium state from localStorage', async () => {
      const savedState = {
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('premium');
      expect(result.current.isPremium).toBe(true);
      expect(result.current.expiresAt).toBe(savedState.expiresAt);
    });

    it('should normalize legacy premium_plus tier to premium on load', async () => {
      const savedState = {
        tier: 'premium_plus',
        expiresAt: getFutureDate(365),
        purchasedAt: getPastDate(10),
        planId: 'premium-plus-yearly',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('premium');
      expect(result.current.isPremium).toBe(true);
    });

    it('should normalize legacy lifetime tier to premium on load', async () => {
      const savedState = {
        tier: 'lifetime',
        expiresAt: null,
        purchasedAt: getPastDate(100),
        planId: 'premium-lifetime',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // lifetime gets normalized to premium
      expect(result.current.tier).toBe('premium');
      expect(result.current.isPremium).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json data');

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('free');
      expect(result.current.isPremium).toBe(false);
    });

    it('should clear state and set to free when subscription is expired', async () => {
      const savedState = {
        tier: 'premium',
        expiresAt: getPastDate(5), // Expired 5 days ago
        purchasedAt: getPastDate(35),
        planId: 'premium-monthly',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('free');
      expect(result.current.isPremium).toBe(false);
      // Should have cleared localStorage
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should keep active subscription when not expired', async () => {
      const futureExpiry = getFutureDate(10);
      const savedState = {
        tier: 'premium',
        expiresAt: futureExpiry,
        purchasedAt: getPastDate(20),
        planId: 'premium-monthly',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('premium');
      expect(result.current.isPremium).toBe(true);
      expect(result.current.expiresAt).toBe(futureExpiry);
    });
  });

  describe('Subscription Change Events', () => {
    it('should update state when subscription change event is fired', async () => {
      const savedState = {
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('premium');

      // Update localStorage and dispatch event to free
      localStorage.removeItem(STORAGE_KEY);

      act(() => {
        dispatchSubscriptionChange('free');
      });

      await waitFor(() => {
        expect(result.current.tier).toBe('free');
      });

      expect(result.current.isPremium).toBe(false);
    });

    it('should handle downgrade to free tier via event', async () => {
      const savedState = {
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      // Clear localStorage and dispatch free event
      localStorage.removeItem(STORAGE_KEY);

      act(() => {
        dispatchSubscriptionChange('free');
      });

      await waitFor(() => {
        expect(result.current.tier).toBe('free');
      });

      expect(result.current.isPremium).toBe(false);
    });
  });

  describe('Premium Tier Detection', () => {
    it('should correctly identify free tier', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.tier).toBe('free');
      expect(result.current.isPremium).toBe(false);
    });

    it('should correctly identify premium tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.isPremium).toBe(true);
    });
  });

  describe('Legacy Tier Migration', () => {
    it('should normalize stored premium_plus to premium', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium_plus',
        expiresAt: getFutureDate(365),
        purchasedAt: getPastDate(10),
        planId: 'premium-plus-yearly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('premium');
      expect(result.current.isPremium).toBe(true);

      // Should have updated localStorage with normalized tier
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(saved.tier).toBe('premium');
    });

    it('should normalize stored lifetime to premium', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'lifetime',
        expiresAt: null,
        purchasedAt: getPastDate(100),
        planId: 'premium-lifetime',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('premium');
      expect(result.current.isPremium).toBe(true);

      // Should have updated localStorage with normalized tier
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(saved.tier).toBe('premium');
    });

    it('should normalize unknown tier to free', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'super_premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'some-plan',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Unknown tier normalizes to free, and free tier is not loaded
      expect(result.current.tier).toBe('free');
      expect(result.current.isPremium).toBe(false);
    });
  });

  describe('Tier Benefits', () => {
    it('should return free tier benefits for free users', () => {
      const { result } = renderHook(() => usePremiumStatus());

      const benefits = result.current.getTierBenefits();

      expect(benefits).toEqual(TIER_BENEFITS.free);
      expect(benefits.coinMultiplier).toBe(1);
      expect(benefits.xpMultiplier).toBe(1);
      expect(benefits.monthlyStreakFreezes).toBe(0);
      expect(benefits.soundMixingSlots).toBe(1);
      expect(benefits.focusPresetSlots).toBe(1);
      expect(benefits.loginCoinMultiplier).toBe(1);
      expect(benefits.analyticsAccess).toBe('basic');
      expect(benefits.eggDiscountPercent).toBe(0);
    });

    it('should return premium tier benefits for premium users', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      const benefits = result.current.getTierBenefits();

      expect(benefits).toEqual(TIER_BENEFITS.premium);
      expect(benefits.coinMultiplier).toBe(2);
      expect(benefits.xpMultiplier).toBe(2);
      expect(benefits.monthlyStreakFreezes).toBe(3);
      expect(benefits.soundMixingSlots).toBe(3);
      expect(benefits.focusPresetSlots).toBe(5);
      expect(benefits.loginCoinMultiplier).toBe(2);
      expect(benefits.analyticsAccess).toBe('full');
      expect(benefits.eggDiscountPercent).toBe(15);
    });
  });

  describe('Multipliers', () => {
    it('should return correct coin multiplier for free tier', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.getCoinMultiplier()).toBe(1);
    });

    it('should return correct coin multiplier for premium tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.getCoinMultiplier()).toBe(2);
    });

    it('should return correct XP multiplier for free tier', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.getXPMultiplier()).toBe(1);
    });

    it('should return correct XP multiplier for premium tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.getXPMultiplier()).toBe(2);
    });
  });

  describe('Sound Mixing and Focus Preset Slots', () => {
    it('should return 1 sound mixing slot for free users', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.getSoundMixingSlots()).toBe(1);
    });

    it('should return 3 sound mixing slots for premium users', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.getSoundMixingSlots()).toBe(3);
    });

    it('should return 1 focus preset slot for free users', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.getFocusPresetSlots()).toBe(1);
    });

    it('should return 5 focus preset slots for premium users', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.getFocusPresetSlots()).toBe(5);
    });
  });

  describe('Analytics Access', () => {
    it('should return basic analytics for free tier', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.hasFullAnalytics()).toBe(false);
    });

    it('should return full analytics for premium tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.hasFullAnalytics()).toBe(true);
    });
  });

  describe('Egg Discount', () => {
    it('should return 0% egg discount for free tier', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.getEggDiscountPercent()).toBe(0);
    });

    it('should return 15% egg discount for premium tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.getEggDiscountPercent()).toBe(15);
    });
  });

  describe('Login Coin Multiplier', () => {
    it('should return 1x login coin multiplier for free tier', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.getLoginCoinMultiplier()).toBe(1);
    });

    it('should return 2x login coin multiplier for premium tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.getLoginCoinMultiplier()).toBe(2);
    });
  });

  describe('Monthly Streak Freezes', () => {
    it('should return 0 streak freezes for free tier', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.getMonthlyStreakFreezes()).toBe(0);
    });

    it('should return 3 streak freezes for premium tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.getMonthlyStreakFreezes()).toBe(3);
    });
  });

  describe('checkAndGrantMonthlyStreakFreezes', () => {
    it('should not grant freezes for free tier', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.checkAndGrantMonthlyStreakFreezes();
      });

      expect(grantResult?.granted).toBe(false);
      expect(grantResult?.amount).toBe(0);
    });

    it('should grant freezes for premium tier when not granted this month', async () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The useEffect automatically grants streak freezes on mount for premium users
      // So we check that the event was dispatched during initialization
      await waitFor(() => {
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'petIsland_grantStreakFreezes',
            detail: { amount: 3 },
          })
        );
      });

      // Calling again should not grant (already granted this month)
      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.checkAndGrantMonthlyStreakFreezes();
      });

      expect(grantResult?.granted).toBe(false);
      expect(grantResult?.amount).toBe(0);

      dispatchEventSpy.mockRestore();
    });

    it('should not grant freezes if already granted this month', async () => {
      const now = new Date();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
        lastStreakFreezeGrant: now.toISOString(), // Already granted today
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.checkAndGrantMonthlyStreakFreezes();
      });

      expect(grantResult?.granted).toBe(false);
      expect(grantResult?.amount).toBe(0);
    });

    it('should grant freezes in a new month', async () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      // Last grant was last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(365),
        purchasedAt: getPastDate(40),
        planId: 'premium-yearly',
        lastStreakFreezeGrant: lastMonth.toISOString(),
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // The useEffect automatically grants streak freezes on mount when last grant was previous month
      await waitFor(() => {
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'petIsland_grantStreakFreezes',
            detail: { amount: 3 },
          })
        );
      });

      // Calling again should not grant (already granted this month due to auto-grant)
      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.checkAndGrantMonthlyStreakFreezes();
      });

      expect(grantResult?.granted).toBe(false);
      expect(grantResult?.amount).toBe(0);

      dispatchEventSpy.mockRestore();
    });
  });

  describe('grantBonusCoins', () => {
    it('should not grant bonus coins for invalid plan', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.grantBonusCoins('invalid-plan-id');
      });

      expect(grantResult?.granted).toBe(false);
      expect(grantResult?.amount).toBe(0);
    });

    it('should grant 500 bonus coins for premium-monthly plan', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.grantBonusCoins('premium-monthly');
      });

      expect(grantResult?.granted).toBe(true);
      expect(grantResult?.amount).toBe(500);

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'petIsland_grantBonusCoins',
          detail: { amount: 500, planId: 'premium-monthly' },
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('should grant 1500 bonus coins for premium-yearly plan', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(365),
        purchasedAt: getPastDate(5),
        planId: 'premium-yearly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.grantBonusCoins('premium-yearly');
      });

      expect(grantResult?.granted).toBe(true);
      expect(grantResult?.amount).toBe(1500);
    });

    it('should grant 0 bonus coins for premium-weekly plan', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(7),
        purchasedAt: getPastDate(1),
        planId: 'premium-weekly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.grantBonusCoins('premium-weekly');
      });

      // Weekly plan has 0 bonus coins, so nothing to grant
      expect(grantResult?.granted).toBe(false);
      expect(grantResult?.amount).toBe(0);
    });

    it('should not grant bonus coins if already granted for same plan', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
        bonusCoinsGrantedForPlan: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.grantBonusCoins('premium-monthly');
      });

      expect(grantResult?.granted).toBe(false);
      expect(grantResult?.amount).toBe(0);
    });

    it('should grant bonus coins for different plan', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(365),
        purchasedAt: getPastDate(5),
        planId: 'premium-yearly',
        bonusCoinsGrantedForPlan: 'premium-monthly', // Previous plan
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let grantResult: { granted: boolean; amount: number } | undefined;
      act(() => {
        grantResult = result.current.grantBonusCoins('premium-yearly');
      });

      expect(grantResult?.granted).toBe(true);
      expect(grantResult?.amount).toBe(1500);
    });
  });

  describe('validatePurchase', () => {
    it('should validate purchase successfully', async () => {
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: {
          success: true,
          subscription: {
            tier: 'premium',
            expiresAt: getFutureDate(30),
            purchasedAt: new Date().toISOString(),
          },
        },
        error: null,
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let validateResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        validateResult = await result.current.validatePurchase(
          'com.fonoinc.app.premium.monthly',
          'txn_123',
          'receipt_data'
        );
      });

      expect(validateResult?.success).toBe(true);
      expect(validateResult?.message).toBe('Purchase validated successfully!');
      expect(result.current.tier).toBe('premium');
    });

    it('should handle validation failure from server', async () => {
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid receipt' },
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let validateResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        validateResult = await result.current.validatePurchase(
          'com.fonoinc.app.premium.monthly',
          'txn_123',
          'receipt_data'
        );
      });

      expect(validateResult?.success).toBe(false);
      expect(validateResult?.message).toBe('Failed to validate purchase. Please try again.');
      expect(result.current.tier).toBe('free');
    });

    it('should handle validation response with success false', async () => {
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: {
          success: false,
          error: 'Receipt already used',
        },
        error: null,
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let validateResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        validateResult = await result.current.validatePurchase(
          'com.fonoinc.app.premium.monthly',
          'txn_123',
          'receipt_data'
        );
      });

      expect(validateResult?.success).toBe(false);
      expect(validateResult?.message).toBe('Receipt already used');
    });

    it('should handle network errors during validation', async () => {
      mockSupabaseInvoke.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let validateResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        validateResult = await result.current.validatePurchase(
          'com.fonoinc.app.premium.monthly',
          'txn_123',
          'receipt_data'
        );
      });

      expect(validateResult?.success).toBe(false);
      expect(validateResult?.message).toBe('An error occurred during validation');
    });

    it('should dispatch subscription change event after successful validation', async () => {
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: {
          success: true,
          subscription: {
            tier: 'premium',
            expiresAt: getFutureDate(30),
            purchasedAt: new Date().toISOString(),
          },
        },
        error: null,
      });

      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.validatePurchase(
          'com.fonoinc.app.premium.monthly',
          'txn_456'
        );
      });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'petIsland_subscriptionChange',
          detail: { tier: 'premium' },
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('should normalize legacy tier from server during validation', async () => {
      mockSupabaseInvoke.mockResolvedValueOnce({
        data: {
          success: true,
          subscription: {
            tier: 'premium_plus', // legacy tier from server
            expiresAt: getFutureDate(365),
            purchasedAt: new Date().toISOString(),
          },
        },
        error: null,
      });

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.validatePurchase(
          'com.fonoinc.app.premium.yearly',
          'txn_789'
        );
      });

      // Should be normalized to 'premium'
      expect(result.current.tier).toBe('premium');
      expect(result.current.isPremium).toBe(true);
    });
  });

  describe('purchaseSubscription (dev mode)', () => {
    it('should simulate weekly subscription purchase in dev mode', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let purchaseResult: { success: boolean; message: string } | undefined;
      act(() => {
        purchaseResult = result.current.purchaseSubscription('premium-weekly');
      });

      expect(purchaseResult?.success).toBe(true);
      expect(purchaseResult?.message).toBe('Successfully subscribed to Premium Weekly!');
      expect(result.current.tier).toBe('premium');
      expect(result.current.expiresAt).not.toBeNull();
    });

    it('should simulate monthly subscription purchase in dev mode', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let purchaseResult: { success: boolean; message: string } | undefined;
      act(() => {
        purchaseResult = result.current.purchaseSubscription('premium-monthly');
      });

      expect(purchaseResult?.success).toBe(true);
      expect(purchaseResult?.message).toBe('Successfully subscribed to Premium Monthly!');
      expect(result.current.tier).toBe('premium');
      expect(result.current.expiresAt).not.toBeNull();
    });

    it('should simulate yearly subscription purchase in dev mode', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let purchaseResult: { success: boolean; message: string } | undefined;
      act(() => {
        purchaseResult = result.current.purchaseSubscription('premium-yearly');
      });

      expect(purchaseResult?.success).toBe(true);
      expect(purchaseResult?.message).toBe('Successfully subscribed to Premium Yearly!');
      expect(result.current.tier).toBe('premium');
      expect(result.current.isPremium).toBe(true);
      expect(result.current.expiresAt).not.toBeNull();
    });

    it('should fail for invalid plan ID', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let purchaseResult: { success: boolean; message: string } | undefined;
      act(() => {
        purchaseResult = result.current.purchaseSubscription('invalid-plan');
      });

      expect(purchaseResult?.success).toBe(false);
      expect(purchaseResult?.message).toBe('Plan not found');
      expect(result.current.tier).toBe('free');
    });

    it('should dispatch subscription change event after purchase', async () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.purchaseSubscription('premium-monthly');
      });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'petIsland_subscriptionChange',
          detail: { tier: 'premium' },
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('should save purchase to localStorage', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.purchaseSubscription('premium-monthly');
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.tier).toBe('premium');
      expect(parsed.planId).toBe('premium-monthly');
      expect(parsed.purchasedAt).not.toBeNull();
    });
  });

  describe('restorePurchases', () => {
    it('should restore purchases from localStorage', async () => {
      const savedState = {
        tier: 'premium',
        expiresAt: getFutureDate(15),
        purchasedAt: getPastDate(15),
        planId: 'premium-monthly',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let restoreResult: { success: boolean; message: string } | undefined;
      act(() => {
        restoreResult = result.current.restorePurchases();
      });

      expect(restoreResult?.success).toBe(true);
      expect(restoreResult?.message).toBe('Purchases restored successfully!');
      expect(result.current.tier).toBe('premium');
    });

    it('should fail when no previous purchases exist', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let restoreResult: { success: boolean; message: string } | undefined;
      act(() => {
        restoreResult = result.current.restorePurchases();
      });

      expect(restoreResult?.success).toBe(false);
      expect(restoreResult?.message).toBe('No previous purchases found');
    });

    it('should fail when stored tier is free', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'free',
        expiresAt: null,
        purchasedAt: null,
        planId: null,
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let restoreResult: { success: boolean; message: string } | undefined;
      act(() => {
        restoreResult = result.current.restorePurchases();
      });

      expect(restoreResult?.success).toBe(false);
      expect(restoreResult?.message).toBe('No previous purchases found');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription and reset to free tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      act(() => {
        result.current.cancelSubscription();
      });

      expect(result.current.tier).toBe('free');
      expect(result.current.isPremium).toBe(false);
      expect(result.current.expiresAt).toBeNull();
    });

    it('should clear localStorage on cancel', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      act(() => {
        result.current.cancelSubscription();
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('should dispatch subscription change event on cancel', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      act(() => {
        result.current.cancelSubscription();
      });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'petIsland_subscriptionChange',
          detail: { tier: 'free' },
        })
      );

      dispatchEventSpy.mockRestore();
    });
  });

  describe('hasFeature', () => {
    it('should return false for all features when free tier', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.hasFeature('ambient_sounds')).toBe(false);
      expect(result.current.hasFeature('auto_breaks')).toBe(false);
      expect(result.current.hasFeature('session_notes')).toBe(false);
      expect(result.current.hasFeature('advanced_analytics')).toBe(false);
      expect(result.current.hasFeature('sound_mixing')).toBe(false);
      expect(result.current.hasFeature('focus_presets')).toBe(false);
      expect(result.current.hasFeature('all_timer_backgrounds')).toBe(false);
      expect(result.current.hasFeature('website_blocking')).toBe(false);
    });

    it('should return true for all features when premium tier', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      expect(result.current.hasFeature('ambient_sounds')).toBe(true);
      expect(result.current.hasFeature('auto_breaks')).toBe(true);
      expect(result.current.hasFeature('session_notes')).toBe(true);
      expect(result.current.hasFeature('advanced_analytics')).toBe(true);
      expect(result.current.hasFeature('sound_mixing')).toBe(true);
      expect(result.current.hasFeature('focus_presets')).toBe(true);
      expect(result.current.hasFeature('all_timer_backgrounds')).toBe(true);
      expect(result.current.hasFeature('website_blocking')).toBe(true);
    });
  });

  describe('currentPlan', () => {
    it('should return null when no plan is selected', () => {
      const { result } = renderHook(() => usePremiumStatus());

      expect(result.current.currentPlan).toBeNull();
    });

    it('should return the correct plan details for monthly', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      const plan = result.current.currentPlan;
      expect(plan).not.toBeNull();
      expect(plan?.id).toBe('premium-monthly');
      expect(plan?.tier).toBe('premium');
      expect(plan?.price).toBe('$5.99');
      expect(plan?.period).toBe('monthly');
      expect(plan?.bonusCoins).toBe(500);
    });

    it('should return the correct plan details for weekly', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(7),
        purchasedAt: getPastDate(1),
        planId: 'premium-weekly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      const plan = result.current.currentPlan;
      expect(plan).not.toBeNull();
      expect(plan?.id).toBe('premium-weekly');
      expect(plan?.tier).toBe('premium');
      expect(plan?.price).toBe('$2.49');
      expect(plan?.period).toBe('weekly');
      expect(plan?.bonusCoins).toBe(0);
    });

    it('should return the correct plan details for yearly', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: getFutureDate(365),
        purchasedAt: getPastDate(10),
        planId: 'premium-yearly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.tier).toBe('premium');
      });

      const plan = result.current.currentPlan;
      expect(plan).not.toBeNull();
      expect(plan?.id).toBe('premium-yearly');
      expect(plan?.tier).toBe('premium');
      expect(plan?.price).toBe('$39.99');
      expect(plan?.period).toBe('yearly');
      expect(plan?.savings).toBe('Save 44%');
      expect(plan?.isPopular).toBe(true);
      expect(plan?.bonusCoins).toBe(1500);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty localStorage value', async () => {
      localStorage.setItem(STORAGE_KEY, '');

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tier).toBe('free');
    });

    it('should handle null values in saved state', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: null,
        expiresAt: null,
        purchasedAt: null,
        planId: null,
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should fall back to free tier
      expect(result.current.isPremium).toBe(false);
    });

    it('should persist state changes to localStorage', async () => {
      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.purchaseSubscription('premium-yearly');
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved!);
      expect(parsed.tier).toBe('premium');
      expect(parsed.planId).toBe('premium-yearly');
    });

    it('should handle subscription state across component remounts', async () => {
      const savedState = {
        tier: 'premium',
        expiresAt: getFutureDate(200),
        purchasedAt: getPastDate(165),
        planId: 'premium-yearly',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

      // First mount
      const { result: firstResult, unmount } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(firstResult.current.tier).toBe('premium');
      });

      unmount();

      // Second mount
      const { result: secondResult } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(secondResult.current.tier).toBe('premium');
      });

      expect(secondResult.current.isPremium).toBe(true);
    });

    it('should handle subscription expiring in the future by 1 second', async () => {
      // Set expiry to 1 second in the future
      const futureDate = new Date(Date.now() + 1000).toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: futureDate,
        purchasedAt: getPastDate(30),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should NOT be expired yet
      expect(result.current.tier).toBe('premium');
    });

    it('should handle subscription that expired 1 second ago', async () => {
      // Set expiry to 1 second in the past
      const pastDate = new Date(Date.now() - 1000).toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tier: 'premium',
        expiresAt: pastDate,
        purchasedAt: getPastDate(30),
        planId: 'premium-monthly',
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should be expired since expiry date is in the past
      expect(result.current.tier).toBe('free');
    });

    it('should handle undefined tier in localStorage gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        expiresAt: getFutureDate(30),
        purchasedAt: getPastDate(5),
        planId: 'premium-monthly',
        // tier is missing
      }));

      const { result } = renderHook(() => usePremiumStatus());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should handle missing tier
      expect(result.current.isPremium).toBe(false);
    });
  });

  describe('Subscription Plans Data', () => {
    it('should have all required subscription plans', () => {
      expect(SUBSCRIPTION_PLANS).toHaveLength(3);

      const planIds = SUBSCRIPTION_PLANS.map(p => p.id);
      expect(planIds).toContain('premium-weekly');
      expect(planIds).toContain('premium-monthly');
      expect(planIds).toContain('premium-yearly');
    });

    it('should have correct tier assignments for each plan', () => {
      const premiumWeekly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-weekly');
      expect(premiumWeekly?.tier).toBe('premium');

      const premiumMonthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-monthly');
      expect(premiumMonthly?.tier).toBe('premium');

      const premiumYearly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-yearly');
      expect(premiumYearly?.tier).toBe('premium');
    });

    it('should have correct periods for each plan type', () => {
      const weeklyPlans = SUBSCRIPTION_PLANS.filter(p => p.period === 'weekly');
      const monthlyPlans = SUBSCRIPTION_PLANS.filter(p => p.period === 'monthly');
      const yearlyPlans = SUBSCRIPTION_PLANS.filter(p => p.period === 'yearly');

      expect(weeklyPlans).toHaveLength(1);
      expect(monthlyPlans).toHaveLength(1);
      expect(yearlyPlans).toHaveLength(1);
    });

    it('should have correct prices for each plan', () => {
      const weekly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-weekly');
      expect(weekly?.price).toBe('$2.49');
      expect(weekly?.priceValue).toBe(2.49);

      const monthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-monthly');
      expect(monthly?.price).toBe('$5.99');
      expect(monthly?.priceValue).toBe(5.99);

      const yearly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-yearly');
      expect(yearly?.price).toBe('$39.99');
      expect(yearly?.priceValue).toBe(39.99);
    });

    it('should have bonus coins defined for each plan', () => {
      SUBSCRIPTION_PLANS.forEach(plan => {
        expect(plan.bonusCoins).toBeDefined();
        expect(typeof plan.bonusCoins).toBe('number');
        expect(plan.bonusCoins).toBeGreaterThanOrEqual(0);
      });

      const weekly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-weekly');
      expect(weekly?.bonusCoins).toBe(0);

      const monthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-monthly');
      expect(monthly?.bonusCoins).toBe(500);

      const yearly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-yearly');
      expect(yearly?.bonusCoins).toBe(1500);
    });

    it('should mark yearly plan as popular with savings badge', () => {
      const yearly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium-yearly');
      expect(yearly?.isPopular).toBe(true);
      expect(yearly?.savings).toBe('Save 44%');
      expect(yearly?.badges).toContain('Popular');
      expect(yearly?.badges).toContain('Save 44%');
    });
  });

  describe('Tier Benefits Data', () => {
    it('should have correct multipliers for each tier', () => {
      expect(TIER_BENEFITS.free.coinMultiplier).toBe(1);
      expect(TIER_BENEFITS.premium.coinMultiplier).toBe(2);

      expect(TIER_BENEFITS.free.xpMultiplier).toBe(1);
      expect(TIER_BENEFITS.premium.xpMultiplier).toBe(2);
    });

    it('should have correct streak freezes for each tier', () => {
      expect(TIER_BENEFITS.free.monthlyStreakFreezes).toBe(0);
      expect(TIER_BENEFITS.premium.monthlyStreakFreezes).toBe(3);
    });

    it('should have correct sound mixing slots for each tier', () => {
      expect(TIER_BENEFITS.free.soundMixingSlots).toBe(1);
      expect(TIER_BENEFITS.premium.soundMixingSlots).toBe(3);
    });

    it('should have correct focus preset slots for each tier', () => {
      expect(TIER_BENEFITS.free.focusPresetSlots).toBe(1);
      expect(TIER_BENEFITS.premium.focusPresetSlots).toBe(5);
    });

    it('should have correct login coin multiplier for each tier', () => {
      expect(TIER_BENEFITS.free.loginCoinMultiplier).toBe(1);
      expect(TIER_BENEFITS.premium.loginCoinMultiplier).toBe(2);
    });

    it('should have correct analytics access for each tier', () => {
      expect(TIER_BENEFITS.free.analyticsAccess).toBe('basic');
      expect(TIER_BENEFITS.premium.analyticsAccess).toBe('full');
    });

    it('should have correct egg discount for each tier', () => {
      expect(TIER_BENEFITS.free.eggDiscountPercent).toBe(0);
      expect(TIER_BENEFITS.premium.eggDiscountPercent).toBe(15);
    });

    it('should only have free and premium tiers', () => {
      const tierKeys = Object.keys(TIER_BENEFITS);
      expect(tierKeys).toHaveLength(2);
      expect(tierKeys).toContain('free');
      expect(tierKeys).toContain('premium');
    });
  });

  describe('dispatchSubscriptionChange helper', () => {
    it('should dispatch custom event with tier', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      dispatchSubscriptionChange('premium');

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'petIsland_subscriptionChange',
          detail: { tier: 'premium' },
        })
      );

      dispatchEventSpy.mockRestore();
    });

    it('should dispatch event for all valid tier types', () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      const tiers: Array<'free' | 'premium'> = ['free', 'premium'];

      tiers.forEach(tier => {
        dispatchSubscriptionChange(tier);
      });

      expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

      dispatchEventSpy.mockRestore();
    });
  });

  describe('Hook return shape', () => {
    it('should expose all expected properties and methods', () => {
      const { result } = renderHook(() => usePremiumStatus());

      // State
      expect(result.current).toHaveProperty('tier');
      expect(result.current).toHaveProperty('isPremium');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isVerifying');
      expect(result.current).toHaveProperty('isGuestMode');
      expect(result.current).toHaveProperty('expiresAt');
      expect(result.current).toHaveProperty('purchasedAt');
      expect(result.current).toHaveProperty('currentPlan');

      // Subscription actions
      expect(typeof result.current.purchaseSubscription).toBe('function');
      expect(typeof result.current.validatePurchase).toBe('function');
      expect(typeof result.current.restorePurchases).toBe('function');
      expect(typeof result.current.cancelSubscription).toBe('function');
      expect(typeof result.current.verifyWithServer).toBe('function');

      // Feature checks
      expect(typeof result.current.hasFeature).toBe('function');

      // Tier benefits
      expect(typeof result.current.getTierBenefits).toBe('function');
      expect(typeof result.current.getCoinMultiplier).toBe('function');
      expect(typeof result.current.getXPMultiplier).toBe('function');
      expect(typeof result.current.getSoundMixingSlots).toBe('function');
      expect(typeof result.current.getFocusPresetSlots).toBe('function');
      expect(typeof result.current.getMonthlyStreakFreezes).toBe('function');
      expect(typeof result.current.getLoginCoinMultiplier).toBe('function');
      expect(typeof result.current.hasFullAnalytics).toBe('function');
      expect(typeof result.current.getEggDiscountPercent).toBe('function');

      // Grants
      expect(typeof result.current.checkAndGrantMonthlyStreakFreezes).toBe('function');
      expect(typeof result.current.grantBonusCoins).toBe('function');

      // Should NOT have legacy properties
      expect(result.current).not.toHaveProperty('isPremiumPlus');
      expect(result.current).not.toHaveProperty('isLifetime');
      expect(result.current).not.toHaveProperty('hasBattlePassIncluded');
    });
  });
});
