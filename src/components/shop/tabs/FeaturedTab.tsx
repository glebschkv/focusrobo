import { useState } from "react";
import { Crown, ChevronRight, Check } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { ShopItem, COIN_PACKS, StarterBundle, CoinPack, Bundle } from "@/data/ShopData";
import { BACKGROUND_BUNDLES, STARTER_BUNDLES } from "@/data/ShopData";
import type { ShopInventory } from "@/hooks/useShop";
import { toast } from "sonner";
import { BundlePreviewCarousel } from "../ShopPreviewComponents";
import { BundleConfirmDialog } from "../BundleConfirmDialog";
import type { ShopCategory } from "@/data/ShopData";
import { useStoreKit } from "@/hooks/useStoreKit";

interface FeaturedTabProps {
  inventory: ShopInventory;
  isOwned: (itemId: string, category: ShopCategory) => boolean;
  isBundleOwned: (bundleId: string) => boolean;
  setActiveCategory: (category: ShopCategory) => void;
  setSelectedItem: (item: ShopItem | Bundle | null) => void;
  setShowPurchaseConfirm: (show: boolean) => void;
  setShowPremiumModal: (show: boolean) => void;
  isPremium: boolean;
  currentPlan: { name: string } | null | undefined;
  coinBalance: number;
  canAfford: (price: number) => boolean;
}

