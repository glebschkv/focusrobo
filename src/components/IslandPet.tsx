/**
 * IslandPet Component
 *
 * Renders a single pet absolutely positioned on the isometric diamond island.
 * Includes depth-based scaling, rarity glow effects, idle bobbing, and tooltips.
 *
 * Performance: uses memo() with a STABLE callback prop (onToggleTooltip receives
 * the index as an argument, so the callback reference never changes). This ensures
 * only pets whose props actually changed re-render — not all 100+ on every click.
 */

import { memo, useEffect, useState, useCallback } from 'react';
import { getPetById, GROWTH_SCALES, RARITY_COLORS } from '@/data/PetDatabase';
import { getIslandPosition, getDepthScale, getDepthZIndex } from '@/data/islandPositions';
import { useHaptics } from '@/hooks/useHaptics';
import { useLandStore } from '@/stores/landStore';
import type { LandCell } from '@/stores/landStore';

/** Build the sprite path, trying growth-specific first (e.g. polar-bear-baby.png) */
function getSpritePath(petId: string, size: string, basePath: string): { primary: string; fallback: string } {
  const dir = basePath.substring(0, basePath.lastIndexOf('/'));
  const primary = `${dir}/${petId}-${size}.png`;
  return { primary, fallback: basePath };
}

interface IslandPetProps {
  cell: LandCell;
  index: number;
  gridSize: number;
  isNew?: boolean;
  showTooltip: boolean;
  /** Stable callback — pet passes its own index */
  onToggleTooltip: (index: number) => void;
}

const SIZE_LABELS: Record<string, string> = {
  baby: 'Baby',
  adolescent: 'Teen',
  adult: 'Adult',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const IslandPet = memo(({ cell, index, gridSize, isNew, showTooltip, onToggleTooltip }: IslandPetProps) => {
  const [imageError, setImageError] = useState(false);
  const [useGrowthSprite, setUseGrowthSprite] = useState(true);
  const { haptic } = useHaptics();
  const isDev = useLandStore((s) => (s.speciesAffinity[cell.petId] || 0) >= 10);

  useEffect(() => {
    if (isNew) haptic('medium');
  }, [isNew, haptic]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('selection');
    onToggleTooltip(index);
  }, [haptic, onToggleTooltip, index]);

  const species = getPetById(cell.petId);
  if (!species) return null;

  const { primary: growthPath, fallback: basePath } = getSpritePath(cell.petId, cell.size, species.imagePath);
  const spriteSrc = useGrowthSprite ? growthPath : basePath;

  const pos = getIslandPosition(index, gridSize);
  if (!pos) return null;

  const growthScale = GROWTH_SCALES[cell.size];
  const depthScale = getDepthScale(index);
  const finalScale = growthScale * depthScale;
  const zIndex = getDepthZIndex(index);
  const rarityColor = RARITY_COLORS[cell.rarity];

  const bobDelay = ((index % 11) * 0.27).toFixed(1);
  const bobOffset = ((index % 3) - 1) * 0.5;

  const rarityClass =
    cell.rarity !== 'common'
      ? `island-pet--${cell.rarity}`
      : '';

  const tooltipBelow = pos.y < 30;

  const tooltipShiftClass =
    pos.x < 20 ? 'island-pet__tooltip--shift-right' :
    pos.x > 80 ? 'island-pet__tooltip--shift-left' : '';

  if (imageError) {
    return (
      <div
        className={`island-pet ${isNew ? 'island-pet--new' : ''}`}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          zIndex,
          '--pet-scale': finalScale,
        } as React.CSSProperties}
      >
        <div className="island-pet__fallback">?</div>
      </div>
    );
  }

  return (
    <div
      className={`island-pet ${rarityClass} ${isNew ? 'island-pet--new' : ''} ${isDev ? 'island-pet--devoted' : ''}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex,
        '--pet-scale': finalScale,
        '--bob-delay': `${bobDelay}s`,
        '--bob-offset': `${bobOffset}px`,
      } as React.CSSProperties}
      onClick={handleClick}
    >
      <img
        src={spriteSrc}
        alt={species.name}
        className="island-pet__sprite"
        draggable={false}
        loading="lazy"
        onError={() => {
          if (useGrowthSprite) {
            setUseGrowthSprite(false);
          } else {
            setImageError(true);
          }
        }}
      />

      {/* Legendary shimmer */}
      {cell.rarity === 'legendary' && <div className="island-pet__shimmer" />}

      {/* Tooltip on tap */}
      {showTooltip && (
        <div
          className={`island-pet__tooltip ${tooltipBelow ? 'island-pet__tooltip--below' : ''} ${tooltipShiftClass}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTooltip(index);
          }}
        >
          <span className="island-pet__tooltip-name">{species.name}</span>
          <span
            className="island-pet__tooltip-rarity"
            style={{
              background: `${rarityColor.tooltip}22`,
              color: rarityColor.tooltip,
            }}
          >
            {RARITY_LABELS[cell.rarity]}
          </span>
          <span className="island-pet__tooltip-detail">
            {SIZE_LABELS[cell.size]}{cell.sessionMinutes > 0 ? ` · ${cell.sessionMinutes}min` : ' · Hatched'}
          </span>
        </div>
      )}
    </div>
  );
});

IslandPet.displayName = 'IslandPet';
