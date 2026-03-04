/**
 * IslandPet Component
 *
 * Renders a single pet absolutely positioned on the floating island surface.
 * Includes depth-based scaling, rarity glow effects, idle bobbing, and tooltips.
 */

import { memo, useEffect, useState } from 'react';
import { getPetById, GROWTH_SCALES, RARITY_COLORS } from '@/data/PetDatabase';
import { ISLAND_POSITIONS, getDepthScale, getDepthZIndex, getDepthScaleForRotation, getDepthZIndexForRotation } from '@/data/islandPositions';
import type { RotationStep } from '@/data/islandPositions';
import { useHaptics } from '@/hooks/useHaptics';
import type { LandCell } from '@/stores/landStore';

interface IslandPetProps {
  cell: LandCell;
  index: number;
  isNew?: boolean;
  showTooltip: boolean;
  onToggleTooltip: () => void;
  rotationStep?: RotationStep;
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

export const IslandPet = memo(({ cell, index, isNew, showTooltip, onToggleTooltip, rotationStep = 0 }: IslandPetProps) => {
  const [imageError, setImageError] = useState(false);
  const { haptic } = useHaptics();

  const species = getPetById(cell.petId);
  if (!species) return null;

  const pos = ISLAND_POSITIONS[index];
  if (!pos) return null;

  if (imageError) return null;

  const growthScale = GROWTH_SCALES[cell.size];
  const depthScale = getDepthScaleForRotation(index, rotationStep);
  const finalScale = growthScale * depthScale;
  const zIndex = getDepthZIndexForRotation(index, rotationStep);
  const rarityColor = RARITY_COLORS[cell.rarity];

  const bobDelay = ((index % 7) * 0.4).toFixed(1);

  // Apply rarity glow class for uncommon+
  const rarityClass =
    cell.rarity !== 'common'
      ? `island-pet--${cell.rarity}`
      : '';

  // Flip tooltip below for pets near top of island
  const tooltipBelow = pos.y < 30;

  // Trigger haptic feedback for newly placed pet
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isNew) {
      haptic('light');
    }
  }, [isNew, haptic]);

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
        } as React.CSSProperties
      }
      onClick={(e) => {
        e.stopPropagation();
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

      {/* Tooltip on tap */}
      {showTooltip && (
        <div
          className={`island-pet__tooltip ${tooltipBelow ? 'island-pet__tooltip--below' : ''}`}
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
