/**
 * EggsTab Component
 *
 * Shop tab for purchasing and hatching eggs. Eggs are the primary coin sink —
 * they make coins valuable and drive the pet collection loop.
 *
 * Features:
 * - Daily free egg claim
 * - 4 egg tiers (Common/Rare/Epic/Legendary) with rarity odds
 * - Purchase flow: spend coins -> hatch egg -> reveal pet -> place on island
 */

import { useState, useCallback } from "react";
import { Gift, Egg, Sparkles, Clock } from "lucide-react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { cn } from "@/lib/utils";
import { EGG_TYPES, isDailyFreeEggAvailable, claimDailyFreeEgg, getEggById } from "@/data/EggData";
import type { EggType } from "@/data/EggData";
import type { PetRarity } from "@/data/PetDatabase";
import { useLandStore } from "@/stores/landStore";
import { useCoinSystem } from "@/hooks/useCoinSystem";
import { useXPSystem } from "@/hooks/useXPSystem";
import { PetRevealModal } from "@/components/focus-timer/PetRevealModal";
import { toast } from "sonner";
import { playSoundEffect } from "@/hooks/useSoundEffects";

const RARITY_LABELS: Record<PetRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const EGG_RARITY_STYLES: Record<string, {
  border: string;
  bg: string;
  glow: string;
  accent: string;
}> = {
  common: {
    border: 'border-stone-300',
    bg: 'bg-gradient-to-b from-stone-50 to-stone-100',
    glow: '',
    accent: 'text-stone-600',
  },
  rare: {
    border: 'border-blue-300',
    bg: 'bg-gradient-to-b from-blue-50 to-blue-100',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.15)]',
    accent: 'text-blue-600',
  },
  epic: {
    border: 'border-purple-300',
    bg: 'bg-gradient-to-b from-purple-50 to-purple-100',
    glow: 'shadow-[0_0_16px_rgba(168,85,247,0.2)]',
    accent: 'text-purple-600',
  },
  legendary: {
    border: 'border-amber-400',
    bg: 'bg-gradient-to-b from-amber-50 to-amber-100',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.25)]',
    accent: 'text-amber-600',
  },
};

interface EggsTabProps {
  coinBalance: number;
  canAfford: (price: number) => boolean;
}

