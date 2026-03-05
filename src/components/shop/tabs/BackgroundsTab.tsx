/**
 * BackgroundsTab Component
 *
 * Shows background bundles and individual backgrounds for purchase.
 * Replaces the old CollectionTab which mixed robots and backgrounds.
 */

import { Check, Palette } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import {
  ShopItem,
  Bundle,
  PREMIUM_BACKGROUNDS,
  BACKGROUND_BUNDLES,
  ShopCategory,
} from "@/data/ShopData";
import type { ShopInventory } from "@/hooks/useShop";
import { BackgroundPreview, BundlePreviewCarousel } from "../ShopPreviewComponents";
import { RARITY_BG } from "../styles";
import { useThemeStore } from "@/stores";
import { useCallback } from "react";
import { toast } from "sonner";

interface BackgroundsTabProps {
  inventory: ShopInventory;
  isOwned: (itemId: string, category: ShopCategory) => boolean;
  isBundleOwned: (bundleId: string) => boolean;
  equipBackground: (backgroundId: string | null) => void;
  setSelectedItem: (item: ShopItem | Bundle | null) => void;
  setShowPurchaseConfirm: (show: boolean) => void;
  canAfford: (price: number) => boolean;
}

export const BackgroundsTab = ({
  inventory,
  isOwned,
  isBundleOwned,
  equipBackground,
  setSelectedItem,
  setShowPurchaseConfirm,
  canAfford,
}: BackgroundsTabProps) => {
  const setHomeBackground = useThemeStore((state) => state.setHomeBackground);
  const backgroundsWithPreviews = PREMIUM_BACKGROUNDS.filter(bg => bg.previewImage);

  const handleEquipBackground = useCallback((bgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (inventory.equippedBackground === bgId) {
      equipBackground(null);
      toast.success("Background unequipped");
      setHomeBackground('day');
    } else {
      equipBackground(bgId);
      toast.success("Background equipped!");
      const background = PREMIUM_BACKGROUNDS.find(bg => bg.id === bgId);
      const imagePath = background?.previewImage || 'day';
      setHomeBackground(imagePath);
    }
  }, [inventory.equippedBackground, equipBackground, setHomeBackground]);

  return (
    <div className="space-y-4">
      {/* Background Bundles */}
      {BACKGROUND_BUNDLES.length > 0 && (
        <div>
          <div className="shop-section-header">
            <span className="shop-section-title">Background Bundles</span>
          </div>
          <div className="space-y-2">
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
                  className={cn("shop-list-card", owned && "green")}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-20">
                      {bundle.previewImages && <BundlePreviewCarousel images={bundle.previewImages} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">{bundle.name}</span>
                        {owned && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> OWNED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {bundle.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground line-through">
                          {bundle.totalValue.toLocaleString()}
                        </span>
                        {!owned && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs font-bold",
                            affordable ? "text-amber-600" : "text-red-500"
                          )}>
                            <PixelIcon name="coin" size={12} />
                            {bundle.coinPrice?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Backgrounds */}
      {backgroundsWithPreviews.length > 0 && (
        <div>
          <div className="shop-section-header">
            <span className="shop-section-title">Backgrounds</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {backgroundsWithPreviews.map((bg) => {
              const owned = isOwned(bg.id, 'customize');
              const affordable = canAfford(bg.coinPrice || 0);
              const isEquipped = inventory.equippedBackground === bg.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => {
                    if (owned) {
                      handleEquipBackground(bg.id, { stopPropagation: () => {} } as React.MouseEvent);
                    } else {
                      setSelectedItem(bg);
                      setShowPurchaseConfirm(true);
                    }
                  }}
                  className={cn(
                    "shop-bg-card",
                    isEquipped && "equipped",
                    owned && !isEquipped && "owned"
                  )}
                >
                  <div className="relative h-20 overflow-hidden">
                    <BackgroundPreview imagePath={bg.previewImage!} size="large" className="border-0 rounded-none" />
                    {isEquipped && (
                      <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                        <div className="bg-purple-500 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Palette className="w-3 h-3 text-white" />
                          <span className="text-[10px] font-bold text-white">EQUIPPED</span>
                        </div>
                      </div>
                    )}
                    {owned && !isEquipped && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 rounded-full p-1">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "p-2",
                    isEquipped ? "bg-purple-50" :
                    owned ? "bg-green-50" : RARITY_BG[bg.rarity || 'common']
                  )}>
                    <span className="text-[10px] font-bold block leading-tight truncate">{bg.name}</span>
                    {owned ? (
                      <div className="text-[9px] font-medium text-center mt-1 text-purple-600 dark:text-purple-400">
                        {isEquipped ? "Tap to unequip" : "Tap to equip"}
                      </div>
                    ) : (
                      <div className={cn(
                        "flex items-center justify-center gap-0.5 mt-1 text-[9px] font-bold",
                        affordable ? "text-amber-600" : "text-red-500"
                      )}>
                        <PixelIcon name="coin" size={10} />
                        {bg.coinPrice?.toLocaleString()}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
