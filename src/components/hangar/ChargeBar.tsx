import { memo } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChargeBarProps {
  chargePercent: number;
  isCharging?: boolean;
  focusMinutesToday?: number;
}

/**
 * ChargeBar — Horizontal progress bar showing daily focus charge.
 * Fills based on total focus time today. 2 hours = 100%.
 */
export const ChargeBar = memo(({ chargePercent, isCharging = false, focusMinutesToday = 0 }: ChargeBarProps) => {
  const displayPercent = Math.min(100, Math.max(0, chargePercent));
  const hours = Math.floor(focusMinutesToday / 60);
  const minutes = focusMinutesToday % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="w-full px-6">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className={cn(
            "w-3.5 h-3.5 transition-colors",
            isCharging ? "text-cyan-400" : "text-cyan-600"
          )} />
          <span className="text-xs font-mono font-bold text-cyan-400/80 tracking-wider uppercase">
            Charge
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {timeDisplay} today
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-2.5 rounded-full bg-slate-800/60 border border-slate-700/30 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out relative",
            isCharging
              ? "bg-gradient-to-r from-cyan-500 to-cyan-300"
              : "bg-gradient-to-r from-cyan-700 to-cyan-500"
          )}
          style={{ width: `${displayPercent}%` }}
        >
          {/* Shimmer effect when charging */}
          {isCharging && (
            <div
              className="absolute inset-0 overflow-hidden rounded-full"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                  animation: 'charge-shimmer 1.5s ease-in-out infinite',
                }}
              />
            </div>
          )}
        </div>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-mono font-bold text-white/60">
            {Math.round(displayPercent)}%
          </span>
        </div>
      </div>

      <style>{`
        @keyframes charge-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
});

ChargeBar.displayName = 'ChargeBar';
