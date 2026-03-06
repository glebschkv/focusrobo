import { useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DailyReward } from "@/hooks/useDailyLoginRewards";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { playSoundEffect } from "@/hooks/useSoundEffects";

// Map reward emojis to PixelIcon names
const EMOJI_TO_ICON: Record<string, string> = {
  '🌟': 'star',
  '✨': 'sparkles',
  '🎁': 'gift',
  '🧊': 'ice-cube',
  '💪': 'muscle',
  '🔥': 'fire',
  '🎰': 'treasure-chest',
};

interface DailyLoginRewardModalProps {
  isOpen: boolean;
  onClaim: () => void;
  onDismiss: () => void;
  reward: DailyReward | null;
  currentStreak: number;
  allRewards: DailyReward[];
}

export const DailyLoginRewardModal = ({
  isOpen,
  onClaim,
  onDismiss,
  reward,
  currentStreak,
  allRewards,
}: DailyLoginRewardModalProps) => {
  const lastRewardRef = useRef<DailyReward | null>(null);
  if (reward) lastRewardRef.current = reward;
  const displayReward = reward || lastRewardRef.current;

  // Close dialog and fire claim. Use a single rAF to let Radix begin its
  // close animation before new modal state changes propagate.
  const claimingRef = useRef(false);
  const handleClaim = useCallback(() => {
    if (claimingRef.current) return; // prevent double-tap
    claimingRef.current = true;
    playSoundEffect('reward');
    onClaim();
    onDismiss();
    // Reset guard after animation completes
    setTimeout(() => { claimingRef.current = false; }, 500);
  }, [onClaim, onDismiss]);

  if (!displayReward) return null;

  const currentDayInCycle = (currentStreak % 7) + 1;

  const getRewardValue = (r: DailyReward) => {
    if (r.type === 'streak_freeze') {
      return `+${r.streakFreeze} Freeze`;
    }
    return `+${r.xp} XP`;
  };

  const iconName = EMOJI_TO_ICON[displayReward.icon] || 'star';

  return (
    <Dialog open={isOpen && !!displayReward} onOpenChange={(open) => { if (!open) onDismiss(); }}>
      <DialogContent className="retro-modal max-w-[320px] p-0 overflow-hidden border-0 max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Daily Login Reward</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="retro-modal-header p-5 text-center relative">
          <div className="retro-scanlines opacity-15" />

          <div className="relative z-[1]">
            {/* Hero icon */}
            <div className="relative inline-block mb-3">
              <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
                <PixelIcon name={iconName} size={64} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'hsl(150 10% 12%)' }}>
              Daily Login Reward!
            </h2>

            {/* Streak badge */}
            {currentStreak > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-black text-white"
                  style={{
                    background: 'hsl(25 65% 48%)',
                    border: '2px solid hsl(25 55% 40%)',
                    boxShadow: '0 2px 0 hsl(25 55% 32%)',
                  }}
                >
                  <PixelIcon name="fire" size={12} />
                  {currentStreak} day streak!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Today's Reward — gold highlight card */}
          <div
            className="p-4 rounded-xl text-center relative overflow-hidden"
            style={{
              background: 'hsl(45 70% 92%)',
              border: '2px solid hsl(42 50% 75%)',
              boxShadow: '0 2px 8px hsl(42 60% 50% / 0.15)',
            }}
          >
            <div className="relative z-10">
              <span
                className="inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-2 text-white"
                style={{
                  background: 'hsl(42 65% 45%)',
                  border: '1px solid hsl(42 55% 55%)',
                }}
              >
                Day {currentDayInCycle}
              </span>
              <p className="text-lg font-black mb-1" style={{ color: 'hsl(35 50% 25%)' }}>
                {displayReward.label}
              </p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <PixelIcon name={iconName} size={28} />
                <span className="text-3xl font-black" style={{ color: 'hsl(35 50% 25%)' }}>
                  {getRewardValue(displayReward)}
                </span>
              </div>
              {displayReward.coins > 0 && (
                <div className="flex items-center justify-center gap-1 mb-1">
                  <PixelIcon name="coin" size={16} />
                  <span className="text-sm font-bold" style={{ color: 'hsl(35 45% 30%)' }}>+{displayReward.coins} Coins</span>
                </div>
              )}
              <p className="text-[11px] font-semibold" style={{ color: 'hsl(35 40% 35%)' }}>
                {displayReward.description}
              </p>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="space-y-2">
            <div
              className="text-[9px] font-black uppercase tracking-[0.2em] text-center"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              This Week's Rewards
            </div>
            <div className="grid grid-cols-7 gap-1">
              {allRewards.map((r, index) => {
                const dayNum = index + 1;
                const isClaimed = dayNum < currentDayInCycle;
                const isToday = dayNum === currentDayInCycle;
                const isFuture = dayNum > currentDayInCycle;
                const dayIconName = EMOJI_TO_ICON[r.icon] || 'star';

                return (
                  <div
                    key={r.day}
                    className={cn(
                      "relative flex flex-col items-center py-1.5 px-0.5 rounded-lg text-center transition-all",
                      isFuture && "opacity-40"
                    )}
                    style={{
                      background: isClaimed
                        ? 'hsl(152 30% 95%)'
                        : isToday
                        ? 'hsl(45 50% 94%)'
                        : 'hsl(var(--muted))',
                      border: isToday
                        ? '2px solid hsl(42 65% 52%)'
                        : isClaimed
                        ? '2px solid hsl(152 40% 65%)'
                        : '1px solid hsl(var(--border))',
                      boxShadow: isToday
                        ? '0 1px 4px hsl(42 60% 50% / 0.2)'
                        : 'none',
                    }}
                  >
                    <span
                      className="text-[8px] font-black uppercase"
                      style={{
                        color: isToday
                          ? 'hsl(35 50% 35%)'
                          : isClaimed
                          ? 'hsl(152 44% 40%)'
                          : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      D{dayNum}
                    </span>
                    <div className="my-0.5">
                      {isClaimed ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <PixelIcon name={dayIconName} size={16} />
                      )}
                    </div>
                    <span
                      className="text-[8px] font-bold"
                      style={{
                        color: isToday
                          ? 'hsl(35 45% 30%)'
                          : isClaimed
                          ? 'hsl(152 40% 35%)'
                          : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {r.type === 'streak_freeze' ? 'Freeze' : r.xp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak Bonus Info */}
          {currentStreak >= 3 && (
            <div
              className="retro-reward-item"
              style={{
                borderColor: 'hsl(25 50% 75%)',
                background: 'hsl(30 40% 95%)',
              }}
            >
              <div
                className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'hsl(25 50% 90%)',
                  border: '1px solid hsl(25 40% 78%)',
                }}
              >
                <PixelIcon name="fire" size={16} />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold" style={{ color: 'hsl(25 60% 40%)' }}>
                  Streak Bonus Active!
                </span>
                <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  +{currentStreak >= 30 ? 50 : currentStreak >= 14 ? 30 : currentStreak >= 7 ? 20 : 10}% XP on focus sessions
                </p>
              </div>
            </div>
          )}

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            className="retro-arcade-btn retro-arcade-btn-green w-full py-4 text-sm tracking-wider touch-manipulation flex items-center justify-center gap-2 min-h-[48px] active:scale-95 transition-transform"
          >
            <PixelIcon name="gift" size={20} />
            Claim Reward!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
