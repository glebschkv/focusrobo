import { CalendarClock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartSchedule } from "@/types/analytics";

interface SmartScheduleProps {
  schedule: SmartSchedule;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatHour = (h: number): string => {
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
};

export const AnalyticsSmartSchedule = ({ schedule }: SmartScheduleProps) => {
  const { topSlots, bestDay, peakHours, matrix } = schedule;

  // Find max minutes for intensity scaling
  let maxMinutes = 0;
  Object.values(matrix).forEach(slot => {
    if (slot.totalMinutes > maxMinutes) maxMinutes = slot.totalMinutes;
  });

  // Check if a cell is in top slots
  const isTopSlot = (day: number, hour: number): boolean => {
    return topSlots.some(s => s.dayOfWeek === day && s.hour === hour);
  };

  const getIntensityClass = (minutes: number): string => {
    if (minutes === 0 || maxMinutes === 0) return 'bg-muted/10';
    const ratio = minutes / maxMinutes;
    if (ratio >= 0.75) return 'bg-primary/80';
    if (ratio >= 0.5) return 'bg-primary/60';
    if (ratio >= 0.25) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  // Show every 4th hour label for readability
  const hourLabels = [0, 4, 8, 12, 16, 20];

  return (
    <div className="retro-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">Smart Schedule</span>
        <span className="ml-auto text-[10px] text-muted-foreground">All time</span>
      </div>

      {/* Top recommendations */}
      {topSlots.length > 0 && (
        <div className="mb-3 space-y-1">
          {topSlots.slice(0, 2).map((slot, i) => (
            <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
              <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />
              <span className="text-[10px] font-medium">
                <span className="font-bold">{DAY_FULL[slot.dayOfWeek]}s {formatHour(slot.hour)}-{formatHour(slot.hour + 1)}</span>
                <span className="text-muted-foreground ml-1">({slot.completionRate}% completion)</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 7×24 heatmap grid */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[280px]">
          {/* Hour labels */}
          <div className="flex mb-0.5 pl-7">
            {hourLabels.map(h => (
              <div
                key={h}
                className="text-[7px] text-muted-foreground/50"
                style={{ width: `${((4) / 24) * 100}%` }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {DAY_LABELS.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-0.5 mb-0.5">
              <span className="text-[7px] text-muted-foreground w-6 text-right pr-1 flex-shrink-0">{day}</span>
              <div className="flex gap-px flex-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const key = `${dayIndex}-${hour}`;
                  const slot = matrix[key];
                  const minutes = slot?.totalMinutes || 0;
                  const isTop = isTopSlot(dayIndex, hour);

                  return (
                    <div
                      key={hour}
                      className={cn(
                        "flex-1 h-3 rounded-[1px] transition-colors relative",
                        getIntensityClass(minutes),
                        isTop && "ring-1 ring-amber-500/60"
                      )}
                      title={`${DAY_FULL[dayIndex]} ${formatHour(hour)}: ${Math.round(minutes)}min`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/30">
        <div className="text-[10px]">
          <span className="text-muted-foreground">Best day: </span>
          <span className="font-bold">{DAY_FULL[bestDay.day]}</span>
        </div>
        {peakHours.length > 0 && (
          <div className="text-[10px]">
            <span className="text-muted-foreground">Peak: </span>
            <span className="font-bold">{peakHours.map(h => formatHour(h)).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Legend */}
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
