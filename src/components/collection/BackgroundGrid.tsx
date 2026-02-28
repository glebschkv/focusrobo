/**
 * BackgroundGrid Component
 *
 * Renders the premium backgrounds grid for the shop.
 * Extracted from PetCollectionGrid for better maintainability.
 */

import { memo, useCallback } from "react";
import {
  ShoppingBag,
  Image,
  Check,
  Palette,
} from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { PREMIUM_BACKGROUNDS, PremiumBackground } from "@/data/ShopData";

interface BackgroundGridProps {
  ownedBackgrounds: string[];
  equippedBackground: string | null;
  onEquipBackground: (bgId: string) => void;
  onSelectBackground: (bg: PremiumBackground) => void;
}

export const BackgroundGrid = memo(({
  ownedBackgrounds,
  equippedBackground,
  onEquipBackground,
  onSelectBackground,
}: BackgroundGridProps) => {
  const handleClick = useCallback((bg: PremiumBackground, owned: boolean) => {
    if (owned) {
      onEquipBackground(bg.id);
    } else {
      onSelectBackground(bg);
    }
  }, [onEquipBackground, onSelectBackground]);

  // Only show backgrounds that have real preview images
  const visibleBackgrounds = PREMIUM_BACKGROUNDS.filter(bg => bg.previewImage);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Image className="w-4 h-4 text-stone-400" />
        <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
          Shop Backgrounds
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {visibleBackgrounds.map((bg) => {
          const owned = ownedBackgrounds.includes(bg.id);
          const isEquipped = equippedBackground === bg.id;

          return (
            <BackgroundCard
              key={bg.id}
              background={bg}
              owned={owned}
              isEquipped={isEquipped}
              onClick={() => handleClick(bg, owned)}
            />
          );
        })}
      </div>
    </div>
  );
});

BackgroundGrid.displayName = 'BackgroundGrid';

// ============================================================================
// BACKGROUND CARD COMPONENT
// ============================================================================

interface BackgroundCardProps {
  background: PremiumBackground;
  owned: boolean;
  isEquipped: boolean;
  onClick: () => void;
}

const BackgroundCard = memo(({
  background: bg,
  owned,
  isEquipped,
  onClick,
}: BackgroundCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative rounded-xl overflow-hidden transition-all border active:scale-[0.97]",
        isEquipped
          ? "border-sky-300 ring-1 ring-sky-300"
          : owned
          ? "border-emerald-300"
          : "border-stone-200"
      )}
    >
      {/* Background Preview */}
      <div className="relative h-20 overflow-hidden bg-stone-50">
        {bg.previewImage ? (
          <img
            src={bg.previewImage}
            alt={bg.name}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {bg.icon}
          </div>
        )}

        {/* Status overlay */}
        {isEquipped && (
          <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
            <div className="bg-sky-500 rounded-full px-2 py-0.5 flex items-center gap-1">
              <Palette className="w-3 h-3 text-white" />
              <span className="text-[10px] font-bold text-white">EQUIPPED</span>
            </div>
          </div>
        )}
        {owned && !isEquipped && (
          <div className="absolute top-1 right-1">
            <div className="bg-emerald-500 rounded-full p-0.5">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        {!owned && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <div className="bg-sky-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              <span className="text-[9px] font-bold">SHOP</span>
            </div>
          </div>
        )}

        {/* Rarity dot */}
        <div className={cn(
          "absolute top-1 left-1 h-2 w-2 rounded-full",
          bg.rarity === 'legendary' ? "bg-amber-400" :
          bg.rarity === 'epic' ? "bg-purple-400" :
          bg.rarity === 'rare' ? "bg-blue-400" : "bg-stone-400"
        )} />
      </div>

      {/* Info */}
      <div className="p-2 text-left bg-white">
        <span className="text-[11px] font-semibold block leading-tight truncate text-stone-900">
          {bg.name}
        </span>
        {owned ? (
          <span className="text-[9px] text-stone-400 font-medium">
            {isEquipped ? "Tap to unequip" : "Tap to equip"}
          </span>
        ) : (
          <div className="flex items-center gap-0.5 text-[9px] text-amber-500">
            <PixelIcon name="coin" size={10} />
            <span className="font-bold">{bg.coinPrice?.toLocaleString()}</span>
          </div>
        )}
      </div>
    </button>
  );
});

BackgroundCard.displayName = 'BackgroundCard';
