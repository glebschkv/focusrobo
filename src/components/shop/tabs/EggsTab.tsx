/**
 * EggsTab — Shop tab for purchasing and hatching eggs.
 * Eggs are the primary coin sink, giving players a way to
 * spend coins on pet collection with weighted rarity pools.
 */

import { useState } from 'react';
import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { EGG_TYPES, SPECIES_SELECTOR_PRICE } from '@/data/EggData';
import type { EggType } from '@/data/EggData';
import type { PetRarity } from '@/data/PetDatabase';
import { useLandStore } from '@/stores/landStore';
import { useCoinSystem } from '@/hooks/useCoinSystem';
import { useCurrentLevel } from '@/stores/xpStore';
import { toast } from 'sonner';
import { playSoundEffect } from '@/hooks/useSoundEffects';

const RARITY_COLORS: Record<PetRarity, string> = {
  common: 'text-stone-500',
  uncommon: 'text-green-600',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-amber-500',
};

const RARITY_STRIPE: Record<PetRarity, string> = {
  common: 'bg-stone-300',
  uncommon: 'bg-green-400',
  rare: 'bg-blue-400',
  epic: 'bg-purple-400',
  legendary: 'bg-amber-400',
};

const RARITY_LABELS: PetRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const EGG_ICON_MAP: Record<string, string> = {
  'common-egg': 'egg',
  'rare-egg': 'egg-rare',
  'epic-egg': 'egg-epic',
  'legendary-egg': 'egg-legendary',
};

interface EggsTabProps {
  coinBalance: number;
  canAfford: (price: number) => boolean;
}

export const EggsTab = ({ coinBalance, canAfford }: EggsTabProps) => {
  const [hatching, setHatching] = useState(false);
  const hatchEgg = useLandStore((s) => s.hatchEgg);
  const placePendingPet = useLandStore((s) => s.placePendingPet);
  const coinSystem = useCoinSystem();
  const currentLevel = useCurrentLevel();

  const handleHatch = async (egg: EggType) => {
    if (hatching) return;
    if (!canAfford(egg.coinPrice)) {
      toast.error('Not enough coins!');
      return;
    }

    setHatching(true);
    try {
      const spent = await coinSystem.spendCoins(egg.coinPrice, 'shop_purchase');
      if (!spent) {
        toast.error('Purchase failed!');
        return;
      }
      const pet = hatchEgg(egg, currentLevel);
      placePendingPet();
      playSoundEffect('purchase');
      toast.success(`Hatched a ${pet.rarity} ${pet.petId}!`, {
        description: 'Check your island to see your new pet!',
      });
    } catch {
      toast.error('Something went wrong');
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
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <Target className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="font-bold text-sm text-[hsl(var(--foreground))]">Species Selector</span>
        </div>
        <p className="text-[11px] text-[hsl(var(--muted-foreground))] mb-2">
          Pick your next pet instead of leaving it to chance.
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
                ? 'bg-[hsl(var(--primary))] text-white active:scale-95'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed',
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
      'rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col overflow-hidden shadow-sm',
      egg.rarity === 'legendary' && 'ring-1 ring-amber-300',
    )}>
      {/* Rarity stripe header */}
      <div className={cn('h-1', RARITY_STRIPE[egg.rarity])} />
      <div className="p-3 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <PixelIcon name={EGG_ICON_MAP[egg.id] || 'egg'} size={18} />
          <span className={cn('font-bold text-xs', RARITY_COLORS[egg.rarity])}>
            {egg.name}
          </span>
        </div>

        {/* Rarity odds */}
        <div className="space-y-0.5 mb-2.5">
          {RARITY_LABELS.map((rarity) => {
            const weight = egg.rarityWeights[rarity];
            if (weight === 0) return null;
            return (
              <div key={rarity} className="flex items-center justify-between">
                <span className={cn('text-[10px] capitalize', RARITY_COLORS[rarity])}>
                  {rarity}
                </span>
                <span className="text-[10px] font-mono font-bold text-[hsl(var(--muted-foreground))]">
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
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all',
              canAfford && !hatching
                ? 'bg-[hsl(var(--primary))] text-white active:scale-95'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed',
            )}
          >
            {hatching ? '...' : 'Hatch!'}
          </button>
        </div>
      </div>
    </div>
  );
}
