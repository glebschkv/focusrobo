import { memo, useMemo } from 'react';
import { VillageMap } from './VillageMap';
import { VillageCharacter } from './VillageCharacter';
import { VILLAGE_CHARACTERS } from './villageConfig';
import { useVillageMovement } from '@/hooks/useVillageMovement';
import { useCurrentStreak } from '@/stores/streakStore';
import { useIsFocusModeActive } from '@/stores/focusStore';
import { useAnalytics } from '@/hooks/useAnalytics';

interface PixelVillageProps {
  unlockedRobots: string[];
  currentLevel: number;
}

/** Character display scale (32px native -> 64px at 2x) */
const SPRITE_SCALE = 2;

// ── Ambient firefly particles ────────────────────────────────────

const FIREFLIES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${8 + Math.random() * 84}%`,
  top: `${35 + Math.random() * 55}%`,
  duration: 4 + Math.random() * 4,
  delay: Math.random() * 6,
  dx: -15 + Math.random() * 30,
  dy: -25 + Math.random() * 10,
  dx2: -20 + Math.random() * 40,
  dy2: -30 + Math.random() * 5,
}));

// ── Falling leaves ───────────────────────────────────────────────

const LEAVES = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  left: `${10 + Math.random() * 80}%`,
  top: `${25 + Math.random() * 20}%`,
  duration: 5 + Math.random() * 4,
  delay: Math.random() * 8,
  color: ['#D4A844', '#C89438', '#A67830', '#8B6E24', '#6B9C4E', '#5B8C3E'][i % 6],
}));

// ── Day/night tinting ────────────────────────────────────────────

function getDayNightColor(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 8) return 'rgba(255, 200, 100, 0.08)';   // Morning gold
  if (hour >= 8 && hour < 16) return 'rgba(0, 0, 0, 0)';           // Day - clear
  if (hour >= 16 && hour < 18) return 'rgba(255, 160, 60, 0.08)';  // Afternoon warm
  if (hour >= 18 && hour < 20) return 'rgba(180, 100, 180, 0.12)'; // Dusk purple
  if (hour >= 20 && hour < 22) return 'rgba(30, 30, 80, 0.18)';    // Evening blue
  return 'rgba(15, 15, 50, 0.25)';                                   // Night
}

function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6;
}

/**
 * PixelVillage — Main home screen with animated village scene.
 * Features wandering NPCs, ambient particles, day/night cycle,
 * and pixel-art themed stats HUD.
 */
export const PixelVillage = memo(({ currentLevel }: PixelVillageProps) => {
  const streak = useCurrentStreak();
  const isFocusActive = useIsFocusModeActive();
  const { todayStats } = useAnalytics();

  const unlockedChars = VILLAGE_CHARACTERS;
  const characterStates = useVillageMovement(unlockedChars);

  // Daily focus stats
  const focusMinutesToday = Math.floor((todayStats?.totalFocusTime || 0) / 60);
  const chargePercent = Math.min(100, Math.round((focusMinutesToday / 120) * 100));

  const hours = Math.floor(focusMinutesToday / 60);
  const minutes = focusMinutesToday % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

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

      {/* ── Village name banner ── */}
      <div
        className="absolute left-1/2 village-banner pointer-events-none"
        style={{
          top: 68,
          transform: 'translateX(-50%)',
          zIndex: 710,
        }}
      >
        <div
          className="pixel-hud"
          style={{
            padding: '3px 14px',
            borderRadius: 4,
            textAlign: 'center',
          }}
        >
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#5A3E1E',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}>
            Focus Village
          </span>
        </div>
      </div>

      {/* ── Pixel-art styled stats HUD ── */}
      <div
        className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 700 }}
      >
        {/* Daily charge bar */}
        <div className="pointer-events-auto">
          <div
            className="pixel-hud"
            style={{
              padding: '6px 16px',
              borderRadius: 4,
              minWidth: 200,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 12 }}>
                  {isFocusActive ? '\u26A1' : '\u2600\uFE0F'}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#5A3E1E',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}>
                  Daily Focus
                </span>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: isFocusActive ? '#B45309' : '#78716C',
                fontFamily: 'monospace',
              }}>
                {timeDisplay}
              </span>
            </div>

            {/* Pixel progress bar */}
            <div style={{
              height: 8,
              background: '#C8B48C',
              borderRadius: 2,
              border: '1px solid #A0845C',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: '100%',
                width: `${chargePercent}%`,
                background: isFocusActive
                  ? 'linear-gradient(90deg, #F59E0B, #FBBF24, #F59E0B)'
                  : 'linear-gradient(90deg, #84CC16, #A3E635)',
                transition: 'width 1s ease-out',
                imageRendering: 'pixelated',
                borderRadius: 1,
              }} />
              {/* Pixel-style progress markers */}
              {[25, 50, 75].map(mark => (
                <div key={mark} style={{
                  position: 'absolute',
                  left: `${mark}%`,
                  top: 0,
                  width: 1,
                  height: '100%',
                  backgroundColor: 'rgba(90, 62, 30, 0.15)',
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Stats pills */}
        <div className="pointer-events-auto">
          <div
            className="pixel-hud flex items-center gap-3"
            style={{
              padding: '4px 14px',
              borderRadius: 4,
            }}
          >
            {/* Level */}
            <StatBadge
              icon={'\u2B50'}
              value={`Lv.${currentLevel}`}
              color="#B45309"
            />

            {/* Divider */}
            <div style={{ width: 1, height: 14, backgroundColor: '#C8B48C' }} />

            {/* Streak */}
            <StatBadge
              icon={streak >= 3 ? '\uD83D\uDD25' : '\u2744\uFE0F'}
              value={`${streak}d`}
              color={streak >= 3 ? '#DC2626' : '#78716C'}
            />

            {/* Divider */}
            <div style={{ width: 1, height: 14, backgroundColor: '#C8B48C' }} />

            {/* Villagers */}
            <StatBadge
              icon={'\uD83C\uDFE0'}
              value={`${unlockedChars.length}`}
              color="#5A3E1E"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PixelVillage.displayName = 'PixelVillage';

// ── Stat badge sub-component ─────────────────────────────────────

const StatBadge = memo(function StatBadge({
  icon, value, color,
}: {
  icon: string; value: string; color: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <span style={{ fontSize: 11, lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: 11,
        fontWeight: 800,
        color,
        fontFamily: 'monospace',
        letterSpacing: '0.02em',
      }}>
        {value}
      </span>
    </div>
  );
});
