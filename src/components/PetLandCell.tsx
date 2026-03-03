/**
 * PetLandCell Component
 *
 * Renders a single cell in the 10×10 pet land grid.
 * If a pet is placed in this cell, renders the pet image at
 * the appropriate scale (baby/adolescent/adult).
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
  adolescent: 'Adolescent',
  adult: 'Adult',
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

  const imageStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    filter: glowColor ? `drop-shadow(0 0 4px ${glowColor})` : undefined,
    transition: 'transform 0.3s ease',
  };

  return (
    <div
      className={`pet-land-cell pet-land-cell--filled ${isNew ? 'pet-land-cell--new' : ''}`}
      data-index={index}
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
          <span className="pet-land-cell__tooltip-detail">
            {SIZE_LABELS[cell.size]} · {cell.sessionMinutes}min
          </span>
        </div>
      )}
    </div>
  );
});

PetLandCell.displayName = 'PetLandCell';
