/**
 * EggsTab — Shop tab for purchasing and hatching eggs.
 * Eggs are the primary coin sink, giving players a way to
 * spend coins on pet collection with weighted rarity pools.
 */

import { useState } from 'react';
import { Egg, Sparkles, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { EGG_TYPES, SPECIES_SELECTOR_PRICE } from '@/data/EggData';
import type { EggType } from '@/data/EggData';
import type { PetRarity } from '@/data/PetDatabase';
import { useLandStore } from '@/stores/landStore';
import { useCoinSystem } from '@/hooks/useCoinSystem';
import { useAppState } from '@/contexts/AppStateContext';
import { toast } from 'sonner';
import { playSoundEffect } from '@/hooks/useSoundEffects';

const RARITY_COLORS: Record<PetRarity, string> = {
  common: 'text-stone-500',
  uncommon: 'text-green-600',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-amber-500',
};

const RARITY_BG: Record<PetRarity, string> = {
  common: 'bg-stone-50 border-stone-200',
  uncommon: 'bg-green-50 border-green-200',
  rare: 'bg-blue-50 border-blue-200',
  epic: 'bg-purple-50 border-purple-200',
  legendary: 'bg-amber-50 border-amber-200',
};

const RARITY_LABELS: PetRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

interface EggsTabProps {
  coinBalance: number;
  canAfford: (price: number) => boolean;
}

export const EggsTab = ({ coinBalance, canAfford }: EggsTabProps) => {
  const [hatching, setHatching] = useState(false);
  const hatchEgg = useLandStore((s) => s.hatchEgg);
  const placePendingPet = useLandStore((s) => s.placePendingPet);
  const coinSystem = useCoinSystem();
  const { currentLevel } = useAppState();

  const handleHatch = async (egg: EggType) => {
    if (hatching) return;
    if (!canAfford(egg.coinPrice)) {
      toast.error('Not enough coins!');
      return;
    }

    setHatching(true);
    try {
      coinSystem.spendCoins(egg.coinPrice, 'shop_purchase');
      const pet = hatchEgg(egg, currentLevel);
      placePendingPet();
      playSoundEffect('purchase');
      toast.success(`Hatched a ${pet.rarity} ${pet.petId}!`, {
        description: 'Check your island to see your new pet!',
      });
    } finally {
      setHatching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Egg cards */}
      <div className="grid grid-cols-2 gap-3">
        {EGG_TYPES.map((egg) => (
          <EggCard
            key={egg.id}
            egg={egg}
            canAfford={canAfford(egg.coinPrice)}
            onHatch={() => handleHatch(egg)}
            hatching={hatching}
          />
        ))}
      </div>

      {/* Species Selector */}
      <div className={cn(
        'rounded-xl border p-3',
        'bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200',
      )}>
        <div className="flex items-center gap-2 mb-1.5">
          <Target className="w-4 h-4 text-sky-600" />
          <span className="font-bold text-sm text-sky-800">Species Selector</span>
        </div>
        <p className="text-[11px] text-sky-600/80 mb-2">
          Guarantee your next pet (session or egg) is your wished species!
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <PixelIcon name="coin" size={14} />
            <span className="font-black text-sm text-amber-700">{SPECIES_SELECTOR_PRICE.toLocaleString()}</span>
          </div>
          <button
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              canAfford(SPECIES_SELECTOR_PRICE)
                ? 'bg-sky-500 text-white active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed',
            )}
            disabled={!canAfford(SPECIES_SELECTOR_PRICE)}
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

function EggCard({
  egg,
  canAfford,
  onHatch,
  hatching,
}: {
  egg: EggType;
  canAfford: boolean;
  onHatch: () => void;
  hatching: boolean;
}) {
  return (
    <div className={cn(
      'rounded-xl border p-3 flex flex-col',
      RARITY_BG[egg.rarity],
      egg.rarity === 'legendary' && 'ring-1 ring-amber-300',
    )}>
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1">
        <Egg className={cn('w-4 h-4', RARITY_COLORS[egg.rarity])} />
        <span className={cn('font-bold text-xs', RARITY_COLORS[egg.rarity])}>
          {egg.name}
        </span>
        {egg.rarity === 'legendary' && (
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
        )}
      </div>

      {/* Rarity odds */}
      <div className="space-y-0.5 mb-2">
        {RARITY_LABELS.map((rarity) => {
          const weight = egg.rarityWeights[rarity];
          if (weight === 0) return null;
          return (
            <div key={rarity} className="flex items-center justify-between">
              <span className={cn('text-[10px] capitalize', RARITY_COLORS[rarity])}>
                {rarity}
              </span>
              <span className="text-[10px] font-mono font-bold text-stone-500">
                {weight}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Price + buy */}
      <div className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-1">
          <PixelIcon name="coin" size={14} />
          <span className="font-black text-sm text-amber-700">
            {egg.coinPrice.toLocaleString()}
          </span>
        </div>
        <button
          onClick={onHatch}
          disabled={!canAfford || hatching}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            canAfford && !hatching
              ? 'bg-amber-500 text-white active:scale-95 hover:bg-amber-600'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed',
          )}
        >
          {hatching ? '...' : 'Hatch!'}
        </button>
      </div>
    </div>
  );
}
