/**
 * LandCompleteModal
 *
 * Celebrates when a full 20×20 island is completed and archived.
 * Shows stats: total pets, rarity breakdown, focus time, bonus coins.
 * Triggered by the 'landCompleted' custom event from landStore.
 */

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { LAND_COMPLETE_BONUS_COINS } from '@/stores/landStore';
import type { PetRarity } from '@/data/PetDatabase';
import { RARITY_HEX, RARITY_LABEL } from '@/components/collection/constants';

interface LandStats {
  landNumber: number;
  totalPets: number;
  totalMinutes: number;
  rarityBreakdown: Record<PetRarity, number>;
}

interface LandCompletedEvent {
  landNumber: number;
  cells: (unknown | null)[];
  totalFocusMinutes: number;
}

export const LandCompleteModal = () => {
  const [stats, setStats] = useState<LandStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const lastStatsRef = useRef<LandStats | null>(null);

  useEffect(() => {
    const handleLandCompleted = (e: CustomEvent<LandCompletedEvent>) => {
      const { landNumber, cells, totalFocusMinutes } = e.detail;
      const filledCells = cells.filter(Boolean) as { rarity: PetRarity }[];
      const breakdown: Record<PetRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
      for (const cell of filledCells) {
        breakdown[cell.rarity] = (breakdown[cell.rarity] || 0) + 1;
      }
      const data: LandStats = {
        landNumber,
        totalPets: filledCells.length,
        totalMinutes: totalFocusMinutes,
        rarityBreakdown: breakdown,
      };
      lastStatsRef.current = data;
      setStats(data);
      setIsOpen(true);
    };

    window.addEventListener('landCompleted', handleLandCompleted as EventListener);
    return () => {
      window.removeEventListener('landCompleted', handleLandCompleted as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const displayStats = stats || lastStatsRef.current;
  if (!displayStats) return null;

  const hours = Math.floor(displayStats.totalMinutes / 60);
  const mins = displayStats.totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const rarityEntries = (['legendary', 'epic', 'rare', 'uncommon', 'common'] as PetRarity[])
    .filter(r => displayStats.rarityBreakdown[r] > 0);

  return (
    <Dialog open={isOpen && !!displayStats} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="retro-modal max-w-[320px] p-0 overflow-hidden border-0 max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Island Complete</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="retro-modal-header p-5 text-center relative">
          <div className="retro-scanlines opacity-20" />
          <div className="relative z-[1]">
            <div
              className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: 'hsl(42 65% 52%)',
                border: '2px solid hsl(42 55% 42%)',
                boxShadow: '0 2px 0 hsl(42 55% 36%)',
              }}
            >
              <PixelIcon name="trophy" size={28} />
            </div>
            <h2
              className="text-xl font-black uppercase tracking-tight"
              style={{ color: 'hsl(150 10% 12%)' }}
            >
              Land {displayStats.landNumber} Complete!
            </h2>
            <p className="text-xs mt-1" style={{ color: 'hsl(150 10% 50%)' }}>
              Your island is full — a new adventure awaits!
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="retro-reward-item flex-col !items-center !gap-0.5 py-2.5">
              <span className="text-lg font-black text-amber-600">{displayStats.totalPets}</span>
              <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground)/0.5)]">Pets</span>
            </div>
            <div className="retro-reward-item flex-col !items-center !gap-0.5 py-2.5">
              <span className="text-lg font-black text-amber-600">{timeStr}</span>
              <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground)/0.5)]">Focus Time</span>
            </div>
            <div className="retro-reward-item flex-col !items-center !gap-0.5 py-2.5">
              <div className="flex items-center gap-1">
                <PixelIcon name="coin" size={14} />
                <span className="text-lg font-black text-amber-600">+{LAND_COMPLETE_BONUS_COINS}</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground)/0.5)]">Bonus</span>
            </div>
          </div>

          {/* Rarity breakdown */}
          {rarityEntries.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-center" style={{ color: 'hsl(150 10% 40%)' }}>
                Rarity Breakdown
              </p>
              <div className="space-y-1">
                {rarityEntries.map(rarity => (
                  <div key={rarity} className="flex items-center gap-2 px-1">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: RARITY_HEX[rarity] }}
                    />
                    <span className="text-[11px] font-semibold flex-1" style={{ color: RARITY_HEX[rarity] }}>
                      {RARITY_LABEL[rarity]}
                    </span>
                    <span className="text-[11px] font-black tabular-nums text-[hsl(var(--foreground))]">
                      {displayStats.rarityBreakdown[rarity]}
                    </span>
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted)/0.3)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(displayStats.rarityBreakdown[rarity] / displayStats.totalPets) * 100}%`,
                          backgroundColor: RARITY_HEX[rarity],
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleClose}
            className="retro-arcade-btn retro-arcade-btn-green w-full py-3 text-sm tracking-wider touch-manipulation"
          >
            Start New Island
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
