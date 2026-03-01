import { memo } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChargeBarProps {
  chargePercent: number;
  isCharging?: boolean;
  focusMinutesToday?: number;
}

/**
 * ChargeBar — Premium progress bar with gradient fill,
 * animated shimmer, and refined typography.
 */
export const ChargeBar = memo(({ chargePercent, isCharging = false, focusMinutesToday = 0 }: ChargeBarProps) => {
  const displayPercent = Math.min(100, Math.max(0, chargePercent));
  const hours = Math.floor(focusMinutesToday / 60);
  const minutes = focusMinutesToday % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="w-full px-10">
      {/* Label row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "flex items-center justify-center w-5 h-5 rounded-md transition-all duration-300",
            isCharging
              ? "bg-sky-500/10"
              : "bg-stone-100"
          )}>
            <Zap className={cn(
              "w-3 h-3 transition-colors duration-300",
              isCharging ? "text-sky-500" : "text-stone-400"
            )} strokeWidth={2.5} />
          </div>
          <span className={cn(
            "text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors duration-300",
            isCharging ? "text-stone-500" : "text-stone-400"
          )}>
            Daily Charge
          </span>
        </div>
        <span className={cn(
          "text-[12px] font-semibold tabular-nums transition-colors duration-300",
          isCharging ? "text-sky-600" : "text-stone-400"
        )}>
          {timeDisplay}
        </span>
      </div>

      {/* Premium progress bar */}
      <div className="relative h-2 rounded-full bg-stone-100 overflow-hidden"
        style={{
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        {/* Fill with gradient */}
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
          style={{
            width: `${displayPercent}%`,
            background: isCharging
              ? 'linear-gradient(90deg, #0ea5e9, #38bdf8, #0ea5e9)'
              : 'linear-gradient(90deg, #7dd3fc, #38bdf8)',
            boxShadow: isCharging
              ? '0 0 12px rgba(14,165,233,0.3)'
              : 'none',
          }}
        >
          {/* Animated shimmer */}
          {isCharging && (
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                animation: 'charge-shimmer 2s ease-in-out infinite',
              }}
            />
          )}
        </div>

        {/* End cap glow when charging */}
        {isCharging && displayPercent > 5 && (
          <div
            className="absolute top-0 h-full w-3 rounded-full"
            style={{
              left: `calc(${displayPercent}% - 6px)`,
              background: 'rgba(255,255,255,0.6)',
              filter: 'blur(2px)',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes charge-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
});

ChargeBar.displayName = 'ChargeBar';
