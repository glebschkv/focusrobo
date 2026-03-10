/**
 * IslandUnlockModal
 *
 * Confirmation dialog for unlocking/purchasing a new archipelago island.
 * Shows island preview, cost, level requirement, and completion bonus.
 */

import { useCallback } from 'react';
import { useLandStore, useArchipelago } from '@/stores/landStore';
import { useCoinStore } from '@/stores/coinStore';
import { useXPStore } from '@/stores/xpStore';
import { usePremiumStore } from '@/stores/premiumStore';
import { ARCHIPELAGO_ISLANDS, canUnlockIsland } from '@/data/ArchipelagoData';
import { getIslandTheme } from '@/data/IslandThemes';
import { useHaptics } from '@/hooks/useHaptics';

interface IslandUnlockModalProps {
  islandIndex: number;
  onClose: () => void;
}

export function IslandUnlockModal({ islandIndex, onClose }: IslandUnlockModalProps) {
  const archipelago = useArchipelago();
  const unlockIsland = useLandStore((s) => s.unlockIsland);
  const coinBalance = useCoinStore((s) => s.balance);
  const spendCoins = useCoinStore((s) => s.spendCoins);
  const playerLevel = useXPStore((s) => s.currentLevel);
  const isPremium = usePremiumStore((s) => s.tier === 'premium');
  const { haptic } = useHaptics();

  const island = archipelago[islandIndex];
  if (!island) return null;

  const def = ARCHIPELAGO_ISLANDS.find(d => d.id === island.islandId);
  if (!def) return null;

  const theme = getIslandTheme(def.biome);
  const previousComplete = islandIndex > 0 ? archipelago[islandIndex - 1]?.land.completedAt !== null : false;
  const canUnlock = canUnlockIsland(def, playerLevel, coinBalance, previousComplete, isPremium);
  const meetsLevel = playerLevel >= def.unlockLevel || (def.unlockedByPrevious && previousComplete);
  const hasCoins = coinBalance >= def.coinCost;

  const handleUnlock = useCallback(() => {
    if (!canUnlock) return;
    // Spend coins
    if (def.coinCost > 0) {
      spendCoins(def.coinCost);
    }
    unlockIsland(islandIndex);
    haptic('medium');
    onClose();
  }, [canUnlock, def, spendCoins, unlockIsland, islandIndex, haptic, onClose]);

  const skyGradient = `linear-gradient(180deg, ${theme.sky[0]} 0%, ${theme.sky[2]} 50%, ${theme.grassLight[0]} 80%, ${theme.grassDark[0]} 100%)`;

  return (
    <div className="island-unlock-overlay" onClick={onClose}>
      <div className="island-unlock-modal" onClick={(e) => e.stopPropagation()}>
        {/* Island preview */}
        <div className="island-unlock-modal__preview" style={{ background: skyGradient }}>
          <span className="island-unlock-modal__icon">{def.icon}</span>
        </div>

        <div className="island-unlock-modal__content">
          <h3 className="island-unlock-modal__title">{def.name}</h3>
          <p className="island-unlock-modal__desc">{def.description}</p>

          {/* Requirements */}
          <div className="island-unlock-modal__reqs">
            {def.unlockLevel > 0 && (
              <div className={`island-unlock-modal__req ${meetsLevel ? 'island-unlock-modal__req--met' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {meetsLevel
                    ? <polyline points="20 6 9 17 4 12" />
                    : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                  }
                </svg>
                <span>Level {def.unlockLevel}</span>
              </div>
            )}
            {def.unlockedByPrevious && (
              <div className={`island-unlock-modal__req ${previousComplete ? 'island-unlock-modal__req--met' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {previousComplete
                    ? <polyline points="20 6 9 17 4 12" />
                    : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                  }
                </svg>
                <span>Complete previous island</span>
              </div>
            )}
          </div>

          {/* Completion bonus */}
          {def.completionBonus && (
            <div className="island-unlock-modal__bonus">
              <span className="island-unlock-modal__bonus-label">Completion Bonus</span>
              <span className="island-unlock-modal__bonus-value">{def.completionBonus.label}</span>
            </div>
          )}

          {/* Unlock button */}
          <button
            className={`island-unlock-modal__btn ${!canUnlock ? 'island-unlock-modal__btn--disabled' : ''}`}
            onClick={handleUnlock}
            disabled={!canUnlock}
          >
            {def.coinCost > 0 ? (
              <>
                <span>Unlock for</span>
                <span className="island-unlock-modal__cost">
                  {def.coinCost.toLocaleString()} coins
                </span>
                {!hasCoins && <span className="island-unlock-modal__need">(need {(def.coinCost - coinBalance).toLocaleString()} more)</span>}
              </>
            ) : (
              <span>Unlock Island</span>
            )}
          </button>

          <button className="island-unlock-modal__close" onClick={onClose}>
            Not yet
          </button>
        </div>
      </div>
    </div>
  );
}