export const FeaturedTab = ({
  inventory,
  isBundleOwned,
  setActiveCategory,
  setSelectedItem,
  setShowPurchaseConfirm,
  setShowPremiumModal,
  isPremium,
  currentPlan,
  canAfford,
}: FeaturedTabProps) => {
  const storeKit = useStoreKit();
  const bestValuePack = COIN_PACKS.find(pack => pack.isBestValue) || COIN_PACKS[COIN_PACKS.length - 1];

  const [selectedBundle, setSelectedBundle] = useState<StarterBundle | CoinPack | null>(null);
  const [showBundleConfirm, setShowBundleConfirm] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleIAPPurchase = async () => {
    if (!selectedBundle?.iapProductId) {
      toast.error("Product not available");
      return;
    }

    setIsPurchasing(true);
    try {
      const isStarterBundle = 'contents' in selectedBundle;
      const result = await storeKit.purchaseProduct(selectedBundle.iapProductId);

      if (result.success && result.validationResult?.success) {
        if (isStarterBundle && result.validationResult.bundle) {
          if (result.validationResult.bundle.alreadyOwned) {
            toast.info("You already own this bundle!");
            setShowBundleConfirm(false);
            return;
          }
          const bundle = result.validationResult.bundle;
          const items: string[] = [];
          if (bundle.coinsGranted > 0) items.push(`${bundle.coinsGranted.toLocaleString()} coins`);
          if (bundle.boosterId) items.push('Booster');
          if (bundle.streakFreezes > 0) items.push(`${bundle.streakFreezes} Streak Freeze${bundle.streakFreezes > 1 ? 's' : ''}`);
          toast.success(`${selectedBundle.name} purchased! Received: ${items.join(', ')}`);
        } else if (result.validationResult.coinPack) {
          const coinsGranted = result.validationResult.coinPack.coinsGranted;
          toast.success(`${coinsGranted.toLocaleString()} coins added to your balance!`);
        } else {
          toast.success(`Successfully purchased ${selectedBundle.name}!`);
        }
        setShowBundleConfirm(false);
      } else if (result.alreadyOwned) {
        setShowBundleConfirm(false);
      } else if (result.cancelled) {
        // User cancelled
      } else if (!result.pending) {
        toast.error(result.message || "Purchase failed");
      }
    } catch (_error) {
      toast.error("Unable to complete purchase");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-4">
      <BundleConfirmDialog
        open={showBundleConfirm}
        onOpenChange={(open) => {
          if (!isPurchasing) {
            setShowBundleConfirm(open);
            if (!open) setSelectedBundle(null);
          }
        }}
        bundle={selectedBundle}
        onPurchase={handleIAPPurchase}
        isPurchasing={isPurchasing}
      />

      {/* Premium Hero Card */}
      {!isPremium ? (
        <button
          onClick={() => setShowPremiumModal(true)}
          className="shop-premium-card"
        >
          <div className="flex items-center gap-3">
            <div className="shop-premium-crown">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-[15px] tracking-tight">
                Premium
              </h3>
              <p className="text-[10px] text-white/70 mt-1">2x coins, all sounds, exclusive perks</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span className="font-black text-white text-sm">{storeKit.getLocalizedPrice('com.fonoinc.app.premium.monthly', '€4,99')}</span>
              <span className="text-white/50 text-[10px] font-bold">/month</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2.5 pt-2 border-t border-white/10">
            <span className="text-white/80 text-[11px] font-bold tracking-wide uppercase">View plans</span>
            <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          </div>
        </button>
      ) : (
        <div className="shop-list-card green">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-green-700 dark:text-green-400">
                {currentPlan?.name || 'Premium'} Active
              </span>
              <p className="text-xs text-muted-foreground">You have full access</p>
            </div>
          </div>
        </div>
      )}

      {/* Background Bundles */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">Background Bundles</span>
        </div>
        <div className="space-y-3">
          {BACKGROUND_BUNDLES.map((bundle) => {
            const owned = isBundleOwned(bundle.id);
            const affordable = canAfford(bundle.coinPrice || 0);
            return (
              <button
                key={bundle.id}
                onClick={() => {
                  if (!owned) {
                    setSelectedItem(bundle);
                    setShowPurchaseConfirm(true);
                  }
                }}
                className={cn("shop-bundle-card", owned && "green")}
              >
                <div className="relative w-full h-32 overflow-hidden rounded-t-[10px]">
                  {bundle.previewImages && <BundlePreviewCarousel images={bundle.previewImages} />}
                  {owned && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> OWNED
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="font-bold text-sm block">{bundle.name}</span>
                    <span className="text-[10px] text-muted-foreground">{bundle.itemIds.length} backgrounds</span>
                  </div>
                  {!owned && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground line-through">
                        {bundle.totalValue.toLocaleString()}
                      </span>
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-bold",
                        affordable ? "text-amber-600" : "text-red-500"
                      )}>
                        <PixelIcon name="coin" size={12} />
                        {bundle.coinPrice?.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Bundles (IAP) */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">Special Bundles</span>
        </div>
        <div className="space-y-2">
          {STARTER_BUNDLES.map((bundle) => {
            const alreadyPurchased = inventory.purchasedStarterBundleIds.includes(bundle.iapProductId);

            return (
              <button
                key={bundle.id}
                onClick={() => {
                  if (alreadyPurchased) {
                    toast.info("You already own this bundle!");
                    return;
                  }
                  setSelectedBundle(bundle);
                  setShowBundleConfirm(true);
                }}
                className={cn(
                  "shop-list-card",
                  alreadyPurchased && "green"
                )}
              >
                <div className="flex items-center gap-3">
                  <PixelIcon name={bundle.icon} size={30} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{bundle.name}</span>
                      {alreadyPurchased && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> OWNED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {bundle.description}
                    </p>
                  </div>
                  {!alreadyPurchased && (
                    <div className="iap-price-button">
                      {storeKit.getLocalizedPrice(bundle.iapProductId, bundle.iapPrice)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Best Value Coin Pack */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">Best Value</span>
        </div>
        <button
          onClick={() => {
            setSelectedBundle(bestValuePack);
            setShowBundleConfirm(true);
          }}
          className="shop-list-card best-value"
        >
          <div className="flex items-center gap-3">
            <PixelIcon name="trophy" size={36} />
            <div className="flex-1">
              <span className="font-bold text-sm">{bestValuePack.name}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <PixelIcon name="coin" size={12} />
                <span className="text-amber-600 font-bold text-xs">{bestValuePack.coinAmount.toLocaleString()}</span>
                {bestValuePack.bonusCoins && bestValuePack.bonusCoins > 0 && (
                  <span className="text-green-600 text-xs font-semibold">+{bestValuePack.bonusCoins.toLocaleString()}</span>
                )}
              </div>
            </div>
            <div className="iap-price-button best-value">
              {storeKit.getLocalizedPrice(bestValuePack.iapProductId, bestValuePack.iapPrice)}
            </div>
          </div>
        </button>
      </div>

      {/* Browse Backgrounds link */}
      <div className="flex items-center justify-between">
        <span className="shop-section-title">Backgrounds</span>
        <button
          onClick={() => setActiveCategory('customize')}
          className="text-xs text-amber-600 font-bold"
        >
          See All →
        </button>
      </div>
    </div>
  );
};
