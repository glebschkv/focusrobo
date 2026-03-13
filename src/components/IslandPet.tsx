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

import { memo, useState, useCallback, useRef } from 'react';
import { getPetById, GROWTH_SCALES } from '@/data/PetDatabase';
import { getIslandPosition, getDepthScale, getDepthZIndex, getGridDensityScale } from '@/data/islandPositions';
import type { LandCell } from '@/stores/landStore';

/** Heart particle positions for tap reaction */
const HEART_OFFSETS = [-12, 0, 12];
const STAR_OFFSETS = [-16, -6, 6, 16];

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
  onToggleTooltip: (index: number, rect?: DOMRect) => void;
  reducedAnimations?: boolean;
}

export const IslandPet = memo(({ cell, index, gridSize, isNew, onToggleTooltip, reducedAnimations }: IslandPetProps) => {
  const [imageError, setImageError] = useState(false);
  const [useGrowthSprite, setUseGrowthSprite] = useState(true);
  const [tapped, setTapped] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout>>();
  const heartIdRef = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const wrapper = (e.currentTarget as HTMLElement).parentElement;
    const rect = (wrapper || e.currentTarget as HTMLElement).getBoundingClientRect();

    // Tap reaction: bounce + hearts
    if (!reducedAnimations) {
      setTapped(true);
      const isLegendary = cell.rarity === 'legendary' || cell.rarity === 'epic';
      const offsets = isLegendary ? STAR_OFFSETS : HEART_OFFSETS;
      const ids = offsets.map(() => ++heartIdRef.current);
      setHearts(ids.map((id, i) => i)); // indices into offsets
      setTimeout(() => setTapped(false), 400);
      setTimeout(() => setHearts([]), 900);

      // Delay tooltip to allow bounce animation
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
      tooltipTimer.current = setTimeout(() => {
        onToggleTooltip(index, rect);
      }, 400);
    } else {
      onToggleTooltip(index, rect);
    }
  }, [onToggleTooltip, index, reducedAnimations, cell.rarity]);

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

  const tappedClass = tapped ? 'island-pet--tapped' : '';
  const isLegendary = cell.rarity === 'legendary' || cell.rarity === 'epic';
  const particleOffsets = isLegendary ? STAR_OFFSETS : HEART_OFFSETS;

  return (
    <div
      className={`island-pet ${rarityClass} ${isNew ? 'island-pet--new' : ''} ${animClass} ${tappedClass}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex,
        '--pet-scale': finalScale,
        '--bob-delay': `${bobDelay}s`,
        contain: 'layout style paint',
      } as React.CSSProperties}
    >
      <div
        className="island-pet__hotspot"
        onClick={handleClick}
        role="button"
        aria-label={`${species.name}`}
      />
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

      {/* Tap reaction hearts/stars */}
      {hearts.length > 0 && (
        <div className="island-pet__hearts" aria-hidden="true">
          {hearts.map((offsetIdx, i) => (
            <span
              key={i}
              className={`island-pet__heart ${isLegendary ? 'island-pet__heart--star' : ''}`}
              style={{
                '--hx': `${particleOffsets[offsetIdx]}px`,
                animationDelay: `${i * 0.08}s`,
              } as React.CSSProperties}
            >
              <img
                src={isLegendary ? '/assets/icons/star.png' : '/assets/icons/heart.png'}
                alt=""
                width={10}
                height={10}
                style={{ imageRendering: 'pixelated' }}
                draggable={false}
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

IslandPet.displayName = 'IslandPet';
