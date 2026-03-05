/**
 * TimerView Component
 *
 * Clean timer layout: display → controls → presets → theme switcher.
 * Focus Shield setup has been moved to Settings for a cleaner UX.
 */

import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { TimerPresetGrid } from "./TimerPresetGrid";
import { BackgroundThemeSwitcher } from "./BackgroundThemeSwitcher";
import { TimerState, TimerPreset } from "./constants";

interface TimerViewProps {
  timerState: TimerState;
  displayTime: number;
  elapsedTime: number;
  selectedPreset: TimerPreset;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkip: () => void;
  onToggleSound: () => void;
  onSelectPreset: (preset: TimerPreset) => void;
  backgroundTheme: string;
  isPremium: boolean;
  onThemeChange: (themeId: string) => void;
  onLockedBackgroundClick: () => void;
}

export const TimerView = ({
  timerState,
  displayTime,
  elapsedTime,
  selectedPreset,
  onStart,
  onPause,
  onStop,
  onSkip,
  onToggleSound,
  onSelectPreset,
  backgroundTheme,
  isPremium,
  onThemeChange,
  onLockedBackgroundClick,
}: TimerViewProps) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-start px-4 pb-32">
      <TimerDisplay
        preset={selectedPreset}
        timeLeft={displayTime}
        sessionDuration={timerState.sessionDuration}
        isRunning={timerState.isRunning}
        soundEnabled={timerState.soundEnabled}
        onToggleSound={onToggleSound}
        isCountup={timerState.isCountup}
        elapsedTime={elapsedTime}
      />

      <TimerControls
        isRunning={timerState.isRunning}
        onStart={onStart}
        onPause={onPause}
        onStop={onStop}
        onSkip={onSkip}
      />

      {/* Preset grid — below controls, only when not running */}
      {!timerState.isRunning && (
        <div className="mt-6 w-full flex justify-center">
          <TimerPresetGrid
            selectedPreset={selectedPreset}
            isRunning={timerState.isRunning}
            onSelectPreset={onSelectPreset}
          />
        </div>
      )}

      {/* Background theme switcher — at the bottom */}
      {!timerState.isRunning && (
        <div className="mt-4 w-full flex justify-center">
          <BackgroundThemeSwitcher
            currentTheme={backgroundTheme}
            isPremium={isPremium}
            onThemeChange={onThemeChange}
            onLockedClick={onLockedBackgroundClick}
          />
        </div>
      )}
    </div>
  );
};
