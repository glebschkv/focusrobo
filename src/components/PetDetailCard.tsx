/**
 * PetDetailCard Component
 *
 * Bottom-sheet detail card that appears when tapping a pet on the island.
 * Uses Drawer (Radix) for consistent overlay behavior: focus trap, scroll lock,
 * swipe-to-dismiss, and screen reader announcements.
 */

import { useEffect, useState } from 'react';
import { getPetById, RARITY_COLORS } from '@/data/PetDatabase';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useHaptics } from '@/hooks/useHaptics';
import { useLandStore } from '@/stores/landStore';
import type { LandCell } from '@/stores/landStore';
import {
  SIZE_LABEL,
  SIZE_DURATION_HINT,
  RARITY_LABEL,
  RARITY_STARS,
  AFFINITY_INFO,
  AFFINITY_THRESHOLDS,
} from '@/components/collection/constants';

interface PetDetailCardProps {
  cell: LandCell;
  index: number;
  landNumber: number;
  onClose: () => void;
}

function getSpritePath(petId: string, size: string, basePath: string): string {
  const dir = basePath.substring(0, basePath.lastIndexOf('/'));
  return `${dir}/${petId}-${size}.png`;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PetDetailCard({ cell, index, landNumber, onClose }: PetDetailCardProps) {
  const [spriteError, setSpriteError] = useState(false);
  const { haptic } = useHaptics();

  const species = getPetById(cell.petId);
  const affinityLevel = useLandStore((s) => s.getAffinityLevel)(cell.petId);
  const affinityCount = useLandStore((s) => s.speciesAffinity[cell.petId] || 0);
  const growPet = useLandStore((s) => s.growPet);

  // Determine if this pet can be grown
  const canGrowToAdolescent = cell.size === 'baby' && affinityCount >= 5;
  const canGrowToAdult = (cell.size === 'baby' || cell.size === 'adolescent') && affinityCount >= 10;
  const canGrow = canGrowToAdolescent || canGrowToAdult;
  const growTarget = canGrowToAdult ? 'adult' as const : 'adolescent' as const;

  // Next affinity threshold
  const nextThreshold = AFFINITY_THRESHOLDS.find(t => affinityCount < t.count);
  const progressToNext = nextThreshold
    ? affinityCount / nextThreshold.count
    : 1;

  const handleGrow = () => {
    const success = growPet(index, growTarget);
    if (success) {
      haptic('success');
      onClose();
    }
  };

  useEffect(() => {
    haptic('medium');
  }, [haptic]);

  if (!species) return null;

  const rarityColor = RARITY_COLORS[cell.rarity];
  const stars = RARITY_STARS[cell.rarity];
  const spritePath = getSpritePath(cell.petId, cell.size, species.imagePath);

  return (
    <Drawer open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className={`pet-detail-drawer pet-detail-card--${cell.rarity}`}>
        <VisuallyHidden>
          <DrawerTitle>{species.name} Details</DrawerTitle>
        </VisuallyHidden>

        <div
          className="pet-detail-card__inner"
          style={{
            '--rarity-color': rarityColor.tooltip,
          } as React.CSSProperties}
        >
          {/* Rarity accent line at top */}
          <div className="pet-detail-card__accent" />

          {/* Sprite showcase */}
          <div className="pet-detail-card__sprite-area">
            {/* Rarity glow behind sprite */}
            {cell.rarity !== 'common' && (
              <div className="pet-detail-card__sprite-glow" />
            )}
            <img
              src={spriteError ? species.imagePath : spritePath}
              alt={species.name}
              className="pet-detail-card__sprite"
              draggable={false}
              onError={() => setSpriteError(true)}
            />
          </div>

          {/* Name + rarity */}
          <div className="pet-detail-card__header">
            <h3 className="pet-detail-card__name">{species.name}</h3>
            <div className="pet-detail-card__rarity-row">
              <span className="pet-detail-card__stars">
                {Array.from({ length: stars }, (_, i) => (
                  <span key={i} className="pet-detail-card__star">★</span>
                ))}
                {Array.from({ length: 5 - stars }, (_, i) => (
                  <span key={`e-${i}`} className="pet-detail-card__star pet-detail-card__star--empty">★</span>
                ))}
              </span>
              <span
                className="pet-detail-card__rarity-badge"
                style={{
                  background: `${rarityColor.tooltip}18`,
                  color: rarityColor.tooltip,
                  borderColor: `${rarityColor.tooltip}30`,
                }}
              >
                {RARITY_LABEL[cell.rarity]}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="pet-detail-card__description">{species.description}</p>

          {/* Stats grid */}
          <div className="pet-detail-card__stats">
            <div className="pet-detail-card__stat">
              <span className="pet-detail-card__stat-label">Size</span>
              <span className="pet-detail-card__stat-value">{SIZE_LABEL[cell.size]}</span>
              <span className="pet-detail-card__stat-sub">{SIZE_DURATION_HINT[cell.size]}</span>
            </div>
            <div className="pet-detail-card__stat-divider" />
            <div className="pet-detail-card__stat">
              <span className="pet-detail-card__stat-label">
                {cell.sessionMinutes > 0 ? 'Session' : 'Origin'}
              </span>
              <span className="pet-detail-card__stat-value">
                {cell.sessionMinutes > 0 ? `${cell.sessionMinutes} min` : 'Egg'}
              </span>
              <span className="pet-detail-card__stat-sub">
                {cell.sessionMinutes > 0 ? 'Focus time' : 'Hatched from egg'}
              </span>
            </div>
            <div className="pet-detail-card__stat-divider" />
            <div className="pet-detail-card__stat">
              <span className="pet-detail-card__stat-label">Found</span>
              <span className="pet-detail-card__stat-value">{formatDate(cell.timestamp)}</span>
              <span className="pet-detail-card__stat-sub">Land {landNumber}</span>
            </div>
          </div>

          {/* Affinity & Growth */}
          <div className="pet-detail-card__affinity">
            <div className="pet-detail-card__affinity-header">
              <span
                className="pet-detail-card__affinity-level"
                style={{ color: AFFINITY_INFO[affinityLevel].color }}
              >
                {AFFINITY_INFO[affinityLevel].label}
              </span>
              <span className="pet-detail-card__affinity-count">
                {affinityCount}x found
              </span>
            </div>
            {/* Progress bar */}
            <div className="pet-detail-card__affinity-track">
              <div
                className="pet-detail-card__affinity-fill"
                style={{
                  width: `${Math.min(100, progressToNext * 100)}%`,
                  backgroundColor: AFFINITY_INFO[affinityLevel].color,
                }}
              />
            </div>
            {nextThreshold && (
              <p className="pet-detail-card__affinity-hint">
                {nextThreshold.count - affinityCount} more to {nextThreshold.level}
              </p>
            )}
            {canGrow && (
              <button onClick={handleGrow} className="pet-detail-card__grow-btn">
                Grow to {growTarget === 'adult' ? 'Adult' : 'Teen'}
              </button>
            )}
          </div>

          {/* Unlock level hint */}
          <div className="pet-detail-card__footer">
            <span className="pet-detail-card__unlock">Unlocks at level {species.unlockLevel}</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
