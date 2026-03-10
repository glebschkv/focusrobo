/**
 * DecorTab — Shop tab for purchasing island decorations.
 *
 * Shows decorations grouped by category. Players can buy decorations with
 * coins and place them on their island via the decoration edit mode.
 */

import { useState } from 'react';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { cn } from '@/lib/utils';
import { DECORATIONS, getDecorationsByCategory, type DecorationCategory, type DecorationDef } from '@/data/DecorationData';
import { useLandStore } from '@/stores/landStore';
import { useCoinStore } from '@/stores/coinStore';
import { useXPStore } from '@/stores/xpStore';
import { toast } from 'sonner';
import { playSoundEffect } from '@/hooks/useSoundEffects';

const CATEGORY_LABELS: Record<DecorationCategory, { label: string; icon: string }> = {
  trees: { label: 'Trees', icon: 'tree' },
  flowers: { label: 'Flowers', icon: 'flower' },
  rocks: { label: 'Rocks', icon: 'gem' },
  water: { label: 'Water', icon: 'droplet' },
  structures: { label: 'Builds', icon: 'castle' },
  fun: { label: 'Fun', icon: 'star' },
};

const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  uncommon: '#4ADE80',
  rare: '#3B82F6',
  epic: '#A855F7',
};

interface DecorTabProps {
  coinBalance: number;
  canAfford: (price: number) => boolean;
}

export const DecorTab = ({ coinBalance, canAfford }: DecorTabProps) => {
  const [activeCategory, setActiveCategory] = useState<DecorationCategory | 'all'>('all');
  const addDecoration = useLandStore((s) => s.addDecorationToInventory);
  const decorationInventory = useLandStore((s) => s.decorationInventory);
  const playerLevel = useXPStore((s) => s.currentLevel);

  const grouped = getDecorationsByCategory();
  const categories = Object.keys(grouped) as DecorationCategory[];

  const filteredDecorations = activeCategory === 'all'
    ? DECORATIONS
    : grouped[activeCategory] || [];

  const handleBuy = (decoration: DecorationDef) => {
    if (!canAfford(decoration.coinPrice)) {
      toast.error('Not enough coins!');
      return;
    }
    if (playerLevel < decoration.unlockLevel) {
      toast.error(`Unlock at level ${decoration.unlockLevel}`);
      return;
    }

    // Spend coins via the coin store
    const success = useCoinStore.getState().spendCoins(decoration.coinPrice);
    if (!success) {
      toast.error('Not enough coins!');
      return;
    }

    addDecoration(decoration.id);
    playSoundEffect('purchase');
    toast.success(`${decoration.name} added to inventory!`);
  };

  return (
    <div className="decor-tab">
      {/* Category filter pills */}
      <div className="decor-tab__filters">
        <button
          className={cn('decor-tab__filter-pill', activeCategory === 'all' && 'active')}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => {
          const { label, icon } = CATEGORY_LABELS[cat];
          return (
            <button
              key={cat}
              className={cn('decor-tab__filter-pill', activeCategory === cat && 'active')}
              onClick={() => setActiveCategory(cat)}
            >
              <PixelIcon name={icon} size={12} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Decoration grid */}
      <div className="decor-tab__grid">
        {filteredDecorations.map((deco) => {
          const isLocked = playerLevel < deco.unlockLevel;
          const affordable = canAfford(deco.coinPrice);
          const ownedQty = decorationInventory[deco.id] || 0;

          return (
            <div
              key={deco.id}
              className={cn(
                'decor-tab__card',
                isLocked && 'decor-tab__card--locked',
                !affordable && !isLocked && 'decor-tab__card--expensive',
              )}
            >
              <div className="decor-tab__card-preview">
                <img
                  src={deco.sprite}
                  alt={deco.name}
                  className="decor-tab__card-sprite"
                  draggable={false}
                  style={{ imageRendering: 'pixelated' }}
                />
                {isLocked && (
                  <div className="decor-tab__card-lock">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C9.24 2 7 4.24 7 7v3H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z" />
                    </svg>
                    <span>Lv.{deco.unlockLevel}</span>
                  </div>
                )}
                {ownedQty > 0 && (
                  <span className="decor-tab__card-owned">×{ownedQty}</span>
                )}
              </div>

              <div className="decor-tab__card-info">
                <span className="decor-tab__card-name">{deco.name}</span>
                <div className="decor-tab__card-meta">
                  <span
                    className="decor-tab__card-rarity"
                    style={{ color: RARITY_COLORS[deco.rarity] }}
                  >
                    {deco.rarity}
                  </span>
                </div>
              </div>

              <button
                className="decor-tab__card-buy"
                onClick={() => handleBuy(deco)}
                disabled={isLocked || !affordable}
              >
                <PixelIcon name="coin" size={12} />
                <span>{deco.coinPrice}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
