import { memo } from 'react';
import { Flame, Star } from 'lucide-react';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface HangarStatsProps {
  streak: number;
  level: number;
  botCount: number;
}

/**
 * HangarStats — Atelier thin stat line.
 * Minimal text stats below robot.
 */
export const HangarStats = memo(({ streak, level, botCount }: HangarStatsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 px-4">
      <span className="text-xs font-medium text-stone-400">
        Level {level}
      </span>
      <span className="text-stone-300">·</span>
      <span className="text-xs font-medium text-stone-400">
        {streak} day streak
      </span>
      <span className="text-stone-300">·</span>
      <span className="text-xs font-medium text-stone-400">
        {botCount} bots
      </span>
    </div>
  );
});

HangarStats.displayName = 'HangarStats';
