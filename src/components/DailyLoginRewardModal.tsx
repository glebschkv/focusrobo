import { useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DailyReward } from "@/hooks/useDailyLoginRewards";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { playSoundEffect } from "@/hooks/useSoundEffects";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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

  const prefersReducedMotion = useReducedMotion();

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
      <DialogContent className="max-w-[340px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl bg-white max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Daily Login Reward</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div
          className="relative px-5 pt-6 pb-4 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(60 20% 97%) 0%, hsl(140 8% 94%) 100%)',
            borderBottom: '1px solid hsl(var(--border))',
          }}
        >
          {/* Floating sparkle particles */}
          {!prefersReducedMotion && (
            <>
              <div className="absolute top-3 left-8 animate-pulse opacity-30" style={{ animationDelay: '0s' }}>
                <PixelIcon name="sparkles" size={14} />
              </div>
              <div className="absolute top-5 right-6 animate-pulse opacity-40" style={{ animationDelay: '0.7s' }}>
                <PixelIcon name="sparkles" size={12} />
              </div>
              <div className="absolute bottom-4 left-12 animate-pulse opacity-25" style={{ animationDelay: '1.4s' }}>
                <PixelIcon name="sparkles" size={10} />
              </div>
            </>
          )}

          <div className="relative z-[1]">
            {/* Hero icon */}
            <div
              className="w-16 h-16 rounded-2xl bg-white/60 flex items-center justify-center mx-auto mb-3 shadow-sm"
              style={!prefersReducedMotion ? { animation: 'daily-reward-float 3s ease-in-out infinite' } : undefined}
            >
              <PixelIcon name={iconName} size={48} />
            </div>

            {/* Title */}
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: 'hsl(150 10% 12%)' }}
            >
              Daily Reward
            </h2>

            {/* Streak counter */}
            {currentStreak > 0 && (
              <div className="flex items-center justify-center mt-2">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: 'hsl(152 44% 45% / 0.1)',
                    border: '1.5px solid hsl(152 44% 45% / 0.25)',
                  }}
                >
                  <PixelIcon name="fire" size={16} />
                  <span className="text-xs font-bold" style={{ color: 'hsl(152 44% 45%)' }}>
                    {currentStreak} Day Streak
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Today's Reward Card */}
          <div
            className="p-4 rounded-xl text-center relative overflow-hidden"
            style={{
              background: 'hsl(var(--card))',
              border: '1.5px solid hsl(var(--border))',
              boxShadow: '0 2px 8px hsl(152 44% 45% / 0.06)',
            }}
          >
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              Day {currentDayInCycle}
            </span>
            <p className="text-base font-bold mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>
              {displayReward.label}
            </p>
            <div className="flex items-center justify-center gap-2 mb-1">
              <PixelIcon name={iconName} size={40} />
              <span className="text-2xl font-black" style={{ color: 'hsl(var(--foreground))' }}>
                {getRewardValue(displayReward)}
              </span>
            </div>
            {displayReward.coins > 0 && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <PixelIcon name="coin" size={18} />
                <span className="text-sm font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  +{displayReward.coins} Coins
                </span>
              </div>
            )}
            <p className="text-[11px] mt-1.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {displayReward.description}
            </p>
          </div>

          {/* Weekly Rewards Track */}
          <div className="space-y-2.5">
            <div
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-center"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Weekly Rewards
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {allRewards.map((r, index) => {
                const dayNum = index + 1;
                const isClaimed = dayNum < currentDayInCycle;
                const isToday = dayNum === currentDayInCycle;
                const isFuture = dayNum > currentDayInCycle;
                const isDay7 = dayNum === 7;
                const dayIconName = EMOJI_TO_ICON[r.icon] || 'star';

                return (
                  <div
                    key={r.day}
                    className={cn(
                      "relative flex flex-col items-center py-2 px-1 rounded-xl text-center transition-all min-w-0",
                      isFuture && !isDay7 && "opacity-40",
                      isFuture && isDay7 && "opacity-60",
                    )}
                    style={{
                      background: isClaimed
                        ? 'hsl(152 30% 95%)'
                        : isToday
                        ? '#fff'
                        : isFuture && isDay7
                        ? 'hsl(45 50% 97%)'
                        : 'hsl(var(--muted))',
                      border: isToday
                        ? '2px solid hsl(152 44% 45%)'
                        : isClaimed
                        ? '1.5px solid hsl(152 44% 65%)'
                        : isFuture && isDay7
                        ? '1.5px dashed hsl(42 65% 52%)'
                        : '1px solid hsl(var(--border))',
                      boxShadow: isToday
                        ? '0 1px 6px hsl(152 44% 45% / 0.15)'
                        : 'none',
                    }}
                  >
                    <span
                      className="text-[9px] font-bold uppercase"
                      style={{
                        color: isToday
                          ? 'hsl(152 44% 40%)'
                          : isClaimed
                          ? 'hsl(152 44% 45%)'
                          : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      D{dayNum}
                    </span>
                    <div className="my-1">
                      {isClaimed ? (
                        <Check className="w-5 h-5" style={{ color: 'hsl(152 44% 45%)' }} />
                      ) : (
                        <PixelIcon name={dayIconName} size={20} />
                      )}
                    </div>
                    <span
                      className="text-[9px] font-semibold"
                      style={{
                        color: isToday
                          ? 'hsl(var(--foreground))'
                          : isClaimed
                          ? 'hsl(152 44% 40%)'
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
              className="p-3 rounded-xl flex items-center gap-3"
              style={{
                background: 'hsl(var(--muted))',
                border: '1px solid hsl(var(--border))',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'hsl(152 44% 45% / 0.1)' }}
              >
                <PixelIcon name="fire" size={18} />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  Streak Bonus Active
                </span>
                <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  +{currentStreak >= 30 ? 50 : currentStreak >= 14 ? 30 : currentStreak >= 7 ? 20 : 10}% XP on focus sessions
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Claim Button */}
        <div className="px-5 pb-5 pt-1">
          <button
            onClick={handleClaim}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.97] touch-manipulation min-h-[48px] flex items-center justify-center gap-2"
            style={{
              background: 'hsl(152 44% 45%)',
              color: '#fff',
              boxShadow: '0 3px 0 hsl(152 44% 38%), 0 6px 16px hsl(152 44% 45% / 0.25)',
            }}
          >
            <PixelIcon name="gift" size={20} />
            Claim Reward
          </button>
        </div>

        {/* Float animation keyframe */}
        <style>{`
          @keyframes daily-reward-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
