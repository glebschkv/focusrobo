import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Zap, Shield, Star, Loader2 } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { StarterBundle, CoinPack } from "@/data/ShopData";
import { getRobotById } from "@/data/RobotDatabase";
import { BOOSTER_TYPES } from "@/hooks/useCoinBooster";
import { SpritePreview } from "./ShopPreviewComponents";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useStoreKit } from "@/hooks/useStoreKit";

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
  const contentItems: { icon: React.ReactNode; label: string; sublabel?: string; highlight?: boolean; variant?: 'legendary' | 'epic' }[] = [];

  if (isStarterBundle) {
    const starterBundle = bundle as StarterBundle;

    if (starterBundle.contents.coins > 0) {
      contentItems.push({
        icon: <PixelIcon name="coin" size={16} />,
        label: `${starterBundle.contents.coins.toLocaleString()} Coins`,
        highlight: true,
        variant: 'legendary',
      });
    }

    if (starterBundle.contents.boosterId) {
      const booster = BOOSTER_TYPES.find(b => b.id === starterBundle.contents.boosterId);
      if (booster) {
        contentItems.push({
          icon: <Zap className="w-4 h-4 text-yellow-400" />,
          label: booster.name,
          sublabel: booster.description,
        });
      }
    }

    if (starterBundle.contents.characterId) {
      const animal = getRobotById(starterBundle.contents.characterId);
      if (animal) {
        contentItems.push({
          icon: animal.imageConfig ? (
            <SpritePreview robot={animal} scale={0.4} />
          ) : (
            <PixelIcon name={animal.icon} size={16} />
          ),
          label: animal.name,
          sublabel: `${animal.rarity.charAt(0).toUpperCase() + animal.rarity.slice(1)} Bot`,
          variant: 'epic',
        });
      }
    }

    if (starterBundle.contents.streakFreezes && starterBundle.contents.streakFreezes > 0) {
      contentItems.push({
        icon: <Shield className="w-4 h-4 text-cyan-400" />,
        label: `${starterBundle.contents.streakFreezes} Streak Freeze${starterBundle.contents.streakFreezes > 1 ? 's' : ''}`,
        sublabel: 'Protect your streaks',
      });
    }
  } else if (isCoinPack) {
    const coinPack = bundle as CoinPack;
    contentItems.push({
      icon: <PixelIcon name="coin" size={16} />,
      label: `${coinPack.coinAmount.toLocaleString()} Coins`,
      highlight: true,
      variant: 'legendary',
    });
    if (coinPack.bonusCoins && coinPack.bonusCoins > 0) {
      contentItems.push({
        icon: <Sparkles className="w-4 h-4 text-green-400" />,
        label: `+${coinPack.bonusCoins.toLocaleString()} Bonus`,
        sublabel: 'Free extra coins!',
        highlight: true,
        variant: 'legendary',
      });
    }
  }

  // Bot preview for bundles that include a character
  const petId = isStarterBundle ? (bundle as StarterBundle).contents.characterId : null;
  const pet = petId ? getRobotById(petId) : null;

  return (
    <Dialog open={open && !!bundle} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[300px] p-0 overflow-hidden border border-stone-200 rounded-2xl bg-white shadow-lg">
        <VisuallyHidden>
          <DialogTitle>{bundle.name}</DialogTitle>
        </VisuallyHidden>
        <>
          {/* Header */}
          <div className="p-4 text-center border-b border-stone-100 bg-stone-50">
            {/* Bot sprite preview or bundle icon */}
            <div className="h-24 mb-2 flex items-center justify-center">
              {pet?.imageConfig ? (
                <SpritePreview
                  animal={pet}
                  scale={Math.min(2.5, 80 / Math.max(pet.imageConfig?.size || 64, pet.imageConfig?.size || 64))}
                />
              ) : (
                <div className="animate-bounce" style={{ animationDuration: '2s' }}>
                  <PixelIcon name={bundle.icon} size={64} />
                </div>
              )}
            </div>

            {/* Bundle name */}
            <h2 className="text-lg font-bold text-stone-900">
              {bundle.name}
            </h2>

            {/* Savings badge */}
            {'savings' in bundle && bundle.savings && (
              <div className="mt-2 inline-flex items-center gap-1.5">
                <span className="px-3 py-1 text-white text-[10px] font-bold rounded-full uppercase tracking-wider bg-emerald-500">
                  Save {bundle.savings}
                </span>
              </div>
            )}

            {/* Rarity stars */}
            {'rarity' in bundle && bundle.rarity && (
              <div className="flex justify-center mt-2 gap-1">
                {[...Array(bundle.rarity === 'common' ? 1 : bundle.rarity === 'rare' ? 2 : bundle.rarity === 'epic' ? 3 : 4)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4 text-amber-400 fill-amber-400",
                      bundle.rarity === 'legendary' && "animate-pulse"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Contents section */}
          <div className="p-4 space-y-3">
            <p className="text-[11px] text-center leading-relaxed text-stone-400">
              {bundle.description}
            </p>

            {/* Contents list */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-center text-stone-300">
                Includes
              </div>
              <div className="space-y-1.5">
                {contentItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-stone-200">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-semibold",
                        item.highlight ? "text-amber-500" : "text-stone-900"
                      )}>
                        {item.label}
                      </div>
                      {item.sublabel && (
                        <div className="text-[10px] leading-tight text-stone-400">
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
                "w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95",
                isPurchasing
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-sky-500 text-white hover:bg-sky-600"
              )}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buy for {localizedPrice}</span>
                </>
              )}
            </button>

            {/* Cancel button */}
            <button
              onClick={() => onOpenChange(false)}
              disabled={isPurchasing}
              className={cn(
                "w-full py-2.5 rounded-xl flex items-center justify-center text-xs font-medium text-stone-400 border border-stone-200 transition-all",
                isPurchasing && "opacity-50 cursor-not-allowed"
              )}
            >
              Cancel
            </button>
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
};
