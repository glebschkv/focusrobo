/**
 * LandPreviewModal — Read-only preview of a completed island with all its pets.
 * Renders a scaled-down IslandSVG + IslandPet for each cell.
 */

import { useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { IslandSVG } from '@/components/IslandSVG';
import { IslandPet } from '@/components/IslandPet';
import { getAvailableCellCount } from '@/data/islandPositions';
import { getIslandTheme } from '@/data/IslandThemes';
import type { Land } from '@/stores/landStore';

interface LandPreviewModalProps {
  land: Land;
  isOpen: boolean;
  onClose: () => void;
}

export function LandPreviewModal({ land, isOpen, onClose }: LandPreviewModalProps) {
  const cellCount = land.cells.filter(Boolean).length;
  const totalCells = getAvailableCellCount(land.gridSize);
  const focusHours = Math.round(land.totalFocusMinutes / 60 * 10) / 10;
  const theme = getIslandTheme(land.theme || 'day');
  const skyGradient = `linear-gradient(180deg, ${theme.sky.map((c, i) => `${c} ${Math.round((i / (theme.sky.length - 1)) * 100)}%`).join(', ')})`;

  // Count rarities
  const rarities = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
  land.cells.forEach((cell) => {
    if (cell) rarities[cell.rarity]++;
  });

  const handleNoop = useCallback(() => {}, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[360px] p-0 overflow-hidden border-0 rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>Land {land.number} Preview</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
            Land {land.number}
          </h3>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {land.completedAt ? new Date(land.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Completed'}
          </p>
        </div>

        {/* Mini island preview */}
        <div
          className="relative mx-4 overflow-hidden rounded-xl"
          style={{
            background: skyGradient,
            aspectRatio: '2 / 1.4',
          }}
        >
          <div className="relative" style={{ width: '100%', aspectRatio: '2 / 1.3' }}>
            {/* Island SVG */}
            <div style={{ position: 'absolute', inset: '5% 5% 15% 5%' }}>
              <IslandSVG gridSize={land.gridSize} themeId={land.theme || 'day'} />
            </div>

            {/* Pets overlay */}
            <div style={{ position: 'absolute', inset: '5% 5% 15% 5%' }}>
              {land.cells.map((cell, index) => {
                if (!cell) return null;
                return (
                  <IslandPet
                    key={`preview-${index}`}
                    cell={cell}
                    index={index}
                    gridSize={land.gridSize}
                    showTooltip={false}
                    onToggleTooltip={handleNoop}
                    reducedAnimations
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-[hsl(var(--foreground))]">{cellCount}</p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Pets</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[hsl(var(--foreground))]">{focusHours}h</p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Focus time</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[hsl(var(--foreground))]">{totalCells}</p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Capacity</p>
          </div>
        </div>

        {/* Rarity breakdown */}
        <div className="px-4 pb-4 flex gap-2 justify-center flex-wrap">
          {rarities.legendary > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              {rarities.legendary} Legendary
            </span>
          )}
          {rarities.epic > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">
              {rarities.epic} Epic
            </span>
          )}
          {rarities.rare > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 border border-sky-200">
              {rarities.rare} Rare
            </span>
          )}
          {rarities.uncommon > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              {rarities.uncommon} Uncommon
            </span>
          )}
          {rarities.common > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
              {rarities.common} Common
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
