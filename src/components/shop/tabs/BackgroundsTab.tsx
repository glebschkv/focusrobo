/**
 * BackgroundsTab — "Worlds"
 * Backgrounds displayed as world portals your pets can explore.
 * Immersive previews with warm, magical framing.
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
      toast.success("World unequipped");
      setHomeBackground('day');
    } else {
      equipBackground(bgId);
      toast.success("New world equipped!");
      const background = PREMIUM_BACKGROUNDS.find(bg => bg.id === bgId);
      setHomeBackground(background?.theme || 'day');
    }
  }, [inventory.equippedBackground, equipBackground, setHomeBackground]);

  return (
    <div className="space-y-4">
      {/* Section intro */}
      <p className="text-xs font-medium px-1" style={{ color: '#8B6F47' }}>
        Discover new lands for your pets to call home.
      </p>

      {/* World Collections (Bundles) */}
      {BACKGROUND_BUNDLES.length > 0 && (
        <div>
          <div className="shop-section-header">
            <span className="shop-section-title">World Collections</span>
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
                    <div className="flex-shrink-0 w-20 rounded-lg overflow-hidden" style={{ border: '1.5px solid #C9B896' }}>
                      {bundle.previewImages && <BundlePreviewCarousel images={bundle.previewImages} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm" style={{ color: '#5C3D1A' }}>{bundle.name}</span>
                        {owned && (
                          <span className="px-2 py-0.5 text-white text-[10px] font-bold rounded-full flex items-center gap-1" style={{ background: '#6B9E58' }}>
                            <Check className="w-2.5 h-2.5" /> Collected
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#8B6F47' }}>
                        {bundle.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] line-through" style={{ color: '#A0937E' }}>
                          {bundle.totalValue.toLocaleString()}
                        </span>
                        {!owned && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs font-bold",
                            affordable ? "text-[#7A5C20]" : "text-[#8B4040]"
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

      {/* Individual Worlds */}
      {backgroundsWithPreviews.length > 0 && (
        <div>
          <div className="shop-section-header">
            <span className="shop-section-title">Individual Worlds</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
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
                    "world-portal",
                    isEquipped && "equipped",
                    owned && !isEquipped && "owned"
                  )}
                >
                  <div className="relative h-24 overflow-hidden">
                    <BackgroundPreview imagePath={bg.previewImage!} size="large" className="border-0 rounded-none" />
                    <div className="world-portal-overlay" />
                    {isEquipped && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(155,114,207,0.25)' }}>
                        <div className="rounded-full px-2.5 py-1 flex items-center gap-1" style={{ background: '#9B72CF' }}>
                          <Palette className="w-3 h-3 text-white" />
                          <span className="text-[10px] font-bold text-white">Active</span>
                        </div>
                      </div>
                    )}
                    {owned && !isEquipped && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(107,158,88,0.2)' }}>
                        <div className="rounded-full p-1.5" style={{ background: '#6B9E58' }}>
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    )}
                    {/* World name overlay */}
                    <div className="world-portal-info">
                      <span className="text-[11px] font-bold block leading-tight drop-shadow-md">{bg.name}</span>
                    </div>
                  </div>
                  <div className="p-2 text-center" style={{ background: isEquipped ? '#F2EAFA' : owned ? '#F0F5E0' : '#FFF6E8' }}>
                    {owned ? (
                      <div className="text-[10px] font-medium" style={{ color: isEquipped ? '#9B72CF' : '#6B9E58' }}>
                        {isEquipped ? "Tap to unequip" : "Tap to equip"}
                      </div>
                    ) : (
                      <div className={cn(
                        "flex items-center justify-center gap-1 text-[10px] font-bold",
                      )} style={{ color: affordable ? '#7A5C20' : '#8B4040' }}>
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
