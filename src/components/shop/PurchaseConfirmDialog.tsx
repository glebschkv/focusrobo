/**
 * PurchaseConfirmDialog — Warm ritual modal
 * Framed as "claiming" an item, not "purchasing" a product.
 * Warm parchment tones with cozy RPG merchant feel.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Loader2 } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { ShopItem, Bundle } from "@/data/ShopData";
import { BackgroundPreview, BundlePreviewCarousel } from "./ShopPreviewComponents";

import { RARITY_BADGE_COLORS } from "./styles";

interface PurchaseConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: ShopItem | Bundle | null;
  onPurchase: () => void;
  canAfford: (price: number) => boolean;
  coinBalance: number;
  isPurchasing?: boolean;
}

export const PurchaseConfirmDialog = ({
  open,
  onOpenChange,
  selectedItem,
  onPurchase,
  canAfford,
  coinBalance,
  isPurchasing = false,
}: PurchaseConfirmDialogProps) => {

  if (!selectedItem) return null;

  const price = 'coinPrice' in selectedItem ? selectedItem.coinPrice || 0 : 0;
  const affordable = canAfford(price);

  return (
    <Dialog open={open && !!selectedItem} onOpenChange={onOpenChange}>
      <DialogContent className="shop-modal max-w-[280px] p-0 overflow-hidden border-0">
        <>
          <div className="shop-modal-header p-4 text-center">
            <div className="h-28 mb-2 flex items-center justify-center overflow-hidden">
              {'previewImages' in selectedItem && (selectedItem as Bundle).previewImages ? (
                <div className="w-full">
                  <BundlePreviewCarousel images={(selectedItem as Bundle).previewImages!} />
                </div>
              ) : 'previewImage' in selectedItem && typeof selectedItem.previewImage === 'string' && selectedItem.previewImage ? (
                <BackgroundPreview imagePath={selectedItem.previewImage} size="large" className="w-full" />
              ) : (
                <PixelIcon name={selectedItem.icon} size={48} />
              )}
            </div>
            <DialogHeader>
              <DialogTitle className="text-lg font-black tracking-tight" style={{ color: '#5C3D1A' }}>
                {selectedItem.name}
              </DialogTitle>
            </DialogHeader>
            {'rarity' in selectedItem && selectedItem.rarity && (
              <div className="flex justify-center mt-2">
                <span
                  className="shop-rarity-badge"
                  style={{ background: RARITY_BADGE_COLORS[selectedItem.rarity] || '#8B6F47' }}
                >
                  {selectedItem.rarity}
                </span>
              </div>
            )}
            {'itemIds' in selectedItem && (
              <div className="mt-1 text-xs" style={{ color: '#8B6F47' }}>
                Includes {(selectedItem as Bundle).itemIds.length} items
              </div>
            )}
          </div>

          <div className="p-4 space-y-3" style={{ background: '#FFF8EE' }}>
            <p className="text-xs text-center leading-relaxed" style={{ color: '#8B6F47' }}>
              {selectedItem.description}
            </p>

            {'totalValue' in selectedItem && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="line-through" style={{ color: '#A0937E' }}>
                  {(selectedItem as Bundle).totalValue.toLocaleString()}
                </span>
                <span className="px-2 py-0.5 text-white text-[10px] font-bold rounded" style={{ background: '#6B9E58' }}>
                  Save {(selectedItem as Bundle).savings}
                </span>
              </div>
            )}

            <div className="retro-price-display py-2">
              <span className="text-xs" style={{ color: '#8B6F47' }}>Cost</span>
              <div className="flex items-center gap-1.5">
                <PixelIcon name="coin" size={16} />
                <span className="text-lg font-black" style={{ color: '#7A5C20' }}>
                  {price.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-center text-[10px]" style={{ color: '#A0937E' }}>
              Remaining: <span className="font-bold">{(coinBalance - price).toLocaleString()}</span> coins
            </div>

            <button
              onClick={onPurchase}
              disabled={isPurchasing || !affordable}
              className={cn(
                "shop-modal-claim-btn",
                isPurchasing ? "processing" : affordable ? "affordable" : "cant-afford"
              )}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Claiming...</span>
                </>
              ) : affordable ? (
                <>
                  <PixelIcon name="sparkles" size={16} />
                  <span>Claim</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Not Enough Coins</span>
                </>
              )}
            </button>

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
