/**
 * EggsTab — "The Hatchery"
 * Eggs displayed as cozy nests with visual rarity meters.
 * Framed as discovering new friends, not buying products.
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { EGG_TYPES, SPECIES_SELECTOR_DISCOVERED_PRICE, SPECIES_SELECTOR_UNDISCOVERED_PRICE } from '@/data/EggData';
import type { EggType } from '@/data/EggData';
import type { PetRarity } from '@/data/PetDatabase';
import { useLandStore } from '@/stores/landStore';
import type { PendingPet } from '@/stores/landStore';
import { useCoinSystem } from '@/hooks/useCoinSystem';
import { useCurrentLevel, useCurrentXP, calculateLevelFromXP } from '@/stores/xpStore';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { getEggDiscountedPrice } from '@/hooks/useShop';
import { toast } from 'sonner';
import { playSoundEffect } from '@/hooks/useSoundEffects';
import { useShopStore } from '@/stores/shopStore';
import { SpeciesSelectorModal } from '../SpeciesSelectorModal';
import { EggHatchAnimation } from '../EggHatchAnimation';

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
  const [hatchResult, setHatchResult] = useState<{ eggRarity: string; pet: PendingPet } | null>(null);
  const hatchEgg = useLandStore((s) => s.hatchEgg);
  const selectSpecies = useLandStore((s) => s.selectSpecies);
  const placePendingPet = useLandStore((s) => s.placePendingPet);
  const speciesCatalog = useLandStore((s) => s.speciesCatalog);
  const coinSystem = useCoinSystem();
  const storedLevel = useCurrentLevel();
  const currentXP = useCurrentXP();
  // Defensive: if stored level is 0 but XP suggests otherwise (rehydration timing),
  // recalculate to ensure wishing well and egg hatching use the correct level.
  const currentLevel = storedLevel === 0 && currentXP > 0
    ? calculateLevelFromXP(currentXP)
    : storedLevel;
  const { getEggDiscountPercent, isPremium } = usePremiumStatus();
  const discountPercent = getEggDiscountPercent();
  const starterEggPurchased = useShopStore((s) => s.starterEggPurchased);
  const setStarterEggPurchased = useShopStore((s) => s.setStarterEggPurchased);

  const handleSelectSpecies = async (speciesId: string, isDiscovered: boolean) => {
    const price = isDiscovered ? SPECIES_SELECTOR_DISCOVERED_PRICE : SPECIES_SELECTOR_UNDISCOVERED_PRICE;
    if (!canAfford(price)) {
      toast.error('Not enough coins!');
      return;
    }
    const spent = await coinSystem.spendCoins(price, 'shop_purchase');
    if (!spent) {
      toast.error('Purchase failed!');
      return;
    }
    const pet = selectSpecies(speciesId);
    if (pet) {
      placePendingPet();
      playSoundEffect('purchase');
      toast.success(`${pet.petId} has answered your wish!`, {
        description: isDiscovered
          ? 'A familiar friend has arrived on your island!'
          : 'A brand new species has arrived on your island!',
      });
    }
    setSelectorOpen(false);
  };

  const handleHatch = async (egg: EggType) => {
    if (hatching) return;
    const effectivePrice = getEggDiscountedPrice(egg.coinPrice, discountPercent);
    if (!canAfford(effectivePrice)) {
      toast.error('Not enough coins!');
      return;
    }

    setHatching(true);
    try {
      const spent = await coinSystem.spendCoins(effectivePrice, 'shop_purchase');
      if (!spent) {
        toast.error('Purchase failed!');
        setHatching(false);
        return;
      }
      const pet = hatchEgg(egg, currentLevel);
      placePendingPet();
      playSoundEffect('purchase');
      if (egg.id === 'egg-starter') {
        setStarterEggPurchased();
      }
      // Show hatch animation instead of toast
      setHatchResult({ eggRarity: egg.rarity, pet });
    } catch {
      toast.error('Something went wrong');
      setHatching(false);
    }
  };

  const handleHatchClose = () => {
    setHatchResult(null);
    setHatching(false);
  };

  return (
    <div className="space-y-4">
      {/* Section intro */}
      <div className="px-1 space-y-1">
        <p className="text-xs font-medium" style={{ color: '#8B6F47' }}>
          Choose an egg to discover a new companion for your island.
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: '#A0937E' }}>
          Hatch an egg to unlock a random pet and place it on your island. Rarer eggs cost more coins but give better odds of discovering rare species!
        </p>
      </div>

      {/* Nest cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {EGG_TYPES.map((egg, index) => {
          const isStarter = egg.id === 'egg-starter';
          const isClaimed = isStarter && starterEggPurchased;
          const effectivePrice = getEggDiscountedPrice(egg.coinPrice, discountPercent);
          return (
            <NestCard
              key={egg.id}
              egg={egg}
              index={index}
              canAfford={canAfford(effectivePrice) && !isClaimed}
              onHatch={() => handleHatch(egg)}
              hatching={hatching}
              discountPercent={discountPercent}
              effectivePrice={effectivePrice}
              isStarter={isStarter}
              isClaimed={isClaimed}
            />
          );
        })}
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
              Pick any unlocked species — discovered or new!
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <PixelIcon name="coin" size={14} />
            <span className="font-black text-sm" style={{ color: '#7A5C20' }}>
              {SPECIES_SELECTOR_DISCOVERED_PRICE.toLocaleString()}
              <span className="text-[10px] font-medium" style={{ color: '#A0937E' }}> – {SPECIES_SELECTOR_UNDISCOVERED_PRICE.toLocaleString()}</span>
            </span>
          </div>
          <button
            className={cn(
              'hatch-button',
              canAfford(SPECIES_SELECTOR_DISCOVERED_PRICE) ? 'affordable' : 'disabled',
            )}
            disabled={!canAfford(SPECIES_SELECTOR_DISCOVERED_PRICE)}
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
        playerLevel={currentLevel}
      />

      {/* Egg Hatch Animation */}
      {hatchResult && (
        <EggHatchAnimation
          isOpen={true}
          onClose={handleHatchClose}
          eggRarity={hatchResult.eggRarity}
          result={hatchResult.pet}
        />
      )}
    </div>
  );
};

