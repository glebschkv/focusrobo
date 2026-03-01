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
  common: 'none',
  rare: 'drop-shadow(0 0 3px rgba(59,130,246,0.5))',
  epic: 'drop-shadow(0 0 4px rgba(139,92,246,0.6))',
  legendary: 'drop-shadow(0 0 5px rgba(245,158,11,0.7))',
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

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: displaySize,
        height: displaySize,
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
      <div className="pixel-char-shadow" />

      {/* Name label (visible on hover/tap in future) */}
    </div>
  );
});
