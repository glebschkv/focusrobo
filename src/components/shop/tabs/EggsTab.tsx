/**
 * EggsTab — "The Hatchery"
 * Eggs displayed as cozy nests with visual rarity meters.
 * Framed as discovering new friends, not buying products.
 */

import { useState } from 'react';
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
import { SpeciesSelectorModal } from '../SpeciesSelectorModal';

import { RARITY_DOT_COLORS, RARITY_CARD_CLASS, RARITY_STRIP_COLORS } from '../styles';

const EGG_ICON_MAP: Record<string, string> = {
  'egg-common': 'egg',
  'egg-rare': 'egg-rare',
  'egg-epic': 'egg-epic',
  'egg-legendary': 'egg-legendary',
};

const RARITY_ORDER: PetRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

interface EggsTabProps {
  coinBalance: number;
  canAfford: (price: number) => boolean;
}

export const EggsTab = ({ coinBalance, canAfford }: EggsTabProps) => {
  const [hatching, setHatching] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const hatchEgg = useLandStore((s) => s.hatchEgg);
  const selectSpecies = useLandStore((s) => s.selectSpecies);
  const placePendingPet = useLandStore((s) => s.placePendingPet);
  const speciesCatalog = useLandStore((s) => s.speciesCatalog);
  const coinSystem = useCoinSystem();
  const currentLevel = useCurrentLevel();

  const handleSelectSpecies = async (speciesId: string) => {
    if (!canAfford(SPECIES_SELECTOR_PRICE)) {
      toast.error('Not enough coins!');
      return;
    }
    const spent = await coinSystem.spendCoins(SPECIES_SELECTOR_PRICE, 'shop_purchase');
    if (!spent) {
      toast.error('Purchase failed!');
      return;
    }
    const pet = selectSpecies(speciesId);
    if (pet) {
      placePendingPet();
      playSoundEffect('purchase');
      toast.success(`${pet.petId} has answered your wish!`, {
        description: 'A new friend has arrived on your island!',
      });
    }
    setSelectorOpen(false);
  };

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
        description: 'A new friend has arrived on your island!',
      });
    } catch {
      toast.error('Something went wrong');
    } finally {
      setHatching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section intro */}
      <p className="text-xs font-medium px-1" style={{ color: '#8B6F47' }}>
        Choose an egg to discover a new companion for your island.
      </p>

      {/* Nest cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {EGG_TYPES.map((egg, index) => (
          <NestCard
            key={egg.id}
            egg={egg}
            index={index}
            canAfford={canAfford(egg.coinPrice)}
            onHatch={() => handleHatch(egg)}
            hatching={hatching}
          />
        ))}
      </div>

      {/* Wishing Well — Species Selector */}
      <div className="wishing-well-card">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="potion-icon-frame" style={{ borderColor: '#B8A8D4', background: 'linear-gradient(180deg, #F8F4FD 0%, #F0EAFA 100%)' }}>
            <PixelIcon name="target" size={18} />
          </div>
          <div>
            <span className="font-bold text-sm" style={{ color: '#5C3D1A' }}>Wishing Well</span>
            <p className="text-[11px]" style={{ color: '#8B6F47' }}>
              Choose from species you've already discovered.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <PixelIcon name="coin" size={14} />
            <span className="font-black text-sm" style={{ color: '#7A5C20' }}>{SPECIES_SELECTOR_PRICE.toLocaleString()}</span>
          </div>
          <button
            className={cn(
              'hatch-button',
              canAfford(SPECIES_SELECTOR_PRICE) ? 'affordable' : 'disabled',
            )}
            disabled={!canAfford(SPECIES_SELECTOR_PRICE)}
            onClick={() => setSelectorOpen(true)}
          >
            Make a Wish
          </button>
        </div>
      </div>

      {/* Species Selector Modal */}
      <SpeciesSelectorModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelectSpecies}
        speciesCatalog={speciesCatalog}
      />
    </div>
  );
};

function NestCard({
  egg,
  index,
  canAfford,
  onHatch,
  hatching,
}: {
  egg: EggType;
  index: number;
  canAfford: boolean;
  onHatch: () => void;
  hatching: boolean;
}) {
  return (
    <div className={cn(
      'egg-nest-card',
      RARITY_CARD_CLASS[egg.rarity],
    )}>
      {/* Rarity accent strip */}
      <div className={cn('egg-rarity-strip', RARITY_STRIP_COLORS[egg.rarity])} />

      {/* Egg display area */}
      <div className="egg-icon-area">
        <div className="egg-wobble" style={{ animationDelay: `${index * 0.6}s` }}>
          <PixelIcon name={EGG_ICON_MAP[egg.id] || 'egg'} size={36} />
        </div>
        {/* Sparkle effects for epic/legendary */}
        {(egg.rarity === 'legendary' || egg.rarity === 'epic') && (
          <>
            <span className="shop-sparkle" />
            <span className="shop-sparkle" />
            <span className="shop-sparkle" />
          </>
        )}
      </div>

      <div className="px-3 pb-3">
        {/* Name */}
        <div className="text-center mb-2">
          <span className="font-bold text-xs" style={{ color: RARITY_DOT_COLORS[egg.rarity] }}>
            {egg.name}
          </span>
        </div>

        {/* Visual rarity meter */}
        <div className="space-y-1 mb-3">
          {RARITY_ORDER.map((rarity) => {
            const weight = egg.rarityWeights[rarity];
            if (weight === 0) return null;
            return (
              <div key={rarity} className="flex items-center gap-2">
                <div
                  className="rarity-dot filled"
                  style={{ backgroundColor: RARITY_DOT_COLORS[rarity], color: RARITY_DOT_COLORS[rarity] }}
                />
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#E8E0D0' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${weight}%`,
                      backgroundColor: RARITY_DOT_COLORS[rarity],
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold tabular-nums w-7 text-right" style={{ color: '#A0937E' }}>
                  {weight}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Price + hatch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <PixelIcon name="coin" size={13} />
            <span className="font-black text-xs" style={{ color: '#7A5C20' }}>
              {egg.coinPrice.toLocaleString()}
            </span>
          </div>
          <button
            onClick={onHatch}
            disabled={!canAfford || hatching}
            className={cn(
              'hatch-button text-[11px]',
              canAfford && !hatching ? 'affordable' : 'disabled',
            )}
          >
            {hatching ? '...' : 'Hatch'}
          </button>
        </div>
      </div>
    </div>
  );
}
