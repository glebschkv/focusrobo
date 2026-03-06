/**
 * InventoryTab — "My Collection"
 * Owned items displayed as warm parchment inventory cards.
 */

import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useStreakFreezeCount } from "@/stores/streakStore";
import { useOwnedBackgrounds, useEquippedBackground } from "@/stores/shopStore";
import { PREMIUM_BACKGROUNDS } from "@/data/ShopData";
import { useCoinBooster } from "@/hooks/useCoinBooster";
import { Check } from "lucide-react";

interface InventoryTabProps {
  equipBackground: (backgroundId: string | null) => boolean;
}

export const InventoryTab = ({ equipBackground }: InventoryTabProps) => {
  const streakFreezeCount = useStreakFreezeCount();
  const ownedBackgrounds = useOwnedBackgrounds();
  const equippedBackground = useEquippedBackground();

  const {
    isBoosterActive,
    activeBooster,
    getTimeRemainingFormatted,
    getCurrentMultiplier,
    getBoosterType,
  } = useCoinBooster();

  const boosterActive = isBoosterActive();
  const boosterInfo = activeBooster ? getBoosterType(activeBooster.boosterId) : null;

  const ownedBgData = PREMIUM_BACKGROUNDS.filter(bg => ownedBackgrounds.includes(bg.id));

  const hasAnyItems = streakFreezeCount > 0 || boosterActive || ownedBgData.length > 0;

  return (
    <div className="space-y-4">
      {/* Section intro */}
      <p className="text-xs font-medium px-1" style={{ color: '#8B6F47' }}>
        Your treasures and discoveries, all in one place.
      </p>

      {/* Supplies */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">Supplies</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Time Crystals */}
          <div className={cn(
            "shop-grid-card",
            streakFreezeCount === 0 && "opacity-50"
          )}>
            <div className="potion-icon-frame mx-auto mb-1.5" style={{ width: '36px', height: '36px' }}>
              <PixelIcon name="ice-cube" size={18} />
            </div>
            <span className="text-[10px] font-bold block" style={{ color: '#5C3D1A' }}>Time Crystals</span>
            <span className="text-[10px] block mt-0.5" style={{ color: '#8B6F47' }}>Protects your streaks</span>
            <div className="mt-1.5">
              <span className={cn(
                "text-lg font-black tabular-nums",
              )} style={{ color: streakFreezeCount > 0 ? '#5B8FB9' : '#A0937E' }}>
                {streakFreezeCount}
              </span>
            </div>
          </div>

          {/* Active Elixir */}
          <div className={cn(
            "shop-grid-card",
            !boosterActive && "opacity-50"
          )}>
            <div className="potion-icon-frame mx-auto mb-1.5" style={{
              width: '36px', height: '36px',
              borderColor: boosterActive ? '#9B72CF' : '#D4C4A0',
            }}>
              <PixelIcon name="lightning" size={18} />
            </div>
            <span className="text-[10px] font-bold block" style={{ color: '#5C3D1A' }}>Focus Elixir</span>
            {boosterActive && boosterInfo ? (
              <div className="mt-1">
                <span className="text-[10px] font-bold block" style={{ color: '#9B72CF' }}>
                  {getCurrentMultiplier()}x {boosterInfo.name}
                </span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <PixelIcon name="clock" size={10} />
                  <span className="text-[10px] font-bold tabular-nums" style={{ color: '#9B72CF' }}>
                    {getTimeRemainingFormatted()}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] block mt-0.5" style={{ color: '#A0937E' }}>None active</span>
            )}
          </div>
        </div>
      </div>

      {/* Owned Worlds */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">
            Discovered Worlds
            {ownedBgData.length > 0 && (
              <span className="ml-1.5 text-[10px] font-bold" style={{ color: '#A0937E' }}>({ownedBgData.length})</span>
            )}
          </span>
        </div>
        {ownedBgData.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {ownedBgData.map(bg => {
              const isEquipped = equippedBackground === bg.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => {
                    if (isEquipped) {
                      equipBackground(null);
                    } else {
                      equipBackground(bg.id);
                    }
                  }}
                  className={cn(
                    "world-portal transition-all active:scale-95",
                    isEquipped && "ring-2 ring-[#9B72CF]"
                  )}
                >
                  {bg.previewImage ? (
                    <div className="w-full aspect-[4/3] overflow-hidden rounded-t-lg">
                      <img
                        src={bg.previewImage}
                        alt={bg.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center rounded-t-lg" style={{ background: 'linear-gradient(180deg, #E8DCC8 0%, #D4C4A0 100%)' }}>
                      <PixelIcon name="island" size={20} />
                    </div>
                  )}
                  <div className="px-1.5 py-1.5">
                    <span className="text-[10px] font-bold block truncate" style={{ color: '#5C3D1A' }}>{bg.name}</span>
                  </div>
                  {isEquipped && (
                    <div className="absolute top-1 right-1">
                      <span className="px-1.5 py-0.5 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5" style={{ background: '#9B72CF' }}>
                        <Check className="w-2 h-2" /> Active
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-5 px-4 text-center">
            <p className="text-xs font-medium" style={{ color: '#A0937E' }}>No worlds discovered yet</p>
            <p className="text-[10px] mt-1" style={{ color: '#C4B8A0' }}>Visit the Worlds tab to explore new lands</p>
          </div>
        )}
      </div>

      {/* Empty state */}
      {!hasAnyItems && (
        <div className="py-8 text-center">
          <PixelIcon name="compass" size={32} />
          <p className="text-sm font-bold mt-3" style={{ color: '#8B6F47' }}>Your collection awaits</p>
          <p className="text-xs mt-1" style={{ color: '#A0937E' }}>Explore the cart to find treasures</p>
        </div>
      )}
    </div>
  );
};
