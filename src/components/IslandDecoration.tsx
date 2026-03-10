/**
 * IslandDecoration Component
 *
 * Renders a single decoration absolutely positioned on the isometric diamond island.
 * Similar to IslandPet but simpler — no growth sizes, no rarity glow.
 */

import { memo, useState, useCallback } from 'react';
import { getDecorationById } from '@/data/DecorationData';
import { getIslandPosition, getDepthScale, getDepthZIndex, getGridDensityScale } from '@/data/islandPositions';
import type { DecorationCell } from '@/stores/landStore';

interface IslandDecorationProps {
  cell: DecorationCell;
  index: number;
  gridSize: number;
  isEditMode?: boolean;
  onTap?: (index: number, rect?: DOMRect) => void;
}

export const IslandDecoration = memo(({ cell, index, gridSize, isEditMode, onTap }: IslandDecorationProps) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTap) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      onTap(index, rect);
    }
  }, [onTap, index]);

  const decoration = getDecorationById(cell.decorationId);
  if (!decoration) return null;

  const pos = getIslandPosition(index, gridSize);
  if (!pos) return null;

  const depthScale = getDepthScale(index);
  const gridScale = getGridDensityScale(gridSize);
  const finalScale = depthScale * gridScale;
  const zIndex = getDepthZIndex(index);

  if (imageError) {
    return (
      <div
        className="island-decoration"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          zIndex,
          '--deco-scale': finalScale,
        } as React.CSSProperties}
      >
        <div className="island-decoration__fallback">?</div>
      </div>
    );
  }

  return (
    <div
      className={`island-decoration ${decoration.sways ? 'island-decoration--sways' : ''} ${isEditMode ? 'island-decoration--edit' : ''}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex,
        '--deco-scale': finalScale,
        contain: 'layout style paint',
      } as React.CSSProperties}
      onClick={handleClick}
      role={isEditMode ? 'button' : undefined}
      aria-label={isEditMode ? `${decoration.name} (tap to pick up)` : decoration.name}
    >
      <img
        src={decoration.sprite}
        alt={decoration.name}
        className="island-decoration__sprite"
        draggable={false}
        loading="lazy"
        onError={() => setImageError(true)}
      />
    </div>
  );
});

IslandDecoration.displayName = 'IslandDecoration';
