/**
 * PetDetailCard Component
 *
 * Beautiful bottom-sheet style detail card that appears when tapping a pet
 * on the island. Replaces the old tiny tooltip with an impressive, animated
 * card showing the pet sprite large, rarity effects, stats, and description.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getPetById, RARITY_COLORS } from '@/data/PetDatabase';
import { useHaptics } from '@/hooks/useHaptics';
import { useLandStore } from '@/stores/landStore';
import type { LandCell } from '@/stores/landStore';

interface PetDetailCardProps {
  cell: LandCell;
  index: number;
  landNumber: number;
  onClose: () => void;
}

const SIZE_LABELS: Record<string, string> = {
  baby: 'Baby',
  adolescent: 'Teen',
  adult: 'Adult',
};

const SIZE_DESCRIPTIONS: Record<string, string> = {
  baby: '25–45 min session',
  adolescent: '60–90 min session',
  adult: '120+ min session',
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const RARITY_STARS: Record<string, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
};

const RARITY_BG: Record<string, string> = {
  common: 'linear-gradient(135deg, rgba(158,158,158,0.08), rgba(158,158,158,0.03))',
  uncommon: 'linear-gradient(135deg, rgba(102,187,106,0.10), rgba(102,187,106,0.03))',
  rare: 'linear-gradient(135deg, rgba(66,165,245,0.10), rgba(66,165,245,0.03))',
  epic: 'linear-gradient(135deg, rgba(171,71,188,0.12), rgba(171,71,188,0.03))',
  legendary: 'linear-gradient(135deg, rgba(255,167,38,0.15), rgba(255,167,38,0.04))',
};

const RARITY_BORDER: Record<string, string> = {
  common: 'rgba(158,158,158,0.2)',
  uncommon: 'rgba(102,187,106,0.3)',
  rare: 'rgba(66,165,245,0.35)',
  epic: 'rgba(171,71,188,0.35)',
  legendary: 'rgba(255,167,38,0.4)',
};

const RARITY_GLOW_SHADOW: Record<string, string> = {
  common: 'none',
  uncommon: '0 0 20px rgba(102,187,106,0.15)',
  rare: '0 0 24px rgba(66,165,245,0.2)',
  epic: '0 0 28px rgba(171,71,188,0.25)',
  legendary: '0 0 32px rgba(255,167,38,0.3), 0 0 60px rgba(255,167,38,0.1)',
};

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

const AFFINITY_LABELS: Record<string, { label: string; color: string }> = {
  none: { label: 'New', color: '#9E9E9E' },
  familiar: { label: 'Familiar', color: '#66BB6A' },
  bonded: { label: 'Bonded', color: '#42A5F5' },
  devoted: { label: 'Devoted', color: '#AB47BC' },
};

const AFFINITY_THRESHOLDS = [
  { level: 'familiar', count: 3 },
  { level: 'bonded', count: 5 },
  { level: 'devoted', count: 10 },
];

export function PetDetailCard({ cell, index, landNumber, onClose }: PetDetailCardProps) {
  const [visible, setVisible] = useState(false);
  const [spriteError, setSpriteError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
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
      // Close and reopen to refresh the card
      onClose();
    }
  };

  useEffect(() => {
    haptic('medium');
    // Trigger entrance animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, [haptic]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 250);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  if (!species) return null;

  const rarityColor = RARITY_COLORS[cell.rarity];
  const stars = RARITY_STARS[cell.rarity];
  const spritePath = getSpritePath(cell.petId, cell.size, species.imagePath);

  return (
    <div
      className={`pet-detail-backdrop ${visible ? 'pet-detail-backdrop--visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div
        ref={cardRef}
        className={`pet-detail-card pet-detail-card--${cell.rarity} ${visible ? 'pet-detail-card--visible' : ''}`}
        style={{
          '--rarity-color': rarityColor.tooltip,
          '--rarity-bg': RARITY_BG[cell.rarity],
          '--rarity-border': RARITY_BORDER[cell.rarity],
          '--rarity-glow': RARITY_GLOW_SHADOW[cell.rarity],
        } as React.CSSProperties}
      >
        {/* Rarity accent line at top */}
        <div className="pet-detail-card__accent" />

        {/* Close handle */}
        <div className="pet-detail-card__handle" onClick={handleClose} />

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
              {RARITY_LABELS[cell.rarity]}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="pet-detail-card__description">{species.description}</p>

        {/* Stats grid */}
        <div className="pet-detail-card__stats">
          <div className="pet-detail-card__stat">
            <span className="pet-detail-card__stat-label">Size</span>
            <span className="pet-detail-card__stat-value">{SIZE_LABELS[cell.size]}</span>
            <span className="pet-detail-card__stat-sub">{SIZE_DESCRIPTIONS[cell.size]}</span>
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
        <div className="pet-detail-card__affinity" style={{ padding: '8px 12px', margin: '0 12px 8px', borderRadius: '8px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: AFFINITY_LABELS[affinityLevel].color }}>
              {AFFINITY_LABELS[affinityLevel].label}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#999' }}>
              {affinityCount}x found
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: '2px',
              width: `${Math.min(100, progressToNext * 100)}%`,
              background: AFFINITY_LABELS[affinityLevel].color,
              transition: 'width 0.3s ease',
            }} />
          </div>
          {nextThreshold && (
            <p style={{ fontSize: '9px', color: '#aaa', marginTop: '3px' }}>
              {nextThreshold.count - affinityCount} more to {nextThreshold.level}
            </p>
          )}
          {canGrow && (
            <button
              onClick={handleGrow}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '6px 0',
                borderRadius: '6px',
                border: 'none',
                background: 'linear-gradient(135deg, #66BB6A, #43A047)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Grow to {growTarget === 'adult' ? 'Adult' : 'Teen'}
            </button>
          )}
        </div>

        {/* Unlock level hint */}
        <div className="pet-detail-card__footer">
          <span className="pet-detail-card__unlock">Unlocks at level {species.unlockLevel}</span>
        </div>
      </div>
    </div>
  );
}
