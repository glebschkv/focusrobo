import { memo, useMemo, useState, useCallback } from 'react';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { LandPreviewModal } from '@/components/collection/LandPreviewModal';
import type { Land } from '@/stores/landStore';
import { getAvailableCellCount } from '@/data/islandPositions';

interface LandsTabProps {
  currentLand: Land;
  completedLands: Land[];
  filledCells: number;
}

/** Group lands by time period */
function groupByPeriod(lands: Land[]): { label: string; lands: Land[] }[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const groups: { label: string; lands: Land[] }[] = [];
  const thisWeek: Land[] = [];
  const thisMonth: Land[] = [];
  const earlier: Land[] = [];

  // Process in reverse chronological order
  const sorted = [...lands].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  for (const land of sorted) {
    const completedAt = land.completedAt ? new Date(land.completedAt) : new Date(0);
    if (completedAt >= startOfWeek) {
      thisWeek.push(land);
    } else if (completedAt >= startOfMonth) {
      thisMonth.push(land);
    } else {
      earlier.push(land);
    }
  }

  if (thisWeek.length > 0) groups.push({ label: 'This Week', lands: thisWeek });
  if (thisMonth.length > 0) groups.push({ label: 'This Month', lands: thisMonth });
  if (earlier.length > 0) groups.push({ label: 'Earlier', lands: earlier });

  return groups;
}

export const LandsTab = memo(({ currentLand, completedLands, filledCells }: LandsTabProps) => {
  const [previewLand, setPreviewLand] = useState<Land | null>(null);

  const groups = useMemo(
    () => groupByPeriod(completedLands),
    [completedLands],
  );

  const availableCells = getAvailableCellCount(currentLand.gridSize);
  const progressPct = availableCells > 0 ? Math.min(100, Math.round((filledCells / availableCells) * 100)) : 0;

  const handlePreview = useCallback((land: Land) => {
    setPreviewLand(land);
  }, []);

  return (
    <div className="px-4 pt-3 dock-clearance">
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

      {/* Completed lands — grouped by time period */}
      {completedLands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted)/0.4)] flex items-center justify-center mb-3">
            <PixelIcon name="island" size={24} />
          </div>
          <p className="text-sm font-bold text-[hsl(var(--foreground))] mb-1">No lands completed yet</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-[220px]">Fill all cells to complete your first land!</p>
        </div>
      ) : (
        <div className="space-y-4 mt-3">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.lands.map((land) => (
                  <button
                    key={land.id}
                    className="collection-land-completed w-full text-left transition-transform active:scale-[0.98] touch-manipulation"
                    onClick={() => handlePreview(land)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                          <PixelIcon name="star" size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[hsl(var(--foreground))]">Land {land.number}</h4>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            {land.completedAt ? new Date(land.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Completed'}
                            {' · '}{land.cells.filter(Boolean).length} pets
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="text-xs font-bold text-[hsl(var(--foreground))]">{Math.round(land.totalFocusMinutes / 60 * 10) / 10}h</p>
                          <p className="text-[10px] font-semibold text-[hsl(var(--primary))]">
                            {getAvailableCellCount(land.gridSize)} cells
                          </p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[hsl(var(--muted-foreground))]">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Land preview modal */}
      {previewLand && (
        <LandPreviewModal
          land={previewLand}
          isOpen={!!previewLand}
          onClose={() => setPreviewLand(null)}
        />
      )}
    </div>
  );
});
LandsTab.displayName = 'LandsTab';
