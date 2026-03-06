/**
 * PetTooltip — Compact floating card shown when tapping a pet on the island.
 * Shows pet sprite, name, rarity badge, and size. Tap outside to dismiss.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getPetById, RARITY_COLORS } from '@/data/PetDatabase';
import { getIslandPosition } from '@/data/islandPositions';
import { useHaptics } from '@/hooks/useHaptics';
import type { LandCell } from '@/stores/landStore';
import {
  SIZE_LABEL,
  RARITY_LABEL,
  RARITY_STARS,
} from '@/components/collection/constants';

interface PetTooltipProps {
  cell: LandCell;
  index: number;
  gridSize: number;
  onClose: () => void;
}

function getSpritePath(petId: string, size: string, basePath: string): string {
  const dir = basePath.substring(0, basePath.lastIndexOf('/'));
  return `${dir}/${petId}-${size}.png`;
}

export function PetTooltip({ cell, index, gridSize, onClose }: PetTooltipProps) {
  const [spriteError, setSpriteError] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { haptic } = useHaptics();

  const species = getPetById(cell.petId);
  const pos = getIslandPosition(index, gridSize);

  useEffect(() => { haptic('light'); }, [haptic]);

  // Close on outside tap
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  if (!species || !pos) return null;

  const rarityColor = RARITY_COLORS[cell.rarity];
  const stars = RARITY_STARS[cell.rarity];
  const spritePath = getSpritePath(cell.petId, cell.size, species.imagePath);

  // Position tooltip above or below pet based on vertical position
  const showBelow = pos.y < 30;
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${Math.max(15, Math.min(85, pos.x))}%`,
    top: showBelow ? `${pos.y + 8}%` : `${pos.y - 5}%`,
    transform: showBelow
      ? 'translate(-50%, 0)'
      : 'translate(-50%, -100%)',
    zIndex: 1000,
  };

  return (
    <div
      className="pet-tooltip__backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 999,
      }}
    >
      <div
        ref={tooltipRef}
        className="pet-tooltip"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Rarity accent top */}
        <div
          className="pet-tooltip__accent"
          style={{ background: rarityColor.tooltip }}
        />

        <div className="pet-tooltip__content">
          {/* Sprite */}
          <img
            src={spriteError ? species.imagePath : spritePath}
            alt={species.name}
            className="pet-tooltip__sprite"
            draggable={false}
            onError={() => setSpriteError(true)}
          />

          {/* Info */}
          <div className="pet-tooltip__info">
            <h4 className="pet-tooltip__name">{species.name}</h4>
            <div className="pet-tooltip__meta">
              <span className="pet-tooltip__stars">
                {Array.from({ length: stars }, (_, i) => (
                  <span key={i} style={{ color: rarityColor.tooltip }}>★</span>
                ))}
              </span>
              <span
                className="pet-tooltip__badge"
                style={{
                  background: `${rarityColor.tooltip}20`,
                  color: rarityColor.tooltip,
                  borderColor: `${rarityColor.tooltip}40`,
                }}
              >
                {RARITY_LABEL[cell.rarity]}
              </span>
            </div>
            <span className="pet-tooltip__size">
              {SIZE_LABEL[cell.size]} · {cell.sessionMinutes > 0 ? `${cell.sessionMinutes}m` : 'Egg'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
