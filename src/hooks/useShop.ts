import { useCallback, useRef, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCoinSystem } from './useCoinSystem';
import { useCoinBooster } from './useCoinBooster';
import { useStreakSystem } from './useStreakSystem';
import {
  ShopItem,
  ShopCategory,
  PREMIUM_BACKGROUNDS,
  UTILITY_ITEMS,
  ALL_BUNDLES,
  STARTER_BUNDLES,
} from '@/data/ShopData';
import { getEggById } from '@/data/EggData';
import { dispatchAchievementEvent, ACHIEVEMENT_EVENTS } from '@/hooks/useAchievementTracking';
import { useShopStore } from '@/stores';
import { useLandStore } from '@/stores/landStore';
import { useXPStore } from '@/stores/xpStore';
import { syncPurchasedBundlesFromServer } from '@/stores/shopStore';
import { IAP_EVENTS } from './useStoreKit';
import { shopLogger } from '@/lib/logger';
import { toast } from 'sonner';

export interface PurchaseResult {
  success: boolean;
  message: string;
  item?: ShopItem;
}

export interface ShopInventory {
  ownedCharacters: string[];
  ownedBackgrounds: string[];
  equippedBackground: string | null;
  purchasedStarterBundleIds: string[];
}

/**
 * Spend coins with server validation, syncing balance on failure.
 */
async function spendCoinsWithSync(
  coinSystem: ReturnType<typeof useCoinSystem>,
  amount: number,
  purpose: 'shop_purchase' | 'pet_unlock' | 'cosmetic' | 'booster' | 'streak_freeze',
  referenceId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const spendSuccess = await coinSystem.spendCoins(amount, purpose, referenceId);
  if (spendSuccess) return { ok: true };

  let syncSucceeded = false;
  try { syncSucceeded = await coinSystem.syncFromServer(); } catch { /* silent */ }
  const message = syncSucceeded
    ? 'Your balance has been updated. Please try again.'
    : 'Purchase failed. Please check your connection and try again.';
  return { ok: false, message };
}

/**
 * Calculate discounted egg price for premium users.
 */
export function getEggDiscountedPrice(eggCoinPrice: number, discountPercent: number): number {
  if (discountPercent <= 0) return eggCoinPrice;
  return Math.ceil(eggCoinPrice * (1 - discountPercent / 100));
}

