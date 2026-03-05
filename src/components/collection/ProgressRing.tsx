import { memo } from 'react';

/** Circular progress ring — SVG-based, uses shared design tokens. */
export const ProgressRing = memo(({
  percent,
  size = 44,
  stroke = 3.5,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) => {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
});
ProgressRing.displayName = 'ProgressRing';
