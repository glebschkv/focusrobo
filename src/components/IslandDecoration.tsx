/**
 * IslandDecoration Component
 *
 * Renders a single decoration absolutely positioned on the isometric diamond island.
 * Similar to IslandPet but simpler — no growth sizes, no rarity glow.
 * In edit mode, long-press (500ms) to pick up — prevents accidental removal
 * while placing new decorations via ghost tile taps.
 */

import { memo, useState, useCallback, useRef } from 'react';
import { getDecorationById } from '@/data/DecorationData';
import { getIslandPosition, getDepthScale, getDepthZIndex, getGridDensityScale } from '@/data/islandPositions';
import type { DecorationCell } from '@/stores/landStore';

const LONG_PRESS_MS = 500;

interface IslandDecorationProps {
  cell: DecorationCell;
  index: number;
  gridSize: number;
  isEditMode?: boolean;
  onLongPress?: (index: number) => void;
}

export const IslandDecoration = memo(({ cell, index, gridSize, isEditMode, onLongPress }: IslandDecorationProps) => {
  const [imageError, setImageError] = useState(false);
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setPressing(false);
    firedRef.current = false;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isEditMode || !onLongPress) return;
    e.stopPropagation();
    firedRef.current = false;
    setPressing(true);
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      setPressing(false);
      onLongPress(index);
    }, LONG_PRESS_MS);
  }, [isEditMode, onLongPress, index]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    clearTimer();
  }, [clearTimer]);

  const handlePointerCancel = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  // Prevent click from propagating to ghost tiles underneath
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isEditMode) {
      e.stopPropagation();
    }
  }, [isEditMode]);

  const decoration = getDecorationById(cell.decorationId);
  if (!decoration) return null;

  const pos = getIslandPosition(index, gridSize);
  if (!pos) return null;

  const depthScale = getDepthScale(index);
  const gridScale = getGridDensityScale(gridSize);
  const finalScale = Math.max(0.55, depthScale * gridScale);
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

  const editClasses = isEditMode
    ? `island-decoration--edit${pressing ? ' island-decoration--pressing' : ''}`
    : '';

  return (
    <div
      className={`island-decoration ${decoration.sways ? 'island-decoration--sways' : ''} ${editClasses}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex,
        '--deco-scale': finalScale,
        contain: 'layout style paint',
      } as React.CSSProperties}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      role={isEditMode ? 'button' : undefined}
      aria-label={isEditMode ? `${decoration.name} (hold to pick up)` : decoration.name}
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