export const useShop = () => {
  const coinSystem = useCoinSystem();
  const boosterSystem = useCoinBooster();
  const streakSystem = useStreakSystem();

  const {
    ownedCharacters,
    ownedBackgrounds,
    equippedBackground,
    purchasedStarterBundleIds,
  } = useShopStore(
    useShallow((state) => ({
      ownedCharacters: state.ownedCharacters,
      ownedBackgrounds: state.ownedBackgrounds,
      equippedBackground: state.equippedBackground,
      purchasedStarterBundleIds: state.purchasedStarterBundleIds,
    }))
  );

  const {
    addOwnedCharacter,
    addOwnedBackground,
    addOwnedBackgrounds,
    addPurchasedStarterBundleId,
    storeSetEquippedBackground,
    storeResetShop,
  } = useShopStore(
    useShallow((state) => ({
      addOwnedCharacter: state.addOwnedCharacter,
      addOwnedBackground: state.addOwnedBackground,
      addOwnedBackgrounds: state.addOwnedBackgrounds,
      addPurchasedStarterBundleId: state.addPurchasedStarterBundleId,
      storeSetEquippedBackground: state.setEquippedBackground,
      storeResetShop: state.resetShop,
    }))
  );

  const inventory: ShopInventory = {
    ownedCharacters,
    ownedBackgrounds,
    equippedBackground,
    purchasedStarterBundleIds,
  };

  const purchaseCountRef = useRef(
    ownedCharacters.length + ownedBackgrounds.length
  );

  useEffect(() => {
    const totalItems = ownedCharacters.length + ownedBackgrounds.length;
    if (totalItems > purchaseCountRef.current) {
      purchaseCountRef.current = totalItems;
      dispatchAchievementEvent(ACHIEVEMENT_EVENTS.PURCHASE_MADE, {
        totalPurchases: totalItems,
      });
    }
  }, [ownedCharacters.length, ownedBackgrounds.length]);

  useEffect(() => {
    syncPurchasedBundlesFromServer();
  }, []);

  const bundleGrantDepsRef = useRef({
    ownedCharacters, addOwnedCharacter, addPurchasedStarterBundleId,
    boosterSystem, streakSystem,
  });
  bundleGrantDepsRef.current = {
    ownedCharacters, addOwnedCharacter, addPurchasedStarterBundleId,
    boosterSystem, streakSystem,
  };

  // Listen for IAP bundle grants
  useEffect(() => {
    const handleBundleGranted = (event: Event) => {
      try {
        const deps = bundleGrantDepsRef.current;
        const customEvent = event as CustomEvent<{
          productId?: string;
          characterId?: string;
          boosterId?: string;
          streakFreezes: number;
          alreadyOwned?: boolean;
        }>;
        const { productId, characterId, boosterId, streakFreezes, alreadyOwned } = customEvent.detail;

        if (productId) {
          deps.addPurchasedStarterBundleId(productId);
        }

        if (alreadyOwned) {
          shopLogger.debug('Bundle already owned, recorded but skipping grants:', productId);
          return;
        }

        // Grant character if included (legacy IAP bundles may reference old character IDs)
        if (characterId && !deps.ownedCharacters.includes(characterId)) {
          deps.addOwnedCharacter(characterId);
        }

        if (boosterId && !deps.boosterSystem.isBoosterActive()) {
          deps.boosterSystem.activateBooster(boosterId);
        }

        if (streakFreezes && streakFreezes > 0) {
          for (let i = 0; i < streakFreezes; i++) {
            deps.streakSystem.earnStreakFreeze();
          }
        }

        // Hatch eggs from bundle contents
        if (productId) {
          const bundleDef = STARTER_BUNDLES.find(b => b.iapProductId === productId);
          const eggs = bundleDef?.contents?.eggs;
          if (eggs && eggs.length > 0) {
            const landStore = useLandStore.getState();
            const playerLevel = useXPStore.getState().currentLevel;
            let totalHatched = 0;

            for (const eggEntry of eggs) {
              const eggDef = getEggById(eggEntry.eggId);
              if (!eggDef) continue;

              for (let i = 0; i < eggEntry.quantity; i++) {
                landStore.hatchEgg(eggDef, playerLevel);
                landStore.placePendingPet();
                totalHatched++;
              }
            }

            if (totalHatched > 0) {
              toast.success(`Hatched ${totalHatched} pet${totalHatched > 1 ? 's' : ''} from your bundle!`);
            }
          }
        }
      } catch (e) {
        shopLogger.error('Failed to fulfill IAP bundle grant:', e);
      }
    };

    window.addEventListener(IAP_EVENTS.BUNDLE_GRANTED, handleBundleGranted);
    return () => {
      window.removeEventListener(IAP_EVENTS.BUNDLE_GRANTED, handleBundleGranted);
    };
  }, []);

  const isOwned = useCallback((itemId: string, category: ShopCategory): boolean => {
    switch (category) {
      case 'customize':
        return ownedBackgrounds.includes(itemId);
      default:
        return false;
    }
  }, [ownedBackgrounds]);

  const purchaseBackground = useCallback(async (backgroundId: string): Promise<PurchaseResult> => {
    const bg = PREMIUM_BACKGROUNDS.find(b => b.id === backgroundId);
    if (!bg) return { success: false, message: 'Background not found' };
    if (ownedBackgrounds.includes(backgroundId)) return { success: false, message: 'You already own this background' };
    if (!bg.coinPrice || !coinSystem.canAfford(bg.coinPrice)) return { success: false, message: 'Not enough coins' };

    const spend = await spendCoinsWithSync(coinSystem, bg.coinPrice, 'cosmetic', backgroundId);
    if (!spend.ok) return { success: false, message: spend.message };

    addOwnedBackground(backgroundId);
    return { success: true, message: `${bg.name} purchased!` };
  }, [ownedBackgrounds, coinSystem, addOwnedBackground]);

  const purchaseBundle = useCallback(async (bundleId: string): Promise<PurchaseResult> => {
    const bundle = ALL_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) return { success: false, message: 'Bundle not found' };

    const allOwned = bundle.itemIds.every(id => ownedBackgrounds.includes(id));
    if (allOwned) return { success: false, message: 'You already own all items in this bundle' };

    if (!bundle.coinPrice || !coinSystem.canAfford(bundle.coinPrice)) {
      return { success: false, message: 'Not enough coins' };
    }

    const spend = await spendCoinsWithSync(coinSystem, bundle.coinPrice, 'cosmetic', bundleId);
    if (!spend.ok) return { success: false, message: spend.message };

    const newItems = bundle.itemIds.filter(id => !ownedBackgrounds.includes(id));
    addOwnedBackgrounds(newItems);

    return { success: true, message: `${bundle.name} purchased! ${newItems.length} backgrounds added!` };
  }, [ownedBackgrounds, coinSystem, addOwnedBackgrounds]);

  const isBundleOwned = useCallback((bundleId: string): boolean => {
    const bundle = ALL_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) return false;
    return bundle.itemIds.every(id => ownedBackgrounds.includes(id));
  }, [ownedBackgrounds]);

  const purchaseBooster = useCallback(async (boosterId: string): Promise<PurchaseResult> => {
    const booster = boosterSystem.getBoosterType(boosterId);
    if (!booster) return { success: false, message: 'Booster not found' };
    if (boosterSystem.isBoosterActive()) return { success: false, message: 'You already have an active booster' };
    if (!coinSystem.canAfford(booster.coinPrice)) return { success: false, message: 'Not enough coins' };

    const spend = await spendCoinsWithSync(coinSystem, booster.coinPrice, 'booster', boosterId);
    if (!spend.ok) return { success: false, message: spend.message };

    boosterSystem.activateBooster(boosterId);
    return { success: true, message: `${booster.name} activated!` };
  }, [coinSystem, boosterSystem]);

  const purchaseStreakFreeze = useCallback(async (quantity: number, price: number): Promise<PurchaseResult> => {
    if (!coinSystem.canAfford(price)) return { success: false, message: 'Not enough coins' };

    const spend = await spendCoinsWithSync(coinSystem, price, 'streak_freeze', `streak_freeze_x${quantity}`);
    if (!spend.ok) return { success: false, message: spend.message };

    for (let i = 0; i < quantity; i++) {
      streakSystem.earnStreakFreeze();
    }
    return { success: true, message: `${quantity} Streak Freeze${quantity > 1 ? 's' : ''} added!` };
  }, [coinSystem, streakSystem]);

  const purchaseItem = useCallback(async (itemId: string, category: ShopCategory): Promise<PurchaseResult> => {
    switch (category) {
      case 'customize':
        return purchaseBackground(itemId);
      case 'powerups': {
        if (itemId.includes('boost') || itemId.includes('pass')) {
          return purchaseBooster(itemId);
        }
        const utilityItem = UTILITY_ITEMS.find(u => u.id === itemId);
        if (utilityItem && utilityItem.coinPrice) {
          return purchaseStreakFreeze(utilityItem.quantity, utilityItem.coinPrice);
        }
        return { success: false, message: 'Item not found' };
      }
      default:
        return { success: false, message: 'Invalid category' };
    }
  }, [purchaseBackground, purchaseBooster, purchaseStreakFreeze]);

  const equipBackground = useCallback((backgroundId: string | null) => {
    if (backgroundId && !ownedBackgrounds.includes(backgroundId)) {
      return false;
    }
    storeSetEquippedBackground(backgroundId);
    return true;
  }, [ownedBackgrounds, storeSetEquippedBackground]);

  const resetShop = useCallback(() => {
    storeResetShop();
  }, [storeResetShop]);

  return {
    inventory,
    isOwned,
    isBundleOwned,
    purchaseItem,
    purchaseBackground,
    purchaseBundle,
    purchaseBooster,
    purchaseStreakFreeze,
    equipBackground,
    resetShop,
    coinBalance: coinSystem.balance,
    canAfford: coinSystem.canAfford,
  };
};
