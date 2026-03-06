import { cn } from "@/lib/utils";

interface StreakFlameProps {
  currentStreak: number;
  lastSessionDate?: string;
  /** Compact mode for stat cards */
  compact?: boolean;
}

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AnalyticsStreakFlame = ({ currentStreak, lastSessionDate, compact = false }: StreakFlameProps) => {
  const today = toLocalDateString(new Date());
  const hasSessionToday = lastSessionDate === today;
  const hour = new Date().getHours();

  // Streak health
  const health: 'safe' | 'warning' | 'danger' =
    hasSessionToday ? 'safe' :
    hour >= 20 ? 'danger' :
    hour >= 14 ? 'warning' :
    'safe';

  const healthColor = health === 'safe' ? 'text-green-500' : health === 'warning' ? 'text-amber-500' : 'text-red-500';
  const healthLabel = health === 'safe' ? (hasSessionToday ? 'Active' : 'OK') : health === 'warning' ? 'Focus soon' : 'At risk!';

  // Flame size based on streak
  const flameSize = currentStreak >= 30 ? 'large' : currentStreak >= 7 ? 'medium' : 'small';

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className={cn(
          "inline-block",
          flameSize === 'large' ? 'text-lg' : flameSize === 'medium' ? 'text-base' : 'text-sm',
          currentStreak > 0 ? 'motion-safe:animate-pulse' : 'opacity-50'
        )}>
          🔥
        </span>
        <span className="text-base font-extrabold tabular-nums">{currentStreak}</span>
      </div>
    );
  }

  // Full streak flame card
  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return toLocalDateString(d);
  });

  return (
    <div className="retro-card p-4">
      <div className="flex items-center gap-3">
        {/* Flame visualization */}
        <div className={cn(
          "relative flex items-center justify-center",
          flameSize === 'large' ? 'w-14 h-14' : flameSize === 'medium' ? 'w-12 h-12' : 'w-10 h-10'
        )}>
          <span className={cn(
            "absolute",
            flameSize === 'large' ? 'text-4xl' : flameSize === 'medium' ? 'text-3xl' : 'text-2xl',
            currentStreak > 0 && "motion-safe:animate-bounce",
          )}
            style={{
              animationDuration: '3s',
              filter: flameSize === 'large' ? 'drop-shadow(0 0 8px rgba(251, 146, 60, 0.5))' :
                      flameSize === 'medium' ? 'drop-shadow(0 0 4px rgba(251, 146, 60, 0.3))' : undefined,
            }}
          >
            🔥
          </span>
        </div>

        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tabular-nums">{currentStreak}</span>
            <span className="text-xs text-muted-foreground font-medium">day streak</span>
          </div>

          {/* Health indicator */}
          <div className={cn("text-[10px] font-bold mt-0.5", healthColor)}>
            {healthLabel}
          </div>

          {/* Mini 7-day calendar */}
          <div className="flex items-center gap-1.5 mt-2">
            {last7Days.map((dateStr) => {
              // Simple heuristic: if date <= lastSessionDate, show as active
              const isActive = lastSessionDate ? dateStr <= lastSessionDate : false;
              const isCurrentDay = dateStr === today;
              return (
                <div
                  key={dateStr}
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center text-[9px]",
                    isActive ? "bg-orange-500/20" : "bg-muted/20",
                    isCurrentDay && "ring-1 ring-orange-400/50"
                  )}
                >
                  {isActive ? '🔥' : <span className="text-muted-foreground/30">·</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
