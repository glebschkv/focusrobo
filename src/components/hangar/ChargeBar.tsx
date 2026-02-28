import { memo } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChargeBarProps {
  chargePercent: number;
  isCharging?: boolean;
  focusMinutesToday?: number;
}

/**
 * ChargeBar — Atelier thin progress bar for daily focus charge.
 */
export const ChargeBar = memo(({ chargePercent, isCharging = false, focusMinutesToday = 0 }: ChargeBarProps) => {
  const displayPercent = Math.min(100, Math.max(0, chargePercent));
  const hours = Math.floor(focusMinutesToday / 60);
  const minutes = focusMinutesToday % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="w-full px-8">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className={cn(
            "w-3 h-3 transition-colors",
            isCharging ? "text-sky-500" : "text-stone-400"
          )} />
          <span className="text-[11px] font-medium tracking-[0.1em] uppercase text-stone-400">
            Daily Charge
          </span>
        </div>
        <span className="text-[11px] font-medium text-stone-400 tabular-nums">
          {timeDisplay}
        </span>
      </div>

      {/* Thin progress bar */}
      <div className="relative h-1.5 rounded-full bg-stone-200 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            isCharging ? "bg-sky-500" : "bg-sky-400"
          )}
          style={{ width: `${displayPercent}%` }}
        />
      </div>
    </div>
  );
});

ChargeBar.displayName = 'ChargeBar';