function NestCard({
  egg,
  index,
  canAfford,
  onHatch,
  hatching,
  discountPercent,
  effectivePrice,
  isStarter = false,
  isClaimed = false,
}: {
  egg: EggType;
  index: number;
  canAfford: boolean;
  onHatch: () => void;
  hatching: boolean;
  discountPercent: number;
  effectivePrice: number;
  isStarter?: boolean;
  isClaimed?: boolean;
}) {
  return (
    <div className={cn(
      'egg-nest-card flex flex-col',
      RARITY_CARD_CLASS[egg.rarity],
      isClaimed && 'opacity-60',
    )}>
      {/* Rarity accent strip */}
      <div className={cn('egg-rarity-strip', RARITY_STRIP_COLORS[egg.rarity])} />

      {/* Starter / Claimed badge */}
      {isStarter && (
        <div className="absolute top-1.5 right-1.5 z-10">
          {isClaimed ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: '#6B9E58' }}>
              Hatched
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #D4A84E, #C87941)' }}>
              First Egg!
            </span>
          )}
        </div>
      )}

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

      <div className="px-3 pb-3 flex flex-col flex-1">
        {/* Name */}
        <div className="text-center mb-2">
          <span className="font-bold text-xs" style={{ color: RARITY_DOT_COLORS[egg.rarity] }}>
            {egg.name}
          </span>
        </div>

        {/* Visual rarity meter */}
        <div className="space-y-1 mb-3 flex-1">
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

        {/* Premium discount badge */}
        {discountPercent > 0 && (
          <div className="mb-2 text-center">
            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: 'linear-gradient(135deg, #D4A84E, #C87941)' }}>
              Premium -{discountPercent}%
            </span>
          </div>
        )}

        {/* Price + hatch */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1">
            <PixelIcon name="coin" size={13} />
            {discountPercent > 0 ? (
              <>
                <span className="text-[10px] line-through" style={{ color: '#A0937E' }}>
                  {egg.coinPrice.toLocaleString()}
                </span>
                <span className="font-black text-xs" style={{ color: '#6B9E58' }}>
                  {effectivePrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="font-black text-xs" style={{ color: '#7A5C20' }}>
                {egg.coinPrice.toLocaleString()}
              </span>
            )}
          </div>
          <button
            onClick={onHatch}
            disabled={!canAfford || hatching || isClaimed}
            className={cn(
              'hatch-button text-[11px]',
              canAfford && !hatching && !isClaimed ? 'affordable' : 'disabled',
            )}
          >
            {isClaimed ? 'Claimed' : hatching ? '...' : 'Hatch'}
          </button>
        </div>
      </div>
    </div>
  );
}
