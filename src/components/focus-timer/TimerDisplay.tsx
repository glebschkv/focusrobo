import { useMemo } from "react";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { TimerPreset, formatTime, MAX_COUNTUP_DURATION } from "./constants";
import { ariaLabel, formatTimeForScreenReader } from "@/lib/accessibility";
import { useThemeColors, withAlpha } from "./backgrounds/ThemeContext";

interface TimerDisplayProps {
  preset: TimerPreset;
  timeLeft: number;
  sessionDuration: number;
  isRunning: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isCountup?: boolean;
  elapsedTime?: number;
}

export const TimerDisplay = ({
  preset,
  timeLeft,
  sessionDuration,
  isRunning,
  soundEnabled,
  onToggleSound,
  isCountup = false,
  elapsedTime = 0
}: TimerDisplayProps) => {
  const { colors } = useThemeColors();

  const displayTime = isCountup ? elapsedTime : timeLeft;

  const progress = isCountup
    ? (elapsedTime / MAX_COUNTUP_DURATION) * 100
    : sessionDuration > 0 ? ((sessionDuration - timeLeft) / sessionDuration) * 100 : 0;
  const progressPercent = Math.round(progress);

  const ringSize = 240;
  const isFinalStretch = !isCountup && timeLeft <= 300 && isRunning; // last 5 min
  const strokeWidth = isFinalStretch ? 14 : 12;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color progression based on progress %
  const ringColors = useMemo(() => {
    if (progress < 40) {
      // Default theme colors
      return { start: colors.ringStart, mid: colors.ringMid, end: colors.ringEnd, glow: colors.glow };
    } else if (progress < 80) {
      // Warm amber transition — these are decorative progress colors, not text
      return { start: 'hsl(35 80% 55%)', mid: 'hsl(40 70% 50%)', end: 'hsl(45 75% 55%)', glow: 'hsl(40 70% 50% / 0.4)' };
    } else {
      // Green finish — decorative progress colors
      return { start: 'hsl(142 60% 50%)', mid: 'hsl(152 55% 45%)', end: 'hsl(160 50% 50%)', glow: 'hsl(142 60% 50% / 0.4)' };
    }
  }, [progress, colors]);

  // Sparkle positions around the ring for final stretch
  const sparklePositions = useMemo(() => {
    if (!isFinalStretch) return [];
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * 2 * Math.PI - Math.PI / 2;
      return {
        x: ringSize / 2 + radius * Math.cos(angle),
        y: ringSize / 2 + radius * Math.sin(angle),
        delay: i * 0.3,
      };
    });
  }, [isFinalStretch, radius, ringSize]);

  // Compute position of progress head (glowing dot at arc tip)
  const progressAngle = useMemo(() => {
    const angle = (progress / 100) * 2 * Math.PI - Math.PI / 2; // Start from top (-90deg)
    return {
      x: ringSize / 2 + radius * Math.cos(angle),
      y: ringSize / 2 + radius * Math.sin(angle),
    };
  }, [progress, radius, ringSize]);

  return (
    <div className="w-full max-w-sm mb-8" role="region" aria-label="Focus timer">
      {/* Minimal session label */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: colors.text }}>
            {preset.name}
          </h2>
          <p className="text-[12px] font-medium" style={{ color: colors.textSecondary }}>
            {isCountup ? 'Open-ended' : `${preset.duration} min`}
          </p>
        </div>
        <button
          onClick={onToggleSound}
          aria-label={ariaLabel.toggle('Sound', soundEnabled)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: withAlpha(colors.text, 0.06) }}
        >
          {soundEnabled ? (
            <PixelIcon name="volume-on" size={16} className="opacity-90" aria-hidden="true" />
          ) : (
            <PixelIcon name="volume-off" size={16} className="opacity-60" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Timer ring with enhanced frosted backdrop */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          {/* Breathing background pulse */}
          {isRunning && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${ringColors.glow} 0%, transparent 70%)`,
                animation: `timer-breathe ${progress > 60 ? '6s' : '4s'} ease-in-out infinite`,
                opacity: 0.04,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Multi-layer frosted backdrop circle */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.glassBg} 0%, transparent 72%)`,
              backdropFilter: `blur(${colors.glassBlur}px) saturate(1.4)`,
              WebkitBackdropFilter: `blur(${colors.glassBlur}px) saturate(1.4)`,
              border: `1px solid ${colors.glassBorder}`,
              boxShadow: `inset 0 1px 0 ${colors.glassHighlight}`,
            }}
          />
          <svg
            width={ringSize}
            height={ringSize}
            className="absolute inset-0 -rotate-90"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={isCountup ? `Elapsed: ${progressPercent}% of 6 hours` : `Session progress: ${progressPercent}% complete`}
          >
            <defs>
              <linearGradient id="timer-ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={ringColors.start} />
                <stop offset="50%" stopColor={ringColors.mid} />
                <stop offset="100%" stopColor={ringColors.end} />
              </linearGradient>
            </defs>
            {/* Track */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={colors.ringTrackColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Progress with gradient */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke="url(#timer-ring-gradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease-out, stroke-width 0.5s ease',
                filter: `drop-shadow(0 0 ${isFinalStretch ? '24px' : '12px'} ${ringColors.glow})`,
              }}
            />
          </svg>

          {/* Glowing progress head dot */}
          {progress > 0 && (
            <div
              className="absolute animate-ring-head-pulse"
              style={{
                left: progressAngle.x - 6,
                top: progressAngle.y - 6,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: colors.ringPulseColor,
                boxShadow: `0 0 12px 4px ${withAlpha(colors.ringPulseColor, 0.5)}`,
              }}
            />
          )}

          {/* Sparkle dots around ring (final 5 min) */}
          {sparklePositions.map((spark, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: spark.x - 2,
                top: spark.y - 2,
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: '#fff',
                animation: `ring-sparkle 1.5s ease-in-out infinite`,
                animationDelay: `${spark.delay}s`,
                boxShadow: `0 0 4px 1px ${ringColors.glow}`,
              }}
            />
          ))}

          {/* Center time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-[46px] tracking-tight tabular-nums"
              style={{
                color: colors.text,
                fontWeight: colors.timerFontWeight,
                letterSpacing: colors.timerLetterSpacing,
                textShadow: colors.timerTextShadow,
              }}
              role="timer"
              aria-live="polite"
              aria-atomic="true"
              aria-label={isCountup ? `Time elapsed: ${formatTimeForScreenReader(displayTime)}` : `Time remaining: ${formatTimeForScreenReader(displayTime)}`}
            >
              {formatTime(displayTime)}
            </div>
            <p
              className="text-[12px] font-semibold tracking-widest uppercase mt-1"
              style={{ color: colors.textSecondary }}
              aria-live="polite"
            >
              {isRunning ? (isCountup ? 'Counting' : 'Focusing') : 'Ready'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
