/**
 * IslandExpansionModal
 *
 * Celebrates when the island expands to a new tier.
 * Triggered by the 'islandExpanded' custom event from landStore.
 */

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface ExpansionData {
  oldTier: number;
  newTier: number;
  newCells: number;
}

export const IslandExpansionModal = () => {
  const [data, setData] = useState<ExpansionData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const lastDataRef = useRef<ExpansionData | null>(null);

  useEffect(() => {
    const handleExpansion = (e: CustomEvent<ExpansionData>) => {
      const detail = e.detail;
      lastDataRef.current = detail;
      setData(detail);
      setIsOpen(true);
    };
    window.addEventListener('islandExpanded', handleExpansion as EventListener);
    return () => {
      window.removeEventListener('islandExpanded', handleExpansion as EventListener);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const displayData = data || lastDataRef.current;
  if (!displayData) return null;

  return (
    <Dialog open={isOpen && !!displayData} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="retro-modal max-w-[300px] p-0 overflow-hidden border-0">
        <VisuallyHidden>
          <DialogTitle>Island Expanded</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="retro-modal-header p-5 text-center relative">
          <div className="retro-scanlines opacity-20" />
          <div className="relative z-[1]">
            <div
              className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: 'hsl(152 44% 45%)',
                border: '2px solid hsl(152 40% 38%)',
                boxShadow: '0 2px 0 hsl(152 40% 32%)',
              }}
            >
              <PixelIcon name="sparkles" size={28} />
            </div>
            <h2
              className="text-lg font-black uppercase tracking-tight"
              style={{ color: 'hsl(150 10% 12%)' }}
            >
              Island Expanded!
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Size change */}
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-black text-[hsl(var(--muted-foreground))]">
                {displayData.oldTier}×{displayData.oldTier}
              </p>
              <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground)/0.5)]">
                {displayData.oldTier * displayData.oldTier} cells
              </p>
            </div>
            <PixelIcon name="arrow-right" size={20} className="text-emerald-500" />
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600">
                {displayData.newTier}×{displayData.newTier}
              </p>
              <p className="text-[11px] font-semibold text-emerald-500/70">
                {displayData.newTier * displayData.newTier} cells
              </p>
            </div>
          </div>

          {/* New cells info */}
          <div className="retro-reward-item flex-col !items-center !gap-1 py-3">
            <div className="flex items-center gap-2">
              <PixelIcon name="paw" size={16} />
              <span className="text-sm font-bold text-emerald-600">
                +{displayData.newCells} new spots
              </span>
            </div>
            <p className="text-[11px] text-[hsl(var(--muted-foreground)/0.6)]">
              More room for your pets to explore!
            </p>
          </div>

          <button
            onClick={handleClose}
            className="retro-arcade-btn retro-arcade-btn-green w-full py-3 text-sm tracking-wider touch-manipulation"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
