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
          className="px-14 py-[18px] rounded-2xl text-lg font-bold tracking-wide text-white transition-all active:scale-95"
          style={{
            background: colors.buttonGradient,
            boxShadow: `0 4px 20px ${colors.buttonShadowColor}, 0 1px 3px hsl(0 0% 0% / 0.1)`,
            textShadow: colors.buttonTextShadow,
          }}
        >
          Start Growing
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-4" role="group" aria-label="Timer controls">
      <button
        onClick={isLocked ? handleLockedAction : onStop}
        aria-label={isLocked ? "Stop disabled — strict mode active" : ARIA_LABELS.STOP_TIMER}
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90"
        style={{
          background: `${colors.text}08`,
          opacity: isLocked ? 0.4 : 1,
        }}
      >
        <Square className="w-4 h-4" style={{ color: colors.textSecondary }} aria-hidden="true" />
      </button>

      <button
        onClick={isLocked ? handleLockedAction : onPause}
        aria-label={isLocked ? "Pause disabled — strict mode active" : ARIA_LABELS.PAUSE_TIMER}
        className="px-12 py-4 rounded-2xl text-sm font-bold tracking-wide text-white transition-all active:scale-95"
        style={{
          background: isLocked ? `${colors.text}30` : colors.buttonGradient,
          boxShadow: isLocked ? 'none' : `0 4px 16px ${colors.buttonShadowColor}`,
          textShadow: isLocked ? 'none' : colors.buttonTextShadow,
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
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90"
        style={{
          background: `${colors.text}08`,
          opacity: isLocked ? 0.4 : 1,
        }}
      >
        <SkipForward className="w-4 h-4" style={{ color: colors.textSecondary }} aria-hidden="true" />
      </button>
    </div>
  );
};
