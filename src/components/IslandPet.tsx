/**
 * IslandPet Component
 *
 * Renders a single pet absolutely positioned on the isometric diamond island.
 * Includes depth-based scaling, rarity glow effects, idle bobbing.
 *
 * Performance optimizations:
 * - memo() with stable callback prop
 * - No per-pet store subscriptions or hooks (haptics handled at parent)
 * - CSS containment for layout isolation
 * - reducedAnimations mode disables bob + filter animations for 60+ pets
 */

import { memo, useState, useCallback } from 'react';
import { getPetById, GROWTH_SCALES } from '@/data/PetDatabase';
import { getIslandPosition, getDepthScale, getDepthZIndex, getGridDensityScale } from '@/data/islandPositions';
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
  onToggleTooltip: (index: number) => void;
  reducedAnimations?: boolean;
}

export const IslandPet = memo(({ cell, index, gridSize, isNew, onToggleTooltip, reducedAnimations }: IslandPetProps) => {
  const [imageError, setImageError] = useState(false);
  const [useGrowthSprite, setUseGrowthSprite] = useState(true);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleTooltip(index);
  }, [onToggleTooltip, index]);

  const species = getPetById(cell.petId);
  if (!species) return null;

  const { primary: growthPath, fallback: basePath } = getSpritePath(cell.petId, cell.size, species.imagePath);
  const spriteSrc = useGrowthSprite ? growthPath : basePath;

  const pos = getIslandPosition(index, gridSize);
  if (!pos) return null;

  const growthScale = GROWTH_SCALES[cell.size];
  const depthScale = getDepthScale(index);
  const gridScale = getGridDensityScale(gridSize);
  const finalScale = growthScale * depthScale * gridScale;
  const zIndex = getDepthZIndex(index);

  // Use fewer unique bob delays to allow browser animation batching
  const bobGroup = index % 5;
  const bobDelay = (bobGroup * 0.6).toFixed(1);

  const rarityClass =
    cell.rarity !== 'common'
      ? `island-pet--${cell.rarity}`
      : '';

  const animClass = reducedAnimations ? 'island-pet--reduced' : '';

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
      className={`island-pet ${rarityClass} ${isNew ? 'island-pet--new' : ''} ${animClass}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex,
        '--pet-scale': finalScale,
        '--bob-delay': `${bobDelay}s`,
        contain: 'layout style paint',
      } as React.CSSProperties}
      onClick={handleClick}
      role="button"
      aria-label={`${species.name}`}
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

      {/* Legendary shimmer — only if not in reduced mode */}
      {cell.rarity === 'legendary' && !reducedAnimations && <div className="island-pet__shimmer" />}
    </div>
  );
});

IslandPet.displayName = 'IslandPet';
