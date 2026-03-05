import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimerPreset, formatTime, MAX_COUNTUP_DURATION } from "./constants";
import { ariaLabel, formatTimeForScreenReader } from "@/lib/accessibility";
import { useThemeColors } from "./backgrounds/ThemeContext";

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
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full max-w-sm mb-8" role="region" aria-label="Focus timer">
      {/* Minimal session label */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: colors.text }}>
            {preset.name}
          </h2>
          <p className="text-[12px] font-medium" style={{ color: `${colors.text}80` }}>
            {isCountup ? 'Open-ended' : `${preset.duration} min`}
          </p>
        </div>
        <button
          onClick={onToggleSound}
          aria-label={ariaLabel.toggle('Sound', soundEnabled)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90"
          style={{ background: `${colors.text}10` }}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" style={{ color: colors.text }} aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4" style={{ color: `${colors.text}40` }} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Timer ring — no container, just the ring on the background */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
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
            {/* Track */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={`${colors.text}18`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Progress */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              stroke={colors.ringStart}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease-out',
                filter: `drop-shadow(0 0 8px ${colors.ringStart}4D)`,
              }}
            />
          </svg>

          {/* Center time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-[46px] font-semibold tracking-tight tabular-nums"
              style={{ color: colors.text }}
              role="timer"
              aria-live="polite"
              aria-atomic="true"
              aria-label={isCountup ? `Time elapsed: ${formatTimeForScreenReader(displayTime)}` : `Time remaining: ${formatTimeForScreenReader(displayTime)}`}
            >
              {formatTime(displayTime)}
            </div>
            <p
              className="text-[12px] font-semibold tracking-widest uppercase mt-1"
              style={{ color: `${colors.text}50` }}
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
