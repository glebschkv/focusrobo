import { memo } from 'react';
import { Flame, Star, Bot } from 'lucide-react';

interface HangarStatsProps {
  streak: number;
  level: number;
  botCount: number;
}

/**
 * HangarStats — Pill-style stat badges with icons.
 * Refined glassmorphic chips for level, streak, and bot count.
 */
export const HangarStats = memo(({ streak, level, botCount }: HangarStatsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 px-4">
      {/* Level pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(14,165,233,0.06)',
          border: '1px solid rgba(14,165,233,0.12)',
        }}
      >
        <Star className="w-3 h-3 text-sky-500" strokeWidth={2.5} />
        <span className="text-[11px] font-semibold text-sky-700 tabular-nums">
          Lv. {level}
        </span>
      </div>

      {/* Streak pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: streak >= 3 ? 'rgba(245,158,11,0.06)' : 'rgba(168,162,158,0.06)',
          border: `1px solid ${streak >= 3 ? 'rgba(245,158,11,0.15)' : 'rgba(168,162,158,0.12)'}`,
        }}
      >
        <Flame className={`w-3 h-3 ${streak >= 3 ? 'text-amber-500' : 'text-stone-400'}`} strokeWidth={2.5} />
        <span className={`text-[11px] font-semibold tabular-nums ${streak >= 3 ? 'text-amber-700' : 'text-stone-500'}`}>
          {streak}d
        </span>
      </div>

      {/* Bot count pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{
          background: 'rgba(168,162,158,0.06)',
          border: '1px solid rgba(168,162,158,0.12)',
        }}
      >
        <Bot className="w-3 h-3 text-stone-400" strokeWidth={2.5} />
        <span className="text-[11px] font-semibold text-stone-500 tabular-nums">
          {botCount}
        </span>
      </div>
    </div>
  );
});

HangarStats.displayName = 'HangarStats';