export const EggsTab = ({ coinBalance, canAfford }: EggsTabProps) => {
  const [isHatching, setIsHatching] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [revealPet, setRevealPet] = useState<{
    petId: string;
    size: 'baby' | 'adolescent' | 'adult';
    rarity: PetRarity;
  } | null>(null);

  const hatchEgg = useLandStore((s) => s.hatchEgg);
  const placePendingPet = useLandStore((s) => s.placePendingPet);
  const { spendCoins } = useCoinSystem();
  const { currentLevel } = useXPSystem();

  const [dailyEggAvailable, setDailyEggAvailable] = useState(isDailyFreeEggAvailable);

  const handleHatch = useCallback(async (egg: EggType, isFree: boolean) => {
    if (isHatching) return;

    if (!isFree) {
      if (!canAfford(egg.coinPrice)) {
        toast.error('Not enough coins!');
        return;
      }

      setIsHatching(true);
      const success = await spendCoins(egg.coinPrice, 'shop_purchase', `egg-${egg.id}`);
      if (!success) {
        setIsHatching(false);
        toast.error('Purchase failed. Please try again.');
        return;
      }
    } else {
      setIsHatching(true);
      claimDailyFreeEgg();
      setDailyEggAvailable(false);
    }

    // Hatch the egg — generates a pending pet with egg's custom rarity weights
    const pet = hatchEgg(egg, currentLevel);

    playSoundEffect('purchase');

    setRevealPet({
      petId: pet.petId,
      size: pet.size,
      rarity: pet.rarity,
    });
    setShowReveal(true);
    setIsHatching(false);
  }, [isHatching, canAfford, spendCoins, hatchEgg, currentLevel]);

  const handleRevealClose = useCallback(() => {
    setShowReveal(false);
    // Place the pet on the island
    placePendingPet();
    setRevealPet(null);
  }, [placePendingPet]);

  const freeEgg = getEggById('egg-common');

  return (
    <div className="space-y-4">
      {/* Daily Free Egg */}
      {freeEgg && (
        <button
          onClick={() => dailyEggAvailable && handleHatch(freeEgg, true)}
          disabled={!dailyEggAvailable || isHatching}
          className={cn(
            "w-full rounded-xl p-4 text-left transition-all",
            dailyEggAvailable
              ? "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-[0_0_16px_rgba(234,179,8,0.15)] active:scale-[0.98]"
              : "bg-stone-50 border border-stone-200 opacity-60"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
              dailyEggAvailable
                ? "bg-gradient-to-br from-amber-400 to-orange-400"
                : "bg-stone-300"
            )}>
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-amber-900">
                  {dailyEggAvailable ? 'Free Daily Egg!' : 'Daily Egg Claimed'}
                </span>
                {dailyEggAvailable && (
                  <span className="px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded-full uppercase">
                    Free
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-700/70 mt-0.5">
                {dailyEggAvailable
                  ? 'Tap to hatch a free Common Egg!'
                  : 'Come back tomorrow for another free egg.'}
              </p>
            </div>
            {dailyEggAvailable && (
              <Egg className="w-5 h-5 text-amber-500 animate-pulse flex-shrink-0" />
            )}
            {!dailyEggAvailable && (
              <Clock className="w-5 h-5 text-stone-400 flex-shrink-0" />
            )}
          </div>
        </button>
      )}

      {/* Egg Cards Grid */}
      <div>
        <div className="shop-section-header">
          <span className="shop-section-title">Hatch Eggs</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {EGG_TYPES.map((egg) => {
            const style = EGG_RARITY_STYLES[egg.rarity];
            const affordable = canAfford(egg.coinPrice);

            return (
              <button
                key={egg.id}
                onClick={() => handleHatch(egg, false)}
                disabled={!affordable || isHatching}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition-all active:scale-[0.97]",
                  style.border,
                  style.bg,
                  style.glow,
                  !affordable && "opacity-50"
                )}
              >
                {/* Egg icon + name */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">
                    {egg.rarity === 'legendary' ? '🥚✨' : egg.rarity === 'epic' ? '🥚💫' : '🥚'}
                  </div>
                  <div>
                    <span className={cn("font-black text-xs block", style.accent)}>
                      {egg.name}
                    </span>
                  </div>
                </div>

                {/* Rarity odds */}
                <div className="space-y-0.5 mb-3">
                  {(Object.entries(egg.rarityWeights) as [PetRarity, number][])
                    .filter(([, weight]) => weight > 0)
                    .map(([rarity, weight]) => (
                      <div key={rarity} className="flex items-center justify-between">
                        <span className="text-[9px] text-stone-500 capitalize">
                          {RARITY_LABELS[rarity]}
                        </span>
                        <span className="text-[9px] font-bold text-stone-600">
                          {weight}%
                        </span>
                      </div>
                    ))}
                </div>

                {/* Price */}
                <div className={cn(
                  "flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs",
                  affordable
                    ? "bg-white/60 text-amber-700"
                    : "bg-white/40 text-red-500"
                )}>
                  <PixelIcon name="coin" size={14} />
                  <span>{egg.coinPrice.toLocaleString()}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info text */}
      <p className="text-center text-[10px] text-stone-400 px-4">
        Hatched pets are placed on your island. Rarer eggs give better odds at uncommon, epic, and legendary pets!
      </p>

      {/* Pet Reveal Modal */}
      {revealPet && (
        <PetRevealModal
          isOpen={showReveal}
          onClose={handleRevealClose}
          petId={revealPet.petId}
          size={revealPet.size}
          rarity={revealPet.rarity}
          sessionMinutes={0}
          cellIndex={-1}
        />
      )}
    </div>
  );
};
