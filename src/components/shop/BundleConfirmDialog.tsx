import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Zap, Shield, Star, Loader2 } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { StarterBundle, CoinPack } from "@/data/ShopData";
import { BOOSTER_TYPES } from "@/hooks/useCoinBooster";
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

    if (starterBundle.contents.streakFreezes && starterBundle.contents.streakFreezes > 0) {
      contentItems.push({
        icon: <Shield className="w-4 h-4 text-teal-400" />,
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

  return (
    <Dialog open={open && !!bundle} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[300px] p-0 overflow-hidden border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--card))] shadow-lg">
        <VisuallyHidden>
          <DialogTitle>{bundle.name}</DialogTitle>
        </VisuallyHidden>
        <>
          {/* Header */}
          <div className="p-4 text-center border-b border-[hsl(var(--border)/0.5)] bg-[hsl(var(--muted)/0.3)]">
            <div className="h-24 mb-2 flex items-center justify-center">
              <PixelIcon name={bundle.icon} size={64} />
            </div>

            {/* Bundle name */}
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
              {bundle.name}
            </h2>

            {/* Savings badge */}
            {'savings' in bundle && bundle.savings && (
              <div className="mt-2 inline-flex items-center gap-1.5">
                <span className="px-3 py-1 text-white text-[10px] font-bold rounded-full uppercase tracking-wider bg-[hsl(var(--primary))]">
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
                    className="w-4 h-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Contents section */}
          <div className="p-4 space-y-3">
            <p className="text-[11px] text-center leading-relaxed text-[hsl(var(--muted-foreground))]">
              {bundle.description}
            </p>

            {/* Contents list */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-center text-[hsl(var(--muted-foreground)/0.6)]">
                Includes
              </div>
              <div className="space-y-1.5">
                {contentItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border)/0.5)]"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-semibold",
                        item.highlight ? "text-amber-500" : "text-[hsl(var(--foreground))]"
                      )}>
                        {item.label}
                      </div>
                      {item.sublabel && (
                        <div className="text-[10px] leading-tight text-[hsl(var(--muted-foreground))]">
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
                  ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                  : "bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary)/0.9)]"
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
                "w-full py-2.5 rounded-xl flex items-center justify-center text-xs font-medium text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] transition-all",
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
