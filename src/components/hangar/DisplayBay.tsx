import { memo } from 'react';
import { cn } from '@/lib/utils';

interface DisplayBayProps {
  robotImage?: string;
  robotName?: string;
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * DisplayBay — Atelier mini robot card.
 * Small floating robot on white, tappable to swap.
 */
export const DisplayBay = memo(({ robotImage, robotName, isActive = false, onClick }: DisplayBayProps) => {
  return (
    <button
      className={cn(
        "relative w-[68px] h-[76px] rounded-xl border flex items-center justify-center transition-all duration-200",
        "touch-manipulation select-none active:scale-95",
        isActive
          ? "border-sky-300 bg-sky-50 shadow-sm"
          : "border-stone-200 bg-white hover:border-stone-300"
      )}
      onClick={onClick}
    >
      {robotImage ? (
        <img
          src={robotImage}
          alt={robotName || 'Robot'}
          className="w-11 h-11 object-contain"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
      ) : (
        <div className="w-11 h-11 rounded-lg flex items-center justify-center text-lg bg-stone-50 border border-stone-200">
          🤖
        </div>
      )}

      {/* Active dot */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-500" />
      )}
    </button>
  );
});

DisplayBay.displayName = 'DisplayBay';
