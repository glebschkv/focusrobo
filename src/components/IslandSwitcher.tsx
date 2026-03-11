/**
 * IslandSwitcher
 *
 * Compact dropdown showing the current archipelago island with a chevron.
 * Tapping opens a Popover list of all islands (locked/unlocked, progress, etc.).
 * Displayed at the top-left of PetLand below the status bar.
 */

import { useCallback, useState } from 'react';
import { useLandStore, useArchipelago, useActiveIslandIndex, isPetCell } from '@/stores/landStore';
import { ARCHIPELAGO_ISLANDS } from '@/data/ArchipelagoData';
import { getAvailableCellIndices } from '@/data/islandPositions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface IslandSwitcherProps {
  onLockedTap?: (index: number) => void;
}

export function IslandSwitcher({ onLockedTap }: IslandSwitcherProps) {
  const [open, setOpen] = useState(false);
  const archipelago = useArchipelago();
  const activeIndex = useActiveIslandIndex();
  const switchIsland = useLandStore((s) => s.switchIsland);

  const handleTap = useCallback((index: number) => {
    const island = archipelago[index];
    if (!island) return;
    if (!island.isUnlocked || !island.isPurchased) {
      onLockedTap?.(index);
      setOpen(false);
      return;
    }
    if (index !== activeIndex) {
      switchIsland(index);
    }
    setOpen(false);
  }, [archipelago, activeIndex, switchIsland, onLockedTap]);

  if (archipelago.length === 0) return null;

  const activeDef = ARCHIPELAGO_ISLANDS.find(d => d.id === archipelago[activeIndex]?.islandId);

  return (
    <div className="island-switcher">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="island-switcher__trigger" aria-label="Switch island">
            <span className="island-switcher__trigger-icon">{activeDef?.icon || '🏝️'}</span>
            <span className="island-switcher__trigger-name">{activeDef?.name || 'Island'}</span>
            <svg className="island-switcher__chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </PopoverTrigger>
        <PopoverContent className="island-switcher__dropdown" align="start" sideOffset={6}>
          <div className="island-switcher__list">
            {archipelago.map((island, index) => {
              const def = ARCHIPELAGO_ISLANDS.find(d => d.id === island.islandId);
              if (!def) return null;
              const isActive = index === activeIndex;
              const isLocked = !island.isUnlocked || !island.isPurchased;
              const isComplete = island.land.completedAt !== null;

              let fillPct = 0;
              if (!isLocked) {
                const available = getAvailableCellIndices(island.land.gridSize);
                const petCount = island.land.cells.filter((c, i) => c !== null && isPetCell(c) && available.has(i)).length;
                fillPct = available.size > 0 ? (petCount / available.size) * 100 : 0;
              }

              return (
                <button
                  key={island.islandId}
                  className={`island-switcher__row ${isActive ? 'island-switcher__row--active' : ''} ${isLocked ? 'island-switcher__row--locked' : ''}`}
                  onClick={() => handleTap(index)}
                >
                  <span className="island-switcher__row-icon">{def.icon}</span>
                  <span className="island-switcher__row-name">{def.name}</span>
                  <span className="island-switcher__row-status">
                    {isLocked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.5">
                        <path d="M12 2C9.24 2 7 4.24 7 7v3H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-2V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z"/>
                      </svg>
                    )}
                    {!isLocked && isComplete && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(45 90% 45%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {!isLocked && !isComplete && fillPct > 0 && (
                      <span className="island-switcher__row-pct">{Math.round(fillPct)}%</span>
                    )}
                    {isActive && <span className="island-switcher__row-dot" />}
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
