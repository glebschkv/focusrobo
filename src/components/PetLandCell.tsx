/**
 * PetLandCell Component
 *
 * Renders a single cell in the 10×10 pet land grid.
 * If a pet is placed in this cell, renders the pet image at
 * the appropriate scale (baby/adolescent/adult) with rarity effects.
 */

import { memo, useState } from 'react';
import { getPetById, GROWTH_SCALES, RARITY_GLOW } from '@/data/PetDatabase';
import type { LandCell } from '@/stores/landStore';

interface PetLandCellProps {
  cell: LandCell | null;
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

export const PetLandCell = memo(({ cell, index, isNew }: PetLandCellProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!cell) {
    return (
      <div
        className="pet-land-cell pet-land-cell--empty"
        data-index={index}
      />
    );
  }

  const species = getPetById(cell.petId);
  if (!species) return <div className="pet-land-cell" />;

  const scale = GROWTH_SCALES[cell.size];
  const glowColor = RARITY_GLOW[cell.rarity];

  // Stagger the idle bobbing animation based on cell position
  const bobDelay = ((index % 7) * 0.4).toFixed(1);

  // Rarity CSS class for cell glow
  const rarityClass = (cell.rarity === 'rare' || cell.rarity === 'epic' || cell.rarity === 'legendary')
    ? `pet-land-cell--rarity-${cell.rarity}`
    : '';

  const imageStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    filter: glowColor ? `drop-shadow(0 0 3px ${glowColor})` : undefined,
    transition: 'transform 0.3s ease',
  };

  return (
    <div
      className={`pet-land-cell pet-land-cell--filled ${rarityClass} ${isNew ? 'pet-land-cell--new' : ''}`}
      data-index={index}
      style={{ '--bob-delay': `${bobDelay}s` } as React.CSSProperties}
      onClick={() => setShowTooltip(prev => !prev)}
    >
      <img
        src={species.imagePath}
        alt={species.name}
        className="pet-land-cell__image"
        style={imageStyle}
        draggable={false}
        loading="lazy"
      />

      {/* Legendary shimmer */}
      {cell.rarity === 'legendary' && (
        <div className="pet-land-cell__shimmer" />
      )}

      {/* Tooltip on tap */}
      {showTooltip && (
        <div
          className="pet-land-cell__tooltip"
          onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
        >
          <span className="pet-land-cell__tooltip-name">{species.name}</span>
          <span
            className="pet-land-cell__tooltip-rarity"
            style={{
              background: `${RARITY_TOOLTIP_COLORS[cell.rarity]}22`,
              color: RARITY_TOOLTIP_COLORS[cell.rarity],
            }}
          >
            {RARITY_LABELS[cell.rarity]}
          </span>
          <span className="pet-land-cell__tooltip-detail">
            {SIZE_LABELS[cell.size]} · {cell.sessionMinutes}min
          </span>
        </div>
      )}
    </div>
  );
});

PetLandCell.displayName = 'PetLandCell';
