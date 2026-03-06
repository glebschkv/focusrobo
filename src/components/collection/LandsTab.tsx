import { memo, useMemo } from 'react';
import { PixelIcon } from '@/components/ui/PixelIcon';
import type { Land } from '@/stores/landStore';
import { getAvailableCellCount } from '@/data/islandPositions';

interface LandsTabProps {
  currentLand: Land;
  completedLands: Land[];
  filledCells: number;
}

export const LandsTab = memo(({ currentLand, completedLands, filledCells }: LandsTabProps) => {
  const reversedLands = useMemo(
    () => [...completedLands].reverse(),
    [completedLands],
  );

  const availableCells = getAvailableCellCount(currentLand.gridSize);
  const progressPct = availableCells > 0 ? Math.min(100, Math.round((filledCells / availableCells) * 100)) : 0;

  return (
    <div className="px-4 pt-3 pb-28">
      {/* Current land card */}
      <div className="collection-land-current">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[hsl(var(--primary)/0.12)] flex items-center justify-center">
              <PixelIcon name="sprout" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">Land {currentLand.number}</h3>
              <span className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">In Progress</span>
            </div>
          </div>
          <span className="text-2xl font-black text-[hsl(var(--primary))]">{filledCells}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 rounded-full bg-[hsl(var(--muted)/0.5)] overflow-hidden mb-2">
          <div
            className="h-full rounded-full collection-progress-fill transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
          <span>{filledCells}/{availableCells} pets placed</span>
          <span>{Math.round(currentLand.totalFocusMinutes / 60 * 10) / 10}h focused</span>
        </div>
      </div>

      {/* Completed lands */}
      {completedLands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted)/0.4)] flex items-center justify-center mb-3">
            <PixelIcon name="island" size={24} />
          </div>
          <p className="text-sm font-bold text-[hsl(var(--foreground))] mb-1">No lands completed yet</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-[220px]">Fill all cells to complete your first land!</p>
        </div>
      ) : (
        <div className="space-y-2.5 mt-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">Completed</p>
          {reversedLands.map((land) => (
            <div key={land.id} className="collection-land-completed">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <PixelIcon name="star" size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[hsl(var(--foreground))]">Land {land.number}</h4>
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                      {land.completedAt ? new Date(land.completedAt).toLocaleDateString() : 'Completed'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[hsl(var(--foreground))]">{Math.round(land.totalFocusMinutes / 60 * 10) / 10}h</p>
                  <p className="text-[10px] font-semibold text-[hsl(var(--primary))]">
                    {getAvailableCellCount(land.gridSize)}/{getAvailableCellCount(land.gridSize)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
LandsTab.displayName = 'LandsTab';
