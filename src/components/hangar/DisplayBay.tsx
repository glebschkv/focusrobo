import { memo } from 'react';
import { cn } from '@/lib/utils';

interface DisplayBayProps {
  robotImage?: string;
  robotName?: string;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * DisplayBay — Small robot showcase pod.
 * Shows a miniature robot in a dimly lit bay.
 * Tappable to swap active robot.
 */
export const DisplayBay = memo(({ robotImage, robotName, isActive = false, onClick }: DisplayBayProps) => {
  return (
    <button
      className={cn(
        "relative w-[72px] h-20 rounded-lg border flex items-center justify-center transition-all duration-300",
        "touch-manipulation select-none active:scale-95",
        isActive
          ? "border-cyan-400/50 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          : "border-slate-700/40 bg-slate-900/30 hover:border-slate-600/50"
      )}
      onClick={onClick}
    >
      {robotImage ? (
        <img
          src={robotImage}
          alt={robotName || 'Robot'}
          className="w-12 h-12 object-contain pixelated"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
      ) : (
        <div className="w-12 h-12 rounded-md flex items-center justify-center text-xl bg-slate-800/40 border border-slate-700/20">
          🤖
        </div>
      )}

      {/* Active indicator dot */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
      )}
    </button>
  );
});

DisplayBay.displayName = 'DisplayBay';
