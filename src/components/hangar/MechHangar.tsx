import { memo, useMemo } from 'react';
import { HangarBackground } from './HangarBackground';
import { ChargingBay } from './ChargingBay';
import { DisplayBay } from './DisplayBay';
import { ChargeBar } from './ChargeBar';
import { HangarStats } from './HangarStats';
import { getAnimalById, AnimalData } from '@/data/AnimalDatabase';
import { useActiveHomePets, useOwnedCharacters } from '@/stores';
import { useCollectionStore } from '@/stores/collectionStore';
import { useCurrentStreak } from '@/stores/streakStore';
import { useIsFocusModeActive } from '@/stores/focusStore';

interface MechHangarProps {
  unlockedAnimals: string[];
  currentLevel: number;
}

/**
 * MechHangar — Main home screen component.
 * Replaces RetroPixelPlatform. Shows robots in a dark industrial hangar
 * with a central charging bay, display bays, and stats.
 */
export const MechHangar = memo(({ unlockedAnimals: _unlockedAnimals, currentLevel }: MechHangarProps) => {
  const activeHomePets = useActiveHomePets();
  const shopOwnedCharacters = useOwnedCharacters();
  const toggleHomeActive = useCollectionStore((s) => s.toggleHomeActive);
  const streak = useCurrentStreak();
  const isFocusActive = useIsFocusModeActive();

  const shopOwnedSet = useMemo(() => new Set(shopOwnedCharacters), [shopOwnedCharacters]);

  // Get active bots data
  const activeBots = useMemo(() => {
    return activeHomePets
      .map(id => getAnimalById(id))
      .filter((bot): bot is AnimalData =>
        bot !== undefined &&
        (bot.unlockLevel <= currentLevel || shopOwnedSet.has(bot.id))
      );
  }, [activeHomePets, currentLevel, shopOwnedSet]);

  // Main bot = first active bot
  const mainBot = activeBots[0];
  // Display bots = other active bots (up to 3)
  const displayBots = activeBots.slice(1, 4);

  // Calculate charge percentage (based on concept: 2 hours = 100%)
  // For now, use a placeholder value. Real implementation will read from timer store.
  const chargePercent = useMemo(() => {
    // TODO: Read actual daily focus minutes from timer/XP store
    return isFocusActive ? 65 : 42;
  }, [isFocusActive]);

  const handleSwapBot = (botId: string) => {
    // Move tapped bot to front of activeHomePets
    const current = [...activeHomePets];
    const idx = current.indexOf(botId);
    if (idx > 0) {
      current.splice(idx, 1);
      current.unshift(botId);
      useCollectionStore.getState().setActiveHomePets(current);
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <HangarBackground />

      <div className="relative z-10 flex flex-col items-center justify-center h-full pt-20 pb-28 gap-5">
        {/* Display bays (other collected bots) */}
        {displayBots.length > 0 && (
          <div className="flex items-center gap-3">
            {displayBots.map((bot) => (
              <DisplayBay
                key={bot.id}
                robotImage={bot.spriteConfig?.idleSprite}
                robotName={bot.name}
                onClick={() => handleSwapBot(bot.id)}
              />
            ))}
          </div>
        )}

        {/* Central charging bay */}
        <ChargingBay
          robotImage={mainBot?.spriteConfig?.idleSprite}
          robotName={mainBot?.name}
          isCharging={isFocusActive}
          glowColor={mainBot?.spriteConfig ? '#06b6d4' : '#06b6d4'}
        />

        {/* Charge progress bar */}
        <ChargeBar
          chargePercent={chargePercent}
          isCharging={isFocusActive}
          focusMinutesToday={Math.round(chargePercent * 1.2)}
        />

        {/* Stats */}
        <HangarStats
          streak={streak}
          level={currentLevel}
          botCount={activeBots.length}
        />
      </div>
    </div>
  );
});

MechHangar.displayName = 'MechHangar';
