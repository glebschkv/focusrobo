import { Pause, Square, SkipForward, Lock } from "lucide-react";
import { ARIA_LABELS } from "@/lib/accessibility";
import { toast } from "sonner";
import { useFocusStore } from "@/stores/focusStore";
import { useThemeColors } from "./backgrounds/ThemeContext";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkip: () => void;
}

export const TimerControls = ({
  isRunning,
  onStart,
  onPause,
  onStop,
  onSkip
}: TimerControlsProps) => {
  const strictMode = useFocusStore((s) => s.strictMode);
  const focusEnabled = useFocusStore((s) => s.enabled);
  const { colors } = useThemeColors();

  const isLocked = isRunning && focusEnabled && strictMode;

  const handleLockedAction = () => {
    toast.warning("Strict Mode Active", {
      description: "Timer must complete. Change in Settings.",
      duration: 3000,
    });
  };

  if (!isRunning) {
    return (
      <div className="flex justify-center" role="group" aria-label="Timer controls">
        <button
          onClick={onStart}
          aria-label={ARIA_LABELS.START_TIMER}
          className="px-12 py-4 rounded-full text-base font-semibold tracking-wide text-white transition-all active:scale-95"
          style={{
            background: colors.ringStart,
            boxShadow: `0 4px 20px ${colors.ringStart}40`,
          }}
        >
          Start Focus
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-4" role="group" aria-label="Timer controls">
      <button
        onClick={isLocked ? handleLockedAction : onStop}
        aria-label={isLocked ? "Stop disabled — strict mode active" : ARIA_LABELS.STOP_TIMER}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          background: `${colors.text}08`,
          opacity: isLocked ? 0.4 : 1,
        }}
      >
        <Square className="w-4 h-4" style={{ color: `${colors.text}70` }} aria-hidden="true" />
      </button>

      <button
        onClick={isLocked ? handleLockedAction : onPause}
        aria-label={isLocked ? "Pause disabled — strict mode active" : ARIA_LABELS.PAUSE_TIMER}
        className="px-10 py-3.5 rounded-full text-sm font-semibold tracking-wide text-white transition-all active:scale-95"
        style={{
          background: isLocked ? `${colors.text}30` : colors.ringStart,
          boxShadow: isLocked ? 'none' : `0 4px 16px ${colors.ringStart}30`,
        }}
      >
        {isLocked ? (
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4" aria-hidden="true" />
            Locked
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Pause className="w-4 h-4" aria-hidden="true" />
            Pause
          </span>
        )}
      </button>

      <button
        onClick={isLocked ? handleLockedAction : onSkip}
        aria-label={isLocked ? "Skip disabled — strict mode active" : "Skip to end"}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          background: `${colors.text}08`,
          opacity: isLocked ? 0.4 : 1,
        }}
      >
        <SkipForward className="w-4 h-4" style={{ color: `${colors.text}70` }} aria-hidden="true" />
      </button>
    </div>
  );
};
