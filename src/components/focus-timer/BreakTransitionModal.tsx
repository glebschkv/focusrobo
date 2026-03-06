import { useState, useEffect } from 'react';
import { Play, Timer, Sparkles, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PixelIcon } from '@/components/ui/PixelIcon';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import { useSettings } from '@/hooks/useSettings';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface BreakTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartBreak: (duration: number) => void;
  onSkipBreak: () => void;
  isLongBreak: boolean;
  completedSessions: number;
  autoStartEnabled: boolean;
  onToggleAutoStart: (enabled: boolean) => void;
}

const BREAK_OPTIONS = [
  { duration: 5, label: '5 min', description: 'Quick refresh', icon: 'lightning' },
  { duration: 10, label: '10 min', description: 'Short rest', icon: 'tea-cup' },
  { duration: 15, label: '15 min', description: 'Full break', icon: 'sprout' },
  { duration: 20, label: '20 min', description: 'Extended rest', icon: 'meditation' },
];

export const BreakTransitionModal = ({
  isOpen,
  onStartBreak,
  onSkipBreak,
  isLongBreak,
  completedSessions,
  autoStartEnabled,
  onToggleAutoStart,
}: BreakTransitionModalProps) => {
  const { settings: appSettings } = useSettings();
  const shortBreak = appSettings.shortBreakTime || 5;
  const longBreak = appSettings.longBreakTime || 15;
  const longBreakInterval = appSettings.longBreakInterval || 4;
  const [selectedDuration, setSelectedDuration] = useState(isLongBreak ? longBreak : shortBreak);
  const [autoStartCountdown, setAutoStartCountdown] = useState(10);
  const { isPremium } = usePremiumStatus();

  // Auto-start countdown
  useEffect(() => {
    if (!isOpen || !autoStartEnabled || !isPremium) {
      setAutoStartCountdown(10);
      return;
    }

    const interval = setInterval(() => {
      setAutoStartCountdown(prev => {
        if (prev <= 1) {
          onStartBreak(selectedDuration);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoStartEnabled, isPremium, selectedDuration, onStartBreak]);

  // Reset countdown when duration changes
  useEffect(() => {
    setAutoStartCountdown(10);
  }, [selectedDuration]);

  // Set recommended break duration from settings
  useEffect(() => {
    setSelectedDuration(isLongBreak ? longBreak : shortBreak);
  }, [isLongBreak, longBreak, shortBreak]);

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onSkipBreak(); }}>
      <DrawerContent className="pb-safe">
        <VisuallyHidden>
          <DrawerTitle>Time for a Break</DrawerTitle>
        </VisuallyHidden>

        <div className="px-5 pt-1 pb-6 space-y-4">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2"
              style={{
                background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 95% 53%))',
                boxShadow: '0 4px 12px hsl(38 92% 50% / 0.3)',
              }}
            >
              <PixelIcon name="tea-cup" size={26} />
            </div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Time for a Break!
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isLongBreak
                ? `Great job! ${completedSessions} sessions done.`
                : "Rest up for the next session!"}
            </p>

            {/* Sessions indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {Array.from({ length: longBreakInterval }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    n <= (completedSessions % longBreakInterval || longBreakInterval)
                      ? "bg-amber-400"
                      : "bg-border"
                  )}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1.5">
                {completedSessions % longBreakInterval || longBreakInterval}/{longBreakInterval} until long break
              </span>
            </div>
          </div>

          {/* Break duration options */}
          <div className="grid grid-cols-2 gap-2">
            {BREAK_OPTIONS.map((option) => (
              <button
                key={option.duration}
                onClick={() => setSelectedDuration(option.duration)}
                className={cn(
                  "p-3 rounded-xl text-left transition-all active:scale-[0.97] touch-manipulation",
                  selectedDuration === option.duration
                    ? "bg-amber-50 ring-2 ring-amber-400"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <PixelIcon name={option.icon} size={18} />
                  <span className="font-bold text-sm text-foreground">{option.label}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>

          {/* Auto-start toggle (Premium feature) */}
          <div className={cn(
            "rounded-xl p-3",
            isPremium ? "bg-purple-50" : "bg-muted/30"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Auto-start breaks</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isPremium ? "Automatically start break timer" : "Premium feature"}
                  </p>
                </div>
              </div>
              {isPremium ? (
                <button
                  onClick={() => onToggleAutoStart(!autoStartEnabled)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-all relative",
                    autoStartEnabled ? "bg-purple-500" : "bg-border"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
                      autoStartEnabled ? "right-0.5" : "left-0.5"
                    )}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-1 text-amber-500">
                  <Crown className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold">Premium</span>
                </div>
              )}
            </div>

            {isPremium && autoStartEnabled && (
              <div className="mt-2 flex items-center gap-2 text-purple-600">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-xs font-medium">
                  Starting in {autoStartCountdown}s...
                </span>
                <button
                  onClick={() => setAutoStartCountdown(10)}
                  className="text-[10px] underline hover:no-underline"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onSkipBreak}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold text-sm",
                "border border-border text-foreground",
                "active:scale-[0.97] transition-all duration-150 touch-manipulation"
              )}
            >
              Skip Break
            </button>
            <button
              onClick={() => onStartBreak(selectedDuration)}
              className={cn(
                "flex-1 py-3 rounded-xl text-white text-sm font-bold",
                "flex items-center justify-center gap-2",
                "active:scale-[0.97] transition-all duration-150 touch-manipulation"
              )}
              style={{
                background: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(25 95% 53%))',
                boxShadow: '0 3px 0 hsl(25 90% 40%), 0 6px 12px hsl(38 92% 50% / 0.2)',
              }}
            >
              <Play className="w-4 h-4" />
              Start Break
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
