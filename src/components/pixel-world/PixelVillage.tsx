import { memo } from 'react';
import { VillageMap } from './VillageMap';
import { VillageCharacter } from './VillageCharacter';
import { VILLAGE_CHARACTERS } from './villageConfig';
import { useVillageMovement } from '@/hooks/useVillageMovement';
import { useCurrentStreak } from '@/stores/streakStore';
import { useIsFocusModeActive } from '@/stores/focusStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ChargeBar } from '@/components/hangar/ChargeBar';
import { HangarStats } from '@/components/hangar/HangarStats';

interface PixelVillageProps {
  unlockedRobots: string[];
  currentLevel: number;
}

/** Character display scale (32px native → 64px at 2x) */
const SPRITE_SCALE = 2;

/**
 * PixelVillage — Main home screen component.
 * Replaces MechHangar with a cozy pixel art village where
 * unlocked NPC characters wander autonomously.
 */
export const PixelVillage = memo(({ currentLevel }: PixelVillageProps) => {
  const streak = useCurrentStreak();
  const isFocusActive = useIsFocusModeActive();
  const { todayStats } = useAnalytics();

  // Show all characters for preview (bypass level gating)
  const unlockedChars = VILLAGE_CHARACTERS;

  // Movement engine — drives all character positions
  const characterStates = useVillageMovement(unlockedChars);

  // Daily focus stats
  const focusMinutesToday = Math.floor((todayStats?.totalFocusTime || 0) / 60);
  const chargePercent = Math.min(100, Math.round((focusMinutesToday / 120) * 100));

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

      {/* Stats overlay at bottom — z-index must exceed building/character max (~600) */}
      <div className="absolute inset-x-0 bottom-24 flex flex-col items-center gap-2 pointer-events-none" style={{ zIndex: 700 }}>
        <div className="pointer-events-auto px-4 py-2.5 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          }}
        >
          <ChargeBar
            chargePercent={chargePercent}
            isCharging={isFocusActive}
            focusMinutesToday={focusMinutesToday}
          />
        </div>
        <div className="pointer-events-auto">
          <div className="px-3 py-1.5 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <HangarStats
              streak={streak}
              level={currentLevel}
              botCount={unlockedChars.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

PixelVillage.displayName = 'PixelVillage';
