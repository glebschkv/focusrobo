import { useState } from "react";
import { CalendarDays, Grid3x3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyStats } from "@/types/analytics";

interface HeatmapProps {
  dailyStats: Record<string, DailyStats>;
  dailyGoalMinutes: number;
}

const DAY_NAMES_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatHour = (h: number): string => {
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
};

// ─── Schedule Heatmap (7×24 day×hour) ───
const ScheduleView = ({ dailyStats }: { dailyStats: Record<string, DailyStats> }) => {
  // Build 7×24 matrix
  const matrix: Record<string, number> = {};
  let maxMinutes = 0;

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      matrix[`${d}-${h}`] = 0;
    }
  }

  Object.entries(dailyStats).forEach(([dateStr, stats]) => {
    const date = new Date(dateStr);
    const dayOfWeek = (date.getDay() + 6) % 7; // Monday = 0
    Object.entries(stats.hourlyFocus || {}).forEach(([hour, seconds]) => {
      const key = `${dayOfWeek}-${parseInt(hour)}`;
      const minutes = seconds / 60;
      matrix[key] = (matrix[key] || 0) + minutes;
      if (matrix[key] > maxMinutes) maxMinutes = matrix[key];
    });
  });

  const getIntensity = (minutes: number): string => {
    if (minutes === 0 || maxMinutes === 0) return 'bg-muted/10';
    const ratio = minutes / maxMinutes;
    if (ratio >= 0.75) return 'bg-primary/80';
    if (ratio >= 0.5) return 'bg-primary/60';
    if (ratio >= 0.25) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  const hourLabels = [0, 4, 8, 12, 16, 20];

  return (
    <div>
      {/* Hour labels */}
      <div className="flex mb-0.5 pl-7">
        {hourLabels.map(h => (
          <div key={h} className="text-[7px] text-muted-foreground/50" style={{ width: `${(4 / 24) * 100}%` }}>
            {formatHour(h)}
          </div>
        ))}
      </div>

      {DAY_NAMES_SHORT.map((day, dayIndex) => (
        <div key={day} className="flex items-center gap-0.5 mb-0.5">
          <span className="text-[7px] text-muted-foreground w-6 text-right pr-1 flex-shrink-0">{day}</span>
          <div className="flex gap-px flex-1">
            {Array.from({ length: 24 }, (_, hour) => {
              const minutes = matrix[`${dayIndex}-${hour}`] || 0;
              return (
                <div
                  key={hour}
                  className={cn("flex-1 h-3 rounded-[1px]", getIntensity(minutes))}
                  title={`${day} ${formatHour(hour)}: ${Math.round(minutes)}min`}
                />
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-end gap-1 mt-1.5 text-[8px] text-muted-foreground">
        <span>Less</span>
        <div className="w-2 h-2 rounded-[1px] bg-muted/10" />
        <div className="w-2 h-2 rounded-[1px] bg-primary/20" />
        <div className="w-2 h-2 rounded-[1px] bg-primary/40" />
        <div className="w-2 h-2 rounded-[1px] bg-primary/60" />
        <div className="w-2 h-2 rounded-[1px] bg-primary/80" />
        <span>More</span>
      </div>
    </div>
  );
};

export const AnalyticsHeatmap = ({ dailyStats, dailyGoalMinutes }: HeatmapProps) => {
  const [view, setView] = useState<'activity' | 'schedule'>('activity');
  // Generate last 12 weeks of data (84 days)
  const weeks: { date: string; focusMinutes: number; goalMet: boolean }[][] = [];
  const today = new Date();

  // Start from 11 weeks ago, on a Monday
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 83);
  // Adjust to start on Monday
  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToMonday);

  let currentWeek: { date: string; focusMinutes: number; goalMet: boolean }[] = [];

  for (let i = 0; i < 84; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const stats = dailyStats[dateStr];
    const isFuture = date > today;

    currentWeek.push({
      date: dateStr,
      focusMinutes: isFuture ? -1 : (stats?.totalFocusTime || 0) / 60,
      goalMet: isFuture ? false : (stats?.goalMet || false),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getIntensityClass = (minutes: number, goalMet: boolean) => {
    if (minutes < 0) return "bg-transparent"; // Future date
    if (minutes === 0) return "bg-muted/30";
    if (goalMet) return "bg-green-500";
    if (minutes >= dailyGoalMinutes * 0.75) return "bg-primary/80";
    if (minutes >= dailyGoalMinutes * 0.5) return "bg-primary/60";
    if (minutes >= dailyGoalMinutes * 0.25) return "bg-primary/40";
    return "bg-primary/20";
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Get month markers for the header
  const getMonthMarkers = () => {
    const markers: { month: string; position: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = new Date(week[0].date);
      const month = firstDayOfWeek.getMonth();
      if (month !== lastMonth) {
        markers.push({ month: monthLabels[month], position: weekIndex });
        lastMonth = month;
      }
    });

    return markers;
  };

  const monthMarkers = getMonthMarkers();

  return (
    <div className="retro-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">Activity</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setView('activity')}
            className={cn(
              "px-2 py-0.5 rounded text-[9px] font-bold transition-colors",
              view === 'activity' ? 'bg-primary/10 text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'
            )}
          >
            12 weeks
          </button>
          <button
            onClick={() => setView('schedule')}
            className={cn(
              "px-2 py-0.5 rounded text-[9px] font-bold transition-colors flex items-center gap-0.5",
              view === 'schedule' ? 'bg-primary/10 text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'
            )}
          >
            <Grid3x3 className="w-2.5 h-2.5" />
            Schedule
          </button>
        </div>
      </div>

      {view === 'schedule' ? (
        <ScheduleView dailyStats={dailyStats} />
      ) : (
      <>
      {/* Month labels */}
      <div className="flex mb-1 pl-6">
        {monthMarkers.map((marker, i) => (
          <div
            key={i}
            className="text-[9px] text-muted-foreground"
            style={{
              marginLeft: i === 0 ? `${marker.position * 12}px` : `${(marker.position - monthMarkers[i - 1].position - 1) * 12}px`,
            }}
          >
            {marker.month}
          </div>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 text-[8px] text-muted-foreground pr-1 justify-around">
          <span>M</span>
          <span></span>
          <span>W</span>
          <span></span>
          <span>F</span>
          <span></span>
          <span>S</span>
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-0.5 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "w-2.5 h-2.5 rounded-sm transition-colors",
                    getIntensityClass(day.focusMinutes, day.goalMet)
                  )}
                  title={day.focusMinutes >= 0 ? `${day.date}: ${Math.round(day.focusMinutes)}m` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2 text-[9px] text-muted-foreground">
        <span>Less</span>
        <div className="w-2.5 h-2.5 rounded-sm bg-muted/30" />
        <div className="w-2.5 h-2.5 rounded-sm bg-primary/20" />
        <div className="w-2.5 h-2.5 rounded-sm bg-primary/40" />
        <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
        <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
        <span>More</span>
      </div>
      </>
      )}
    </div>
  );
};
