import { memo } from 'react';
import type { CharacterMovementState } from '@/hooks/useVillageMovement';
import type { VillageCharacterConfig } from './villageConfig';

interface VillageCharacterProps {
  character: VillageCharacterConfig;
  movement: CharacterMovementState;
  scale: number;
}

const SPRITE_SIZE = 32; // native pixel art frame size

const RARITY_GLOW: Record<string, string> = {
  common: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
  rare: 'drop-shadow(0 0 4px rgba(59,130,246,0.5)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
  epic: 'drop-shadow(0 0 5px rgba(139,92,246,0.6)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
  legendary: 'drop-shadow(0 0 6px rgba(245,158,11,0.7)) drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
};

const RARITY_BADGE: Record<string, { bg: string; border: string }> = {
  common: { bg: 'rgba(168,162,158,0.8)', border: 'rgba(168,162,158,0.4)' },
  rare: { bg: 'rgba(59,130,246,0.8)', border: 'rgba(59,130,246,0.4)' },
  epic: { bg: 'rgba(139,92,246,0.8)', border: 'rgba(139,92,246,0.4)' },
  legendary: { bg: 'rgba(245,158,11,0.8)', border: 'rgba(245,158,11,0.4)' },
};

/**
 * Renders a single wandering NPC as a sprite-sheet-animated element.
 * Position is controlled by the movement engine via translate3d.
 * Walk/idle animation handled by CSS classes (steps() keyframes).
 */
export const VillageCharacter = memo(function VillageCharacter({
  character,
  movement,
  scale,
}: VillageCharacterProps) {
  const displaySize = SPRITE_SIZE * scale;
  const sheetWidth = 6 * SPRITE_SIZE * scale;  // 6 columns (4 walk + 2 idle)
  const sheetHeight = 4 * SPRITE_SIZE * scale;  // 4 rows (directions)

  // CSS class for current animation state + direction
  const animClass = movement.state === 'walking'
    ? `pixel-char-walk-${movement.direction}`
    : `pixel-char-idle-${movement.direction}`;

  const badge = RARITY_BADGE[character.rarity] || RARITY_BADGE.common;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: displaySize,
        height: displaySize + 20, // extra space for name label
        transform: `translate3d(${movement.x - displaySize / 2}px, ${movement.y - displaySize / 2}px, 0)`,
        zIndex: Math.floor(movement.y),
        willChange: 'transform',
        opacity: movement.spawned ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
      }}
    >
      {/* Character sprite */}
      <div
        className={`pixel-render ${animClass}`}
        style={{
          width: displaySize,
          height: displaySize,
          backgroundImage: `url(${character.spriteSheet})`,
          backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
          filter: RARITY_GLOW[character.rarity] || 'none',
        }}
      />

      {/* Ground shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: displaySize * 0.7,
          height: displaySize * 0.15,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Name label */}
      <div
        className="absolute flex justify-center"
        style={{
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.03em',
            color: '#fff',
            textShadow: '0 1px 3px rgba(0,0,0,0.6), 0 0 6px rgba(0,0,0,0.3)',
            padding: '1px 5px',
            borderRadius: 6,
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            backdropFilter: 'blur(4px)',
          }}
        >
          {character.name}
        </span>
      </div>
    </div>
  );
});
