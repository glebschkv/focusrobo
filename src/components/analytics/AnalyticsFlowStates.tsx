import { Droplets, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlowStats } from "@/types/analytics";

interface FlowStatesProps {
  stats: FlowStats;
}

export const AnalyticsFlowStates = ({ stats }: FlowStatesProps) => {
  const { totalFlowSessions, flowRate, longestFlowStreak, currentFlowStreak } = stats;

  // Mini ring for flow rate
  const size = 56;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (flowRate / 100) * circumference;

  const flowGrade = flowRate >= 50 ? 'Elite' : flowRate >= 30 ? 'Strong' : flowRate >= 15 ? 'Growing' : 'Building';
  const gradeColor = flowRate >= 50 ? 'text-violet-400' : flowRate >= 30 ? 'text-blue-400' : flowRate >= 15 ? 'text-green-400' : 'text-muted-foreground';

  return (
    <div className="retro-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Droplets className="w-4 h-4 text-violet-500" />
        <span className="text-sm font-bold">Flow States</span>
        <div className="ml-auto group relative">
          <Info className="w-3.5 h-3.5 text-muted-foreground/40 cursor-help" />
          <div className="absolute right-0 top-5 z-10 hidden group-hover:block bg-card border border-border rounded-lg p-2 shadow-lg w-44">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Flow = 45+ min session, completed, zero distractions (perfect quality)
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Flow rate ring */}
        <div className="relative flex-shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="none"
              className="text-muted/20"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn("transition-all duration-700", flowRate >= 50 ? "text-violet-500" : "text-violet-400")}
              style={{
                filter: flowRate >= 50 ? 'drop-shadow(0 0 4px hsl(270 60% 60% / 0.4))' : undefined,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-extrabold tabular-nums">{flowRate}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">Flow Sessions</span>
            <span className="text-sm font-extrabold tabular-nums">{totalFlowSessions}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-medium">Longest Streak</span>
            <span className="text-xs font-bold tabular-nums">{longestFlowStreak}</span>
          </div>
          {currentFlowStreak > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium">Current Streak</span>
              <span className="text-xs font-bold tabular-nums text-violet-500">{currentFlowStreak}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-border/20">
            <span className="text-[10px] text-muted-foreground font-medium">Flow Grade</span>
            <span className={cn("text-xs font-bold", gradeColor)}>{flowGrade}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
