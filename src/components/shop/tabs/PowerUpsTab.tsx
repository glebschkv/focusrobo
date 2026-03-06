/**
 * PowerUpsTab — "Potions & Charms"
 * Utility items displayed as RPG potions on a warm wooden shelf.
 * Coin packs displayed as treasure chests.
 */

import { useState } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { ShopItem, getShopItemsByCategory, COIN_PACKS, CoinPack } from "@/data/ShopData";
import type { ShopInventory } from "@/hooks/useShop";
import { toast } from "sonner";
import type { ShopCategory } from "@/data/ShopData";
import { useStoreKit } from "@/hooks/useStoreKit";
import { BundleConfirmDialog } from "../BundleConfirmDialog";

interface PowerUpsTabProps {
  inventory: ShopInventory;
  isOwned: (itemId: string, category: ShopCategory) => boolean;
  setSelectedItem: (item: ShopItem | null) => void;
  setShowPurchaseConfirm: (show: boolean) => void;
  canAfford: (price: number) => boolean;
  isBoosterActive: () => boolean;
  getTimeRemainingFormatted: () => string;
  activeBooster: { boosterId: string; multiplier: number; activatedAt: number; expiresAt: number } | null;
  getCurrentMultiplier: () => number;
}

export const PowerUpsTab = ({
  setSelectedItem,
  setShowPurchaseConfirm,
  canAfford,
  isBoosterActive,
}: PowerUpsTabProps) => {
  const items = getShopItemsByCategory('powerups');
  const boosters = items.filter(i => i.id.includes('boost') || i.id.includes('pass'));
  const utilities = items.filter(i => i.id.includes('streak'));
  const coins = COIN_PACKS;
  const storeKit = useStoreKit();

  const [selectedPack, setSelectedPack] = useState<CoinPack | null>(null);
  const [showPackConfirm, setShowPackConfirm] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleConfirmPurchase = async () => {
    if (!selectedPack?.iapProductId) {
      toast.error("Product not available");
      return;
    }

    setIsPurchasing(true);
    try {
      const result = await storeKit.purchaseProduct(selectedPack.iapProductId);
      if (result.success && result.validationResult?.success) {
        const coinsGranted = result.validationResult.coinPack?.coinsGranted ||
          (selectedPack.coinAmount + (selectedPack.bonusCoins || 0));
        toast.success(`Claimed ${selectedPack.name}! +${coinsGranted.toLocaleString()} coins`);
        setShowPackConfirm(false);
      } else if (result.cancelled) {
        // User cancelled
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (_error) {
      toast.error("Unable to complete transaction");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="space-y-4">
      <BundleConfirmDialog
        open={showPackConfirm}
        onOpenChange={(open) => {
          if (!isPurchasing) {
            setShowPackConfirm(open);
            if (!open) setSelectedPack(null);
          }
        }}
        bundle={selectedPack}
        onPurchase={handleConfirmPurchase}
        isPurchasing={isPurchasing}
      />

      {/* Section intro */}
      <p className="text-xs font-medium px-1" style={{ color: '#8B6F47' }}>
        Elixirs, crystals, and treasures to aid your journey.
      </p>

      {/* Focus Elixirs (Boosters) */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">Focus Elixirs</span>
        </div>
        <div className="space-y-2">
          {boosters.map((booster) => {
            const boosterActive = isBoosterActive();
            return (
              <button
                key={booster.id}
                onClick={() => {
                  if (!boosterActive) {
                    setSelectedItem(booster);
                    setShowPurchaseConfirm(true);
                  }
                }}
                disabled={boosterActive}
                className={cn(
                  "potion-shelf-item",
                  boosterActive && "disabled"
                )}
              >
                <div className="potion-icon-frame">
                  <PixelIcon name={booster.icon} size={20} />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-sm" style={{ color: '#5C3D1A' }}>{booster.name}</span>
                  <p className="text-xs" style={{ color: '#8B6F47' }}>{booster.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-bold text-sm" style={{ color: '#7A5C20' }}>
                    <PixelIcon name="coin" size={14} />
                    {booster.coinPrice?.toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Crystals (Streak Protection) */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">Time Crystals</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {utilities.map((item) => {
            const affordable = canAfford(item.coinPrice || 0);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setShowPurchaseConfirm(true);
                }}
                className="shop-grid-card"
              >
                <div className="potion-icon-frame mx-auto mb-1.5" style={{ width: '32px', height: '32px' }}>
                  <PixelIcon name={item.icon} size={16} />
                </div>
                <span className="text-[10px] font-bold block" style={{ color: '#5C3D1A' }}>{item.name}</span>
                <div className={cn(
                  "flex items-center justify-center gap-0.5 mt-1 text-xs font-bold",
                )} style={{ color: affordable ? '#7A5C20' : '#8B4040' }}>
                  <PixelIcon name="coin" size={12} />
                  {item.coinPrice?.toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Treasure Chests (Coin Packs) */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">Treasure Chests</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {coins.map((pack) => (
            <button
              key={pack.id}
              onClick={() => {
                setSelectedPack(pack);
                setShowPackConfirm(true);
              }}
              className={cn(
                "treasure-card text-left",
                pack.isBestValue && "best-value"
              )}
            >
              <div className="potion-icon-frame mx-auto mb-2" style={{
                width: '36px', height: '36px',
                borderColor: pack.isBestValue ? '#D4A84E' : '#D4C4A0',
              }}>
                <PixelIcon name={pack.icon} size={20} />
              </div>
              <span className="font-bold text-xs block text-center" style={{ color: '#5C3D1A' }}>{pack.name}</span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <PixelIcon name="coin" size={11} />
                <span className="font-bold text-[11px]" style={{ color: '#7A5C20' }}>{pack.coinAmount.toLocaleString()}</span>
                {pack.bonusCoins && (
                  <span className="text-[10px] font-semibold" style={{ color: '#6B9E58' }}>+{pack.bonusCoins.toLocaleString()}</span>
                )}
              </div>
              <div className="iap-price-button mt-2 w-full text-center text-xs">
                {storeKit.getLocalizedPrice(pack.iapProductId, pack.iapPrice)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
