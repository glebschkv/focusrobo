/**
 * IslandSwitcher
 *
 * Horizontal pill bar showing unlocked archipelago islands.
 * Displayed at the top of PetLand below the status bar.
 * Tapping an island switches the active island view.
 * Locked islands show as dimmed with a lock icon.
 */

import { useCallback } from 'react';
import { useLandStore, useArchipelago, useActiveIslandIndex } from '@/stores/landStore';
import { ARCHIPELAGO_ISLANDS } from '@/data/ArchipelagoData';
import { getAvailableCellIndices } from '@/data/islandPositions';
import { isPetCell } from '@/stores/landStore';

interface IslandSwitcherProps {
  onLockedTap?: (index: number) => void;
}

export function IslandSwitcher({ onLockedTap }: IslandSwitcherProps) {
  const archipelago = useArchipelago();
  const activeIndex = useActiveIslandIndex();
  const switchIsland = useLandStore((s) => s.switchIsland);

  const handleTap = useCallback((index: number) => {
    const island = archipelago[index];
    if (!island) return;
    if (!island.isUnlocked || !island.isPurchased) {
      onLockedTap?.(index);
      return;
    }
    if (index !== activeIndex) {
      switchIsland(index);
    }
  }, [archipelago, activeIndex, switchIsland, onLockedTap]);

  if (archipelago.length === 0) return null;

  return (
    <div className="island-switcher">
      <div className="island-switcher__scroll">
        {archipelago.map((island, index) => {
          const def = ARCHIPELAGO_ISLANDS.find(d => d.id === island.islandId);
          if (!def) return null;
          const isActive = index === activeIndex;
          const isLocked = !island.isUnlocked || !island.isPurchased;

          // Calculate fill percentage for the progress ring
          let fillPct = 0;
          if (!isLocked) {
            const available = getAvailableCellIndices(island.land.gridSize);
            const petCount = island.land.cells.filter((c, i) => c !== null && isPetCell(c) && available.has(i)).length;
            fillPct = available.size > 0 ? (petCount / available.size) * 100 : 0;
          }
          const isComplete = island.land.completedAt !== null;

          return (
            <button
              key={island.islandId}
              className={`island-switcher__pill ${isActive ? 'island-switcher__pill--active' : ''} ${isLocked ? 'island-switcher__pill--locked' : ''} ${isComplete ? 'island-switcher__pill--complete' : ''}`}
              onClick={() => handleTap(index)}
              aria-label={`${def.name}${isLocked ? ' (locked)' : ''}${isActive ? ' (current)' : ''}`}
            >
              <span className="island-switcher__icon">{def.icon}</span>
              <span className="island-switcher__name">{def.name}</span>
              {isLocked && (
                <svg className="island-switcher__lock" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C9.24 2 7 4.24 7 7v3H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z"/>
                </svg>
              )}
              {!isLocked && !isComplete && fillPct > 0 && (
                <span className="island-switcher__pct">{Math.round(fillPct)}%</span>
              )}
              {isComplete && (
                <svg className="island-switcher__check" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
