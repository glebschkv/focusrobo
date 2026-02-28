import { memo } from 'react';
import { Flame, Star } from 'lucide-react';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface HangarStatsProps {
  streak: number;
  level: number;
  botCount: number;
}

/**
 * HangarStats — Holographic-style stat readouts.
 * Shows streak, level, and total bots collected.
 */
export const HangarStats = memo(({ streak, level, botCount }: HangarStatsProps) => {
  return (
    <div className="flex items-center justify-center gap-6 px-4">
      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-mono font-bold text-orange-300">
          {streak}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          day{streak !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-700/50" />

      {/* Level */}
      <div className="flex items-center gap-1.5">
        <Star className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-mono font-bold text-amber-300">
          Lv {level}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-slate-700/50" />

      {/* Bots */}
      <div className="flex items-center gap-1.5">
        <PixelIcon name="robot" size={16} />
        <span className="text-sm font-mono font-bold text-cyan-300">
          {botCount}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
          bots
        </span>
      </div>
    </div>
  );
});

HangarStats.displayName = 'HangarStats';
