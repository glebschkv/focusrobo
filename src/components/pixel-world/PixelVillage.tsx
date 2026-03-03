import { memo, useMemo } from 'react';
import { VillageMap } from './VillageMap';
import { VillageCharacter } from './VillageCharacter';
import { VILLAGE_CHARACTERS } from './villageConfig';
import { useVillageMovement } from '@/hooks/useVillageMovement';

interface PixelVillageProps {
  unlockedRobots: string[];
  currentLevel: number;
}

/** Character display scale (32px native -> 64px at 2x) */
const SPRITE_SCALE = 2;

// ── Ambient firefly particles ────────────────────────────────────

const FIREFLIES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${6 + Math.random() * 88}%`,
  top: `${32 + Math.random() * 58}%`,
  duration: 3.5 + Math.random() * 4.5,
  delay: Math.random() * 7,
  dx: -18 + Math.random() * 36,
  dy: -28 + Math.random() * 14,
  dx2: -22 + Math.random() * 44,
  dy2: -32 + Math.random() * 8,
}));

// ── Falling leaves ───────────────────────────────────────────────

const LEAVES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${8 + Math.random() * 84}%`,
  top: `${22 + Math.random() * 22}%`,
  duration: 5 + Math.random() * 5,
  delay: Math.random() * 10,
  color: ['#D4A844', '#C89438', '#A67830', '#8B6E24', '#6B9C4E', '#5B8C3E', '#D4A844', '#6B9C4E'][i],
}));

// ── Day/night tinting ────────────────────────────────────────────

function getDayNightColor(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 8) return 'rgba(255, 200, 100, 0.06)';
  if (hour >= 8 && hour < 16) return 'rgba(0, 0, 0, 0)';
  if (hour >= 16 && hour < 18) return 'rgba(255, 160, 60, 0.06)';
  if (hour >= 18 && hour < 20) return 'rgba(160, 80, 160, 0.1)';
  if (hour >= 20 && hour < 22) return 'rgba(30, 30, 80, 0.16)';
  return 'rgba(15, 15, 50, 0.22)';
}

function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6;
}

/**
 * PixelVillage — Main home screen with animated village scene.
 * Features wandering NPCs, ambient particles, and day/night cycle.
 * Stats are displayed by TopStatusBar (in GameUI), not duplicated here.
 */
export const PixelVillage = memo(({ currentLevel }: PixelVillageProps) => {
  const unlockedChars = VILLAGE_CHARACTERS;
  const characterStates = useVillageMovement(unlockedChars);

  const showFireflies = isNightTime();
  const dayNightColor = useMemo(() => getDayNightColor(), []);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Village background + buildings */}
      <VillageMap currentLevel={currentLevel} />

      {/* Wandering NPCs */}
      {unlockedChars.map((char) => {
        const movement = characterStates.get(char.id);
        if (!movement) return null;

        return (
          <VillageCharacter
            key={char.id}
            character={char}
            movement={movement}
            scale={SPRITE_SCALE}
          />
        );
      })}

      {/* ── Ambient falling leaves ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 610 }}>
        {LEAVES.map(leaf => (
          <div
            key={`leaf-${leaf.id}`}
            className="falling-leaf"
            style={{
              left: leaf.left,
              top: leaf.top,
              backgroundColor: leaf.color,
              '--leaf-duration': `${leaf.duration}s`,
              '--leaf-delay': `${leaf.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Ambient fireflies (evening/night) ── */}
      {showFireflies && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 620 }}>
          {FIREFLIES.map(fly => (
            <div
              key={`fly-${fly.id}`}
              className="firefly"
              style={{
                left: fly.left,
                top: fly.top,
                '--fly-duration': `${fly.duration}s`,
                '--fly-delay': `${fly.delay}s`,
                '--fly-dx': `${fly.dx}px`,
                '--fly-dy': `${fly.dy}px`,
                '--fly-dx2': `${fly.dx2}px`,
                '--fly-dy2': `${fly.dy2}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* ── Day/night color overlay ── */}
      <div
        className="day-night-overlay"
        style={{ backgroundColor: dayNightColor }}
      />
    </div>
  );
});

PixelVillage.displayName = 'PixelVillage';
