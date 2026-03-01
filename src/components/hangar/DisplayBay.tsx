import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface DisplayBayProps {
  robotImage?: string;
  robotName?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  isActive?: boolean;
  onClick?: () => void;
}

const RARITY_COLORS: Record<string, { border: string; glow: string; bg: string }> = {
  common: { border: 'rgba(168,162,158,0.35)', glow: 'rgba(168,162,158,0.1)', bg: 'rgba(168,162,158,0.04)' },
  rare: { border: 'rgba(59,130,246,0.4)', glow: 'rgba(59,130,246,0.12)', bg: 'rgba(59,130,246,0.05)' },
  epic: { border: 'rgba(139,92,246,0.4)', glow: 'rgba(139,92,246,0.12)', bg: 'rgba(139,92,246,0.05)' },
  legendary: { border: 'rgba(245,158,11,0.5)', glow: 'rgba(245,158,11,0.15)', bg: 'rgba(245,158,11,0.06)' },
};

/**
 * DisplayBay — Glassmorphic mini robot card with rarity glow.
 * Premium feel with subtle border color based on bot rarity.
 */
export const DisplayBay = memo(({ robotImage, robotName, rarity = 'common', isActive = false, onClick }: DisplayBayProps) => {
  const rarityStyle = useMemo(() => {
    const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
    return {
      borderColor: isActive ? colors.border : 'rgba(214,211,209,0.5)',
      background: isActive
        ? `linear-gradient(135deg, ${colors.bg}, rgba(255,255,255,0.85))`
        : 'rgba(255,255,255,0.75)',
      boxShadow: isActive
        ? `0 2px 12px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.5)`
        : '0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
    };
  }, [rarity, isActive]);

  return (
    <button
      className={cn(
        "relative w-[72px] h-[80px] rounded-2xl flex flex-col items-center justify-center transition-all duration-200",
        "touch-manipulation select-none active:scale-95 backdrop-blur-sm",
      )}
      style={{
        border: '1px solid',
        ...rarityStyle,
      }}
      onClick={onClick}
    >
      {robotImage ? (
        <img
          src={robotImage}
          alt={robotName || 'Robot'}
          className="w-12 h-12 object-contain"
          draggable={false}
        />
      ) : (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg bg-stone-50/50 border border-stone-200/30">
          <span className="opacity-20">?</span>
        </div>
      )}

      {/* Rarity indicator bar */}
      <div
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-200"
        style={{
          width: isActive ? '20px' : '12px',
          background: isActive
            ? (RARITY_COLORS[rarity] || RARITY_COLORS.common).border
            : 'rgba(168,162,158,0.2)',
        }}
      />
    </button>
  );
});

DisplayBay.displayName = 'DisplayBay';
