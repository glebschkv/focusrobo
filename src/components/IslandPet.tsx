/**
 * IslandPet Component
 *
 * Renders a single pet absolutely positioned on the isometric diamond island.
 * Includes depth-based scaling, rarity glow effects, idle bobbing, and tooltips.
 */

import { memo, useEffect, useState } from 'react';
import { getPetById, GROWTH_SCALES, RARITY_COLORS } from '@/data/PetDatabase';
import { ISLAND_POSITIONS, getDepthScale, getDepthZIndex } from '@/data/islandPositions';
import { useHaptics } from '@/hooks/useHaptics';
import type { LandCell } from '@/stores/landStore';

interface IslandPetProps {
  cell: LandCell;
  index: number;
  isNew?: boolean;
  isDevotion?: boolean;
  showTooltip: boolean;
  onToggleTooltip: () => void;
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

export const IslandPet = memo(({ cell, index, isNew, isDevotion, showTooltip, onToggleTooltip }: IslandPetProps) => {
  const [imageError, setImageError] = useState(false);
  const { haptic } = useHaptics();

  const species = getPetById(cell.petId);
  if (!species) return null;

  const pos = ISLAND_POSITIONS[index];
  if (!pos) return null;

  const growthScale = GROWTH_SCALES[cell.size];
  const depthScale = getDepthScale(index);
  const finalScale = growthScale * depthScale;
  const zIndex = getDepthZIndex(index);
  const rarityColor = RARITY_COLORS[cell.rarity];

  const bobDelay = ((index % 11) * 0.27).toFixed(1);
  // Per-pet bob variation: -0.5px, 0px, or +0.5px offset
  const bobOffset = ((index % 3) - 1) * 0.5;

  // Apply rarity glow class for uncommon+
  const rarityClass =
    cell.rarity !== 'common'
      ? `island-pet--${cell.rarity}`
      : '';

  // Flip tooltip below for pets near top of island
  const tooltipBelow = pos.y < 30;

  // Horizontal tooltip offset for edge pets
  const tooltipShiftClass =
    pos.x < 20 ? 'island-pet__tooltip--shift-right' :
    pos.x > 80 ? 'island-pet__tooltip--shift-left' : '';

  // Trigger haptic feedback for newly placed pet
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isNew) {
      haptic('medium');
    }
  }, [isNew, haptic]);

  // Show fallback placeholder for failed pet images
  if (imageError) {
    return (
      <div
        className={`island-pet ${isNew ? 'island-pet--new' : ''}`}
        style={
          {
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            zIndex,
            '--pet-scale': finalScale,
          } as React.CSSProperties
        }
      >
        <div className="island-pet__fallback">?</div>
        <div className="island-pet__shadow" />
      </div>
    );
  }

  return (
    <div
      className={`island-pet ${rarityClass} ${isNew ? 'island-pet--new' : ''}`}
      style={
        {
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          zIndex,
          '--pet-scale': finalScale,
          '--bob-delay': `${bobDelay}s`,
          '--bob-offset': `${bobOffset}px`,
        } as React.CSSProperties
      }
      onClick={(e) => {
        e.stopPropagation();
        haptic('selection');
        onToggleTooltip();
      }}
    >
      <img
        src={species.imagePath}
        alt={species.name}
        className="island-pet__sprite"
        draggable={false}
        loading="lazy"
        onError={() => setImageError(true)}
      />

      {/* Pet shadow on ground */}
      <div className="island-pet__shadow" />

      {/* Legendary shimmer */}
      {cell.rarity === 'legendary' && <div className="island-pet__shimmer" />}

      {/* Devoted species sparkle */}
      {isDevotion && <div className="island-pet__devotion-sparkle" />}

      {/* Tooltip on tap */}
      {showTooltip && (
        <div
          className={`island-pet__tooltip ${tooltipBelow ? 'island-pet__tooltip--below' : ''} ${tooltipShiftClass}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTooltip();
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
            {SIZE_LABELS[cell.size]} · {cell.sessionMinutes}min
          </span>
        </div>
      )}
    </div>
  );
});

IslandPet.displayName = 'IslandPet';
