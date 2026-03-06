import { useState, useMemo } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FocusSession, FOCUS_CATEGORIES, FocusCategory } from "@/types/analytics";

interface SessionTimelineProps {
  sessions: FocusSession[];
  formatDuration: (seconds: number, format?: 'short' | 'long') => string;
}

const CATEGORY_COLORS: Record<FocusCategory, string> = {
  work: 'bg-blue-500',
  study: 'bg-purple-500',
  creative: 'bg-pink-500',
  personal: 'bg-green-500',
  health: 'bg-orange-500',
  other: 'bg-gray-400',
};

const QUALITY_HEIGHT: Record<string, string> = {
  perfect: 'h-full',
  good: 'h-3/4',
  distracted: 'h-1/2',
};

const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AnalyticsSessionTimeline = ({ sessions, formatDuration }: SessionTimelineProps) => {
  const [dayOffset, setDayOffset] = useState(0); // 0 = today, 1 = yesterday, etc.

  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    return d;
  }, [dayOffset]);

  const dateStr = toLocalDateString(selectedDate);
  const isToday = dayOffset === 0;

  // Filter sessions for selected day
  const daySessions = useMemo(() => {
    return sessions
      .filter(s => {
        const sDate = toLocalDateString(new Date(s.startTime));
        return sDate === dateStr && s.sessionType !== 'break';
      })
      .sort((a, b) => a.startTime - b.startTime);
  }, [sessions, dateStr]);

  // Current time position (percentage of 24h)
  const nowPercent = isToday ? ((new Date().getHours() * 60 + new Date().getMinutes()) / 1440) * 100 : null;

  const formatDateLabel = (date: Date) => {
    if (dayOffset === 0) return 'Today';
    if (dayOffset === 1) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="retro-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">Session Timeline</span>
      </div>

      {/* Day navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setDayOffset(Math.min(6, dayOffset + 1))}
          className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
          disabled={dayOffset >= 6}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-bold">{formatDateLabel(selectedDate)}</span>
        <button
          onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
          className="p-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
          disabled={dayOffset <= 0}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline bar */}
      <div className="relative h-12 bg-muted/10 rounded-lg overflow-hidden border border-border/30">
        {/* Hour markers */}
        {[0, 6, 12, 18].map(hour => (
          <div
            key={hour}
            className="absolute top-0 bottom-0 border-l border-border/20"
            style={{ left: `${(hour / 24) * 100}%` }}
          >
            <span className="absolute -top-0.5 left-1 text-[7px] text-muted-foreground/40 font-medium">
              {hour === 0 ? '12a' : hour === 12 ? '12p' : hour < 12 ? `${hour}a` : `${hour - 12}p`}
            </span>
          </div>
        ))}

        {/* Session blocks */}
        {daySessions.map((session, i) => {
          const startDate = new Date(session.startTime);
          const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
          const durationMinutes = session.actualDuration / 60;
          const left = (startMinutes / 1440) * 100;
          const width = Math.max(0.5, (durationMinutes / 1440) * 100);
          const category = session.category || 'other';
          const quality = session.focusQuality || 'good';
          const heightClass = QUALITY_HEIGHT[quality] || 'h-3/4';
          const colorClass = CATEGORY_COLORS[category];

          return (
            <div
              key={session.id || i}
              className="absolute bottom-0 flex items-end"
              style={{ left: `${left}%`, width: `${width}%` }}
              title={`${formatDuration(session.actualDuration)} ${category} (${quality})`}
            >
              <div
                className={cn(
                  "w-full rounded-t-sm",
                  heightClass,
                  colorClass,
                  session.status === 'completed' ? 'opacity-90' : 'opacity-40'
                )}
                style={{ minWidth: '3px' }}
              />
            </div>
          );
        })}

        {/* Now marker */}
        {nowPercent !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: `${nowPercent}%` }}
          >
            <div className="absolute -top-0.5 -left-1 w-2 h-2 rounded-full bg-red-500" />
          </div>
        )}
      </div>

      {/* Session summary below timeline */}
      {daySessions.length > 0 ? (
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="font-medium">{daySessions.length} session{daySessions.length !== 1 ? 's' : ''}</span>
          <span>{formatDuration(daySessions.reduce((sum, s) => sum + s.actualDuration, 0))} total</span>
          {/* Category legend for visible categories */}
          <div className="flex items-center gap-1.5 ml-auto">
            {Array.from(new Set(daySessions.map(s => s.category || 'other'))).slice(0, 3).map(cat => {
              const catInfo = FOCUS_CATEGORIES.find(c => c.id === cat);
              return (
                <div key={cat} className="flex items-center gap-0.5">
                  <div className={cn("w-1.5 h-1.5 rounded-sm", CATEGORY_COLORS[cat as FocusCategory])} />
                  <span className="text-[8px]">{catInfo?.label || cat}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-2 mt-1">
          <span className="text-[11px] text-muted-foreground">
            {isToday ? "No sessions yet — start focusing!" : "No sessions this day"}
          </span>
        </div>
      )}
    </div>
  );
};
