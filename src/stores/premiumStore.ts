import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logger } from '@/lib/logger';
import { premiumStatusSchema } from '@/lib/storage-validation';
import { createValidatedStorage } from '@/lib/validated-zustand-storage';

export type SubscriptionTier = 'free' | 'premium';

export const TIER_BENEFITS = {
  free: { coinMultiplier: 1, xpMultiplier: 1, monthlyStreakFreezes: 0, soundMixingSlots: 1, focusPresetSlots: 1, rarityBoost: false, passiveIncomeMultiplier: 1 },
  premium: { coinMultiplier: 2, xpMultiplier: 2, monthlyStreakFreezes: 3, soundMixingSlots: 3, focusPresetSlots: 5, rarityBoost: true, passiveIncomeMultiplier: 2 },
} as const;

export interface PremiumState {
  tier: SubscriptionTier;
  expiresAt: string | null;
  purchasedAt: string | null;
  planId: string | null;
}

interface PremiumStore extends PremiumState {
  setTier: (tier: SubscriptionTier) => void;
  setPurchaseDetails: (details: Partial<PremiumState>) => void;
  clearPremium: () => void;
  isPremium: () => boolean;
  getTierBenefits: () => typeof TIER_BENEFITS[SubscriptionTier];
  getCoinMultiplier: () => number;
  getXPMultiplier: () => number;
}

const initialState: PremiumState = { tier: 'free', expiresAt: null, purchasedAt: null, planId: null };

export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setTier: (tier) => set({ tier }),
      setPurchaseDetails: (details) => set((s) => ({ ...s, ...details })),
      clearPremium: () => set(initialState),
      isPremium: () => get().tier === 'premium',
      getTierBenefits: () => TIER_BENEFITS[get().tier] || TIER_BENEFITS.free,
      getCoinMultiplier: () => get().getTierBenefits().coinMultiplier,
      getXPMultiplier: () => get().getTierBenefits().xpMultiplier,
    }),
    {
      name: 'nomo_premium',
      storage: createValidatedStorage({
        schema: premiumStatusSchema,
        defaultState: initialState,
        name: 'premium-store',
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state) {
          try {
            const legacy = localStorage.getItem('petIsland_premium');
            if (legacy) {
              const parsed = JSON.parse(legacy);
              const validated = premiumStatusSchema.safeParse(parsed);
              if (validated.success) {
                usePremiumStore.setState(validated.data);
                logger.debug('Premium store migrated from legacy storage');
                return;
              }
            }
          } catch { /* ignore */ }
        }
        if (state) {
          // Check if subscription has expired and downgrade
          if (state.tier !== 'free' && state.tier !== 'lifetime' && state.expiresAt) {
            const expiresAt = new Date(state.expiresAt).getTime();
            if (!isNaN(expiresAt) && expiresAt < Date.now()) {
              usePremiumStore.setState({ tier: 'free', expiresAt: null, planId: null });
              logger.info('Premium subscription expired, downgraded to free tier');
              return;
            }
          }
          logger.debug('Premium store rehydrated and validated');
        }
      },
    }
  )
);

export const useTier = () => usePremiumStore((s) => s.tier);
export const useIsPremium = () => usePremiumStore((s) => s.tier === 'premium');
