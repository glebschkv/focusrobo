/**
 * IslandPet Component
 *
 * Renders a single pet absolutely positioned on the floating island surface.
 * Includes depth-based scaling, rarity glow effects, idle bobbing, and tooltips.
 */

import { memo, useState } from 'react';
import { getPetById, GROWTH_SCALES, RARITY_GLOW } from '@/data/PetDatabase';
import { ISLAND_POSITIONS, getDepthScale, getDepthZIndex } from '@/data/islandPositions';
import type { LandCell } from '@/stores/landStore';

interface IslandPetProps {
  cell: LandCell;
  index: number;
  isNew?: boolean;
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

const RARITY_TOOLTIP_COLORS: Record<string, string> = {
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

export const IslandPet = memo(({ cell, index, isNew }: IslandPetProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const species = getPetById(cell.petId);
  if (!species) return null;

  const pos = ISLAND_POSITIONS[index];
  if (!pos) return null;

  const growthScale = GROWTH_SCALES[cell.size];
  const depthScale = getDepthScale(index);
  const finalScale = growthScale * depthScale;
  const zIndex = getDepthZIndex(index);
  const glowColor = RARITY_GLOW[cell.rarity];

  const bobDelay = ((index % 7) * 0.4).toFixed(1);

  const rarityClass =
    cell.rarity === 'rare' || cell.rarity === 'epic' || cell.rarity === 'legendary'
      ? `island-pet--${cell.rarity}`
      : '';

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
      onClick={() => setShowTooltip((prev) => !prev)}
    >
      <img
        src={species.imagePath}
        alt={species.name}
        className="island-pet__sprite"
        style={{
          filter: glowColor ? `drop-shadow(0 0 3px ${glowColor})` : undefined,
        }}
        draggable={false}
        loading="lazy"
      />

      {/* Pet shadow on ground */}
      <div className="island-pet__shadow" />

      {/* Legendary shimmer */}
      {cell.rarity === 'legendary' && <div className="island-pet__shimmer" />}

      {/* Tooltip on tap */}
      {showTooltip && (
        <div
          className="island-pet__tooltip"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(false);
          }}
        >
          <span className="island-pet__tooltip-name">{species.name}</span>
          <span
            className="island-pet__tooltip-rarity"
            style={{
              background: `${RARITY_TOOLTIP_COLORS[cell.rarity]}22`,
              color: RARITY_TOOLTIP_COLORS[cell.rarity],
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
