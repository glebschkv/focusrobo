import { Crown, ChevronRight, Sparkles, Star, Zap, Coins, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WeeklyGameStats } from "@/types/analytics";

interface GamificationPanelProps {
  stats: WeeklyGameStats;
  isPremium: boolean;
  onUpgrade: () => void;
}

export const AnalyticsGamificationPanel = ({ stats, isPremium, onUpgrade }: GamificationPanelProps) => {
  return (
    <div className="retro-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-bold">This Week's Rewards</span>
      </div>

      {/* Always visible: compact pill row */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* Pets earned */}
        <div className="flex flex-col items-center p-2 rounded-lg bg-muted/15">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-pink-500/10 mb-1">
            <Star className="w-3.5 h-3.5 text-pink-500" />
          </div>
          <span className="text-sm font-extrabold tabular-nums">{stats.petsEarned}</span>
          <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider">Pets</span>
        </div>

        {/* XP earned */}
        <div className={cn("flex flex-col items-center p-2 rounded-lg bg-muted/15", !isPremium && "blur-[3px] select-none")}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/10 mb-1">
            <Zap className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <span className="text-sm font-extrabold tabular-nums">{stats.xpEarned}</span>
          <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider">XP</span>
        </div>

        {/* Coins earned */}
        <div className={cn("flex flex-col items-center p-2 rounded-lg bg-muted/15", !isPremium && "blur-[3px] select-none")}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10 mb-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-sm font-extrabold tabular-nums">{stats.coinsEarned}</span>
          <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider">Coins</span>
        </div>

        {/* Island progress */}
        <div className={cn("flex flex-col items-center p-2 rounded-lg bg-muted/15", !isPremium && "blur-[3px] select-none")}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-green-500/10 mb-1">
            <Grid3x3 className="w-3.5 h-3.5 text-green-500" />
          </div>
          <span className="text-sm font-extrabold tabular-nums">{stats.islandProgress}%</span>
          <span className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider">Island</span>
        </div>
      </div>

      {/* Premium details */}
      {isPremium ? (
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-4">
          {stats.rareOrBetter > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">Rare+:</span>
              <span className="font-bold text-blue-500">{stats.rareOrBetter}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Avg/day:</span>
            <span className="font-bold tabular-nums">{stats.petsEarned > 0 ? (stats.petsEarned / 7).toFixed(1) : '0'}</span>
          </div>
        </div>
      ) : (
        <button
          onClick={onUpgrade}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-[0.98] mt-3"
          style={{
            background: 'linear-gradient(135deg, hsl(35 80% 50% / 0.12) 0%, hsl(35 90% 40% / 0.06) 100%)',
            border: '1.5px solid hsl(35 70% 50% / 0.25)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">See full game stats</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-500/60" />
        </button>
      )}
    </div>
  );
};
