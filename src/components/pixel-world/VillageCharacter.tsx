import { memo, useState, useCallback, useRef } from 'react';
import type { CharacterMovementState } from '@/hooks/useVillageMovement';
import type { VillageCharacterConfig } from './villageConfig';

interface VillageCharacterProps {
  character: VillageCharacterConfig;
  movement: CharacterMovementState;
  scale: number;
}

const SPRITE_SIZE = 32;

const RARITY_GLOW: Record<string, string> = {
  common: 'none',
  rare: 'drop-shadow(0 0 3px rgba(59,130,246,0.5))',
  epic: 'drop-shadow(0 0 4px rgba(139,92,246,0.6))',
  legendary: 'drop-shadow(0 0 5px rgba(245,158,11,0.7))',
};

const RARITY_COLOR: Record<string, string> = {
  common: '#78716C',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

// ── Character speech lines ───────────────────────────────────────

const CHARACTER_QUOTES: Record<string, string[]> = {
  farmer: [
    'Great day for farming!',
    'Focus grows like crops!',
    'Stay focused, friend!',
    'The harvest is near!',
    'Time to plant seeds!',
    'Hard work pays off!',
  ],
  baker: [
    'Fresh bread, coming up!',
    'Focus is the yeast!',
    'Smells like productivity!',
    'Knead that focus dough!',
    'Sweet rewards await!',
    'Baking up success!',
  ],
  blacksmith: [
    'Forging ahead!',
    'Strong focus, strong steel!',
    'Hammer time!',
    'Tempered by discipline!',
    'Iron will, iron focus!',
    'Building something great!',
  ],
  fisher: [
    'Patience catches fish!',
    'Calm waters, calm mind!',
    'What a peaceful day...',
    'The big one is coming!',
    'Just you and the water.',
    'Cast your focus line!',
  ],
  wizard: [
    'Focus is true magic!',
    'Spell of concentration!',
    'Knowledge is power!',
    'The stars align!',
    'Enchanting progress!',
    'Mystical focus energy!',
  ],
};

function getRandomQuote(characterId: string): string {
  const quotes = CHARACTER_QUOTES[characterId] || ['Hello there!'];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * VillageCharacter — Interactive NPC with sprite animation and speech bubbles.
 * Tap to interact and see character-specific quotes.
 */
export const VillageCharacter = memo(function VillageCharacter({
  character,
  movement,
  scale,
}: VillageCharacterProps) {
  const displaySize = SPRITE_SIZE * scale;
  const sheetWidth = 6 * SPRITE_SIZE * scale;
  const sheetHeight = 4 * SPRITE_SIZE * scale;

  const [speechText, setSpeechText] = useState<string | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const speechTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleTap = useCallback(() => {
    // Clear existing timer
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }

    const quote = getRandomQuote(character.id);
    setSpeechText(quote);
    setBouncing(true);

    // Remove bounce after animation
    setTimeout(() => setBouncing(false), 400);

    // Hide speech after 3 seconds
    speechTimerRef.current = setTimeout(() => {
      setSpeechText(null);
    }, 3000);
  }, [character.id]);

  // CSS class for current animation state + direction
  const animClass = movement.state === 'walking'
    ? `pixel-char-walk-${movement.direction}`
    : `pixel-char-idle-${movement.direction}`;

  const rarityColor = RARITY_COLOR[character.rarity] || '#78716C';

  return (
    <div
      className="absolute"
      style={{
        width: displaySize + 16,
        height: displaySize + 24,
        transform: `translate3d(${movement.x - (displaySize + 16) / 2}px, ${movement.y - (displaySize + 24) / 2}px, 0)`,
        zIndex: Math.floor(movement.y),
        willChange: 'transform',
        opacity: movement.spawned ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      onClick={handleTap}
    >
      {/* Speech bubble */}
      {speechText && (
        <div
          className="speech-bubble"
          style={{
            position: 'absolute',
            bottom: displaySize + 18,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '5px 10px',
            background: 'white',
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 700,
            color: '#2D2D2D',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            zIndex: 1000,
            letterSpacing: '0.01em',
            lineHeight: 1.3,
          }}
        >
          {speechText}
          {/* Triangle pointer */}
          <div
            style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid white',
            }}
          />
        </div>
      )}

      {/* Character sprite container (centered within hitbox) */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 4,
          width: displaySize,
          height: displaySize,
        }}
      >
        {/* Sprite */}
        <div
          className={`pixel-render ${animClass} ${bouncing ? 'char-tap-bounce' : ''}`}
          style={{
            width: displaySize,
            height: displaySize,
            backgroundImage: `url(${character.spriteSheet})`,
            backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
            filter: RARITY_GLOW[character.rarity] || 'none',
            '--frame-w': `${displaySize}px`,
            '--frame-h': `${displaySize}px`,
          } as React.CSSProperties}
        />

        {/* Ground shadow */}
        <div className="pixel-char-shadow" />
      </div>

      {/* Name label with rarity indicator */}
      <div
        className="absolute left-1/2 text-center whitespace-nowrap pointer-events-none"
        style={{
          transform: 'translateX(-50%)',
          bottom: 0,
          fontSize: 9,
          fontWeight: 700,
          color: '#3D3D3D',
          textShadow: '0 0 4px rgba(255,255,255,0.95), 0 0 8px rgba(255,255,255,0.7)',
          letterSpacing: '0.02em',
        }}
      >
        <span style={{ color: rarityColor, marginRight: 2, fontSize: 7 }}>
          {character.rarity === 'epic' ? '\u2605' : character.rarity === 'rare' ? '\u25C6' : '\u25CF'}
        </span>
        {character.name}
      </div>
    </div>
  );
});
