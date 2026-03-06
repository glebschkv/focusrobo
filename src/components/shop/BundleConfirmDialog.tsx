/**
 * BundleConfirmDialog — Warm merchant offering modal
 * IAP bundles and coin packs displayed with RPG warmth.
 */

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { StarterBundle, CoinPack } from "@/data/ShopData";
import { BOOSTER_TYPES } from "@/hooks/useCoinBooster";
import { EGG_TYPES } from "@/data/EggData";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useStoreKit } from "@/hooks/useStoreKit";

import { RARITY_BADGE_COLORS, RARITY_DOT_COLORS } from "./styles";

interface BundleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundle: StarterBundle | CoinPack | null;
  onPurchase: () => void;
  isPurchasing?: boolean;
}

export const BundleConfirmDialog = ({
  open,
  onOpenChange,
  bundle,
  onPurchase,
  isPurchasing = false,
}: BundleConfirmDialogProps) => {
  const storeKit = useStoreKit();

  if (!bundle) return null;

  const isStarterBundle = 'contents' in bundle;
  const isCoinPack = 'coinAmount' in bundle;
  const localizedPrice = storeKit.getLocalizedPrice(bundle.iapProductId, bundle.iapPrice);

  // Build contents list for starter bundles
  const contentItems: { icon: React.ReactNode; label: string; sublabel?: string; highlight?: boolean }[] = [];

  if (isStarterBundle) {
    const starterBundle = bundle as StarterBundle;

    if (starterBundle.contents.coins > 0) {
      contentItems.push({
        icon: <PixelIcon name="coin" size={16} />,
        label: `${starterBundle.contents.coins.toLocaleString()} Coins`,
        highlight: true,
      });
    }

    if (starterBundle.contents.boosterId) {
      const booster = BOOSTER_TYPES.find(b => b.id === starterBundle.contents.boosterId);
      if (booster) {
        contentItems.push({
          icon: <PixelIcon name="lightning" size={16} />,
          label: booster.name,
          sublabel: booster.description,
        });
      }
    }

    if (starterBundle.contents.streakFreezes && starterBundle.contents.streakFreezes > 0) {
      contentItems.push({
        icon: <PixelIcon name="ice-cube" size={16} />,
        label: `${starterBundle.contents.streakFreezes} Time Crystal${starterBundle.contents.streakFreezes > 1 ? 's' : ''}`,
        sublabel: 'Protect your streaks',
      });
    }

    // Egg contents
    if (starterBundle.contents.eggs && starterBundle.contents.eggs.length > 0) {
      for (const eggEntry of starterBundle.contents.eggs) {
        const eggDef = EGG_TYPES.find(e => e.id === eggEntry.eggId);
        if (eggDef) {
          contentItems.push({
            icon: <PixelIcon name={eggEntry.eggId === 'egg-legendary' ? 'egg-legendary' : eggEntry.eggId === 'egg-epic' ? 'egg-epic' : eggEntry.eggId === 'egg-rare' ? 'egg-rare' : 'egg'} size={16} />,
            label: `${eggEntry.quantity}× ${eggDef.name}`,
            sublabel: `Hatch a new pet!`,
            highlight: true,
          });
        }
      }
    }
  } else if (isCoinPack) {
    const coinPack = bundle as CoinPack;
    contentItems.push({
      icon: <PixelIcon name="coin" size={16} />,
      label: `${coinPack.coinAmount.toLocaleString()} Coins`,
      highlight: true,
    });
    if (coinPack.bonusCoins && coinPack.bonusCoins > 0) {
      contentItems.push({
        icon: <PixelIcon name="sparkles" size={16} />,
        label: `+${coinPack.bonusCoins.toLocaleString()} Bonus`,
        sublabel: 'Extra treasure!',
        highlight: true,
      });
    }
  }

  return (
    <Dialog open={open && !!bundle} onOpenChange={onOpenChange}>
      <DialogContent className="shop-modal max-w-[300px] p-0 overflow-hidden border-0">
        <VisuallyHidden>
          <DialogTitle>{bundle.name}</DialogTitle>
        </VisuallyHidden>
        <>
          {/* Header */}
          <div className="shop-modal-header p-4 text-center">
            <div className="h-24 mb-2 flex items-center justify-center">
              <PixelIcon name={bundle.icon} size={64} />
            </div>

            <h2 className="text-lg font-bold" style={{ color: '#5C3D1A' }}>
              {bundle.name}
            </h2>

            {/* Savings badge */}
            {'savings' in bundle && bundle.savings && (
              <div className="mt-2 inline-flex items-center gap-1.5">
                <span className="px-3 py-1 text-white text-[10px] font-bold rounded-full tracking-wider" style={{ background: '#6B9E58' }}>
                  Save {bundle.savings}
                </span>
              </div>
            )}

            {/* Rarity badge */}
            {'rarity' in bundle && bundle.rarity && (
              <div className="flex justify-center mt-2">
                <span
                  className="shop-rarity-badge text-[10px]"
                  style={{ background: RARITY_BADGE_COLORS[bundle.rarity] || '#8B6F47' }}
                >
                  {bundle.rarity}
                </span>
              </div>
            )}
          </div>

          {/* Contents section */}
          <div className="p-4 space-y-3" style={{ background: '#FFF8EE' }}>
            <p className="text-xs text-center leading-relaxed" style={{ color: '#8B6F47' }}>
              {bundle.description}
            </p>

            {/* Contents list */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold tracking-[0.2em] text-center" style={{ color: '#A0937E' }}>
                Contains
              </div>
              <div className="space-y-1.5">
                {contentItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded-xl"
                    style={{
                      background: 'linear-gradient(180deg, #F5EBD6 0%, #EDE4D2 100%)',
                      border: '1px solid #D4C4A0',
                    }}
                  >
                    <div className="potion-icon-frame" style={{ width: '28px', height: '28px', minWidth: '28px' }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-semibold",
                      )} style={{ color: item.highlight ? '#7A5C20' : '#5C3D1A' }}>
                        {item.label}
                      </div>
                      {item.sublabel && (
                        <div className="text-[10px] leading-tight" style={{ color: '#A0937E' }}>
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase button */}
            <button
              onClick={onPurchase}
              disabled={isPurchasing}
              className={cn(
                "shop-modal-claim-btn",
                isPurchasing ? "processing" : "affordable"
              )}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : (
                <>
                  <PixelIcon name="sparkles" size={16} />
                  <span>Claim for {localizedPrice}</span>
                </>
              )}
            </button>

            {/* Cancel button */}
            <button
              onClick={() => onOpenChange(false)}
              disabled={isPurchasing}
              className={cn(
                "shop-modal-cancel-btn",
                isPurchasing && "opacity-50 cursor-not-allowed"
              )}
            >
              Maybe Later
            </button>
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};
