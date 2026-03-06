import { Pentagon } from "lucide-react";
import { RadarDataPoint } from "@/types/analytics";

interface RadarChartProps {
  data: RadarDataPoint[];
}

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 75;
const LEVELS = 4;

// Calculate point on the radar for a given axis index and value (0-100)
const getPoint = (index: number, value: number, total: number): { x: number; y: number } => {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2; // Start from top
  const r = (value / 100) * RADIUS;
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
};

const getPolygonPoints = (data: RadarDataPoint[], valueKey: 'value' | 'previousValue'): string => {
  return data
    .map((d, i) => {
      const val = valueKey === 'previousValue' ? (d.previousValue ?? 0) : d.value;
      const { x, y } = getPoint(i, val, data.length);
      return `${x},${y}`;
    })
    .join(' ');
};

export const AnalyticsRadarChart = ({ data }: RadarChartProps) => {
  if (data.length === 0) return null;

  const hasPrevious = data.some(d => d.previousValue !== undefined && d.previousValue > 0);

  return (
    <div className="retro-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Pentagon className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold">Focus Profile</span>
        <span className="ml-auto text-[10px] text-muted-foreground">Last 30 days</span>
      </div>

      <div className="flex justify-center">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {/* Background grid levels */}
          {Array.from({ length: LEVELS }, (_, level) => {
            const levelValue = ((level + 1) / LEVELS) * 100;
            const points = data
              .map((_, i) => {
                const { x, y } = getPoint(i, levelValue, data.length);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polygon
                key={level}
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted/20"
              />
            );
          })}

          {/* Axis lines */}
          {data.map((_, i) => {
            const { x, y } = getPoint(i, 100, data.length);
            return (
              <line
                key={`axis-${i}`}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-muted/15"
              />
            );
          })}

          {/* Previous week polygon (outline only) */}
          {hasPrevious && (
            <polygon
              points={getPolygonPoints(data, 'previousValue')}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="text-muted-foreground/30"
            />
          )}

          {/* Current week polygon (filled) */}
          <polygon
            points={getPolygonPoints(data, 'value')}
            fill="currentColor"
            fillOpacity="0.15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            className="text-primary"
          />

          {/* Data points */}
          {data.map((d, i) => {
            const { x, y } = getPoint(i, d.value, data.length);
            return (
              <circle
                key={`point-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="currentColor"
                className="text-primary"
              />
            );
          })}

          {/* Labels */}
          {data.map((d, i) => {
            const { x, y } = getPoint(i, 118, data.length);
            return (
              <g key={`label-${i}`}>
                <text
                  x={x}
                  y={y - 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-[9px] font-bold"
                >
                  {d.axis}
                </text>
                <text
                  x={x}
                  y={y + 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[8px] tabular-nums"
                >
                  {d.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded bg-primary" />
          <span>This period</span>
        </div>
        {hasPrevious && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded border-t border-dashed border-muted-foreground/40" />
            <span>Previous</span>
          </div>
        )}
      </div>
    </div>
  );
};
