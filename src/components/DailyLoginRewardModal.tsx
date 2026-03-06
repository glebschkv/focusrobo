import { useRef, useCallback, useMemo } from "react";
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

  // Close dialog and fire claim. Single rAF to let Radix begin close animation.
  const claimingRef = useRef(false);
  const handleClaim = useCallback(() => {
    if (claimingRef.current) return;
    claimingRef.current = true;
    playSoundEffect('reward');
    onClaim();
    onDismiss();
    setTimeout(() => { claimingRef.current = false; }, 500);
  }, [onClaim, onDismiss]);

  const currentDayInCycle = useMemo(() => (currentStreak % 7) + 1, [currentStreak]);

  // Streak tier for color progression
  const streakTier = useMemo(() => {
    if (currentStreak >= 30) return 'max';
    if (currentStreak >= 14) return 'high';
    if (currentStreak >= 7) return 'mid';
    if (currentStreak >= 3) return 'low';
    return 'none';
  }, [currentStreak]);

  const streakBonusPct = useMemo(() => {
    if (currentStreak >= 30) return 50;
    if (currentStreak >= 14) return 30;
    if (currentStreak >= 7) return 20;
    if (currentStreak >= 3) return 10;
    return 0;
  }, [currentStreak]);

  if (!displayReward) return null;

  const getRewardValue = (r: DailyReward) => {
    if (r.type === 'streak_freeze') return `+${r.streakFreeze} Freeze`;
    return `+${r.xp} XP`;
  };

  const iconName = EMOJI_TO_ICON[displayReward.icon] || 'star';

  // Whether this is the day 7 mega reward
  const isMegaReward = displayReward.type === 'mystery_bonus';

  return (
    <Dialog open={isOpen && !!displayReward} onOpenChange={(open) => { if (!open) onDismiss(); }}>
      <DialogContent
        className="max-w-[340px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl bg-white max-h-[90vh] overflow-y-auto"
        style={!prefersReducedMotion ? {
          animation: 'daily-reward-enter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
        } : undefined}
      >
        <VisuallyHidden>
          <DialogTitle>Daily Login Reward</DialogTitle>
        </VisuallyHidden>

        {/* ── Header ── */}
        <div
          className="relative px-5 pt-7 pb-5 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(152 40% 96%) 0%, hsl(140 15% 94%) 100%)',
            borderBottom: '1px solid hsl(var(--border))',
          }}
        >
          {/* Ambient sparkle particles (staggered, subtle) */}
          {!prefersReducedMotion && (
            <>
              <div className="absolute top-3 left-6 opacity-20" style={{ animation: 'daily-sparkle-drift 4s ease-in-out infinite' }}>
                <PixelIcon name="sparkles" size={14} />
              </div>
              <div className="absolute top-6 right-5 opacity-25" style={{ animation: 'daily-sparkle-drift 4s ease-in-out infinite 1.2s' }}>
                <PixelIcon name="sparkles" size={12} />
              </div>
              <div className="absolute bottom-3 left-10 opacity-15" style={{ animation: 'daily-sparkle-drift 4s ease-in-out infinite 2.4s' }}>
                <PixelIcon name="star" size={10} />
              </div>
              <div className="absolute bottom-5 right-12 opacity-20" style={{ animation: 'daily-sparkle-drift 4s ease-in-out infinite 0.8s' }}>
                <PixelIcon name="star" size={8} />
              </div>
            </>
          )}

          <div className="relative z-[1]">
            {/* Hero icon with glow ring */}
            <div className="relative w-[72px] h-[72px] mx-auto mb-3">
              {/* Glow ring behind icon */}
              {!prefersReducedMotion && (
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: isMegaReward
                      ? 'hsl(42 65% 52% / 0.15)'
                      : 'hsl(152 44% 45% / 0.1)',
                    animation: 'daily-glow-ring 2s ease-in-out infinite',
                  }}
                />
              )}
              <div
                className="relative w-full h-full rounded-2xl flex items-center justify-center"
                style={{
                  background: 'hsl(0 0% 100% / 0.7)',
                  backdropFilter: 'blur(8px)',
                  border: isMegaReward
                    ? '1.5px solid hsl(42 65% 72%)'
                    : '1.5px solid hsl(152 44% 78%)',
                  boxShadow: isMegaReward
                    ? '0 4px 16px hsl(42 65% 52% / 0.15)'
                    : '0 4px 16px hsl(152 44% 45% / 0.1)',
                  ...(!prefersReducedMotion ? { animation: 'daily-reward-float 3s ease-in-out infinite' } : {}),
                }}
              >
                <PixelIcon name={iconName} size={44} />
                {/* Shimmer sweep across icon container */}
                {!prefersReducedMotion && (
                  <div
                    className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                    style={{
                      background: 'linear-gradient(105deg, transparent 40%, hsl(0 0% 100% / 0.4) 50%, transparent 60%)',
                      backgroundSize: '200% 100%',
                      animation: 'daily-shimmer-sweep 3s ease-in-out infinite 1s',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Title with staggered entrance */}
            <h2
              className="text-lg font-bold tracking-tight"
              style={{
                color: 'hsl(150 10% 12%)',
                ...(!prefersReducedMotion ? { animation: 'daily-fade-up 0.4s ease-out 0.1s both' } : {}),
              }}
            >
              Daily Reward
            </h2>

            {/* Streak pill */}
            {currentStreak > 0 && (
              <div
                className="flex items-center justify-center mt-2.5"
                style={!prefersReducedMotion ? { animation: 'daily-fade-up 0.4s ease-out 0.2s both' } : undefined}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                  style={{
                    background: streakTier === 'max'
                      ? 'hsl(350 85% 55% / 0.1)'
                      : streakTier === 'high'
                      ? 'hsl(20 100% 50% / 0.08)'
                      : 'hsl(152 44% 45% / 0.1)',
                    border: streakTier === 'max'
                      ? '1.5px solid hsl(350 85% 55% / 0.25)'
                      : streakTier === 'high'
                      ? '1.5px solid hsl(20 100% 50% / 0.2)'
                      : '1.5px solid hsl(152 44% 45% / 0.25)',
                  }}
                >
                  <PixelIcon name="fire" size={16} />
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{
                      color: streakTier === 'max'
                        ? 'hsl(350 85% 45%)'
                        : streakTier === 'high'
                        ? 'hsl(20 100% 40%)'
                        : 'hsl(152 44% 40%)',
                    }}
                  >
                    {currentStreak} Day Streak
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-5 pt-5 pb-4 space-y-4">
          {/* Today's Reward Card */}
          <div
            className="relative p-4 rounded-xl text-center overflow-hidden"
            style={{
              background: isMegaReward
                ? 'linear-gradient(180deg, hsl(45 40% 97%) 0%, hsl(42 30% 95%) 100%)'
                : 'linear-gradient(180deg, hsl(152 30% 97%) 0%, hsl(150 20% 95%) 100%)',
              border: isMegaReward
                ? '1.5px solid hsl(42 50% 84%)'
                : '1.5px solid hsl(152 20% 86%)',
              boxShadow: isMegaReward
                ? '0 2px 12px hsl(42 65% 52% / 0.1)'
                : '0 2px 12px hsl(152 44% 45% / 0.08)',
              ...(!prefersReducedMotion ? { animation: 'daily-fade-up 0.4s ease-out 0.15s both' } : {}),
            }}
          >
            {/* Day badge */}
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{
                background: isMegaReward
                  ? 'hsl(42 65% 52% / 0.12)'
                  : 'hsl(152 44% 45% / 0.1)',
                color: isMegaReward
                  ? 'hsl(42 65% 38%)'
                  : 'hsl(152 44% 38%)',
              }}
            >
              Day {currentDayInCycle}
            </span>

            {/* Reward label */}
            <p className="text-[15px] font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
              {displayReward.label}
            </p>

            {/* Primary reward value */}
            <div className="flex items-center justify-center gap-2.5 mb-1.5">
              <PixelIcon name={iconName} size={36} />
              <span
                className="text-2xl font-black tabular-nums"
                style={{
                  color: 'hsl(var(--foreground))',
                  textShadow: '0 1px 2px hsl(0 0% 0% / 0.06)',
                }}
              >
                {getRewardValue(displayReward)}
              </span>
            </div>

            {/* Coin sub-reward */}
            {displayReward.coins > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <PixelIcon name="coin" size={16} />
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: 'hsl(42 55% 40%)' }}>
                  +{displayReward.coins} Coins
                </span>
              </div>
            )}

            {/* Description */}
            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {displayReward.description}
            </p>
          </div>

          {/* ── Weekly Rewards Track ── */}
          <div
            className="space-y-2"
            style={!prefersReducedMotion ? { animation: 'daily-fade-up 0.4s ease-out 0.25s both' } : undefined}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.15em] text-center"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              Weekly Rewards
            </div>
            <div className="grid grid-cols-7 gap-1">
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
                      "relative flex flex-col items-center py-1.5 rounded-lg text-center transition-all min-w-0 overflow-hidden",
                      isFuture && !isDay7 && "opacity-35",
                      isFuture && isDay7 && "opacity-55",
                    )}
                    style={{
                      background: isToday
                        ? '#fff'
                        : isClaimed
                        ? 'hsl(152 30% 95%)'
                        : isFuture && isDay7
                        ? 'hsl(45 40% 97%)'
                        : 'hsl(var(--muted))',
                      border: isToday
                        ? '2px solid hsl(152 44% 45%)'
                        : isClaimed
                        ? '1.5px solid hsl(152 44% 68%)'
                        : isFuture && isDay7
                        ? '1.5px dashed hsl(42 65% 60%)'
                        : '1px solid hsl(var(--border))',
                      boxShadow: isToday
                        ? '0 2px 8px hsl(152 44% 45% / 0.18), 0 0 0 3px hsl(152 44% 45% / 0.06)'
                        : 'none',
                    }}
                  >
                    {/* Day label */}
                    <span
                      className="text-[8px] font-bold uppercase leading-none"
                      style={{
                        color: isToday
                          ? 'hsl(152 44% 38%)'
                          : isClaimed
                          ? 'hsl(152 44% 50%)'
                          : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      D{dayNum}
                    </span>

                    {/* Icon */}
                    <div className="my-0.5 flex items-center justify-center h-5">
                      {isClaimed ? (
                        <div
                          className="w-4.5 h-4.5 rounded-full flex items-center justify-center"
                          style={{
                            background: 'hsl(152 44% 45%)',
                          }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <PixelIcon name={dayIconName} size={18} />
                      )}
                    </div>

                    {/* Value */}
                    <span
                      className="text-[8px] font-semibold leading-none tabular-nums"
                      style={{
                        color: isToday
                          ? 'hsl(var(--foreground))'
                          : isClaimed
                          ? 'hsl(152 44% 38%)'
                          : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {r.type === 'streak_freeze' ? '❄️' : r.type === 'mystery_bonus' ? '🎁' : r.xp}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress dots under the track */}
            <div className="flex items-center justify-center gap-1 pt-0.5">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i + 1 === currentDayInCycle ? 12 : 4,
                    height: 4,
                    borderRadius: i + 1 === currentDayInCycle ? 2 : 999,
                    background: i + 1 <= currentDayInCycle
                      ? 'hsl(152 44% 45%)'
                      : 'hsl(var(--border))',
                    transition: 'width 0.3s ease, background 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Streak Bonus Card ── */}
          {streakBonusPct > 0 && (
            <div
              className="p-3 rounded-xl flex items-center gap-3"
              style={{
                background: streakTier === 'max'
                  ? 'hsl(350 85% 55% / 0.04)'
                  : 'hsl(var(--muted))',
                border: streakTier === 'max'
                  ? '1px solid hsl(350 85% 55% / 0.15)'
                  : '1px solid hsl(var(--border))',
                ...(!prefersReducedMotion ? { animation: 'daily-fade-up 0.4s ease-out 0.35s both' } : {}),
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: streakTier === 'max'
                    ? 'hsl(350 85% 55% / 0.1)'
                    : 'hsl(152 44% 45% / 0.08)',
                }}
              >
                <PixelIcon name="fire" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold block" style={{ color: 'hsl(var(--foreground))' }}>
                  Streak Bonus Active
                </span>
                <p className="text-[10px] leading-snug" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  +{streakBonusPct}% XP on focus sessions
                </p>
              </div>
              <div
                className="text-xs font-black tabular-nums flex-shrink-0 px-2 py-0.5 rounded-full"
                style={{
                  background: streakTier === 'max'
                    ? 'hsl(350 85% 55% / 0.1)'
                    : 'hsl(152 44% 45% / 0.08)',
                  color: streakTier === 'max'
                    ? 'hsl(350 85% 45%)'
                    : 'hsl(152 44% 40%)',
                }}
              >
                +{streakBonusPct}%
              </div>
            </div>
          )}
        </div>

        {/* ── Claim Button ── */}
        <div className="px-5 pb-5 pt-2" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <button
            onClick={handleClaim}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm tracking-wide min-h-[48px]",
              "flex items-center justify-center gap-2",
              "transition-all touch-manipulation",
              "active:scale-[0.97] active:translate-y-[1px]",
            )}
            style={{
              background: isMegaReward
                ? 'linear-gradient(135deg, hsl(42 65% 52%) 0%, hsl(42 65% 46%) 100%)'
                : 'hsl(152 44% 45%)',
              color: '#fff',
              boxShadow: isMegaReward
                ? '0 3px 0 hsl(42 55% 38%), 0 6px 16px hsl(42 65% 52% / 0.25)'
                : '0 3px 0 hsl(152 44% 36%), 0 6px 16px hsl(152 44% 45% / 0.25)',
              textShadow: '0 1px 1px hsl(0 0% 0% / 0.15)',
              ...(!prefersReducedMotion ? { animation: 'daily-fade-up 0.4s ease-out 0.3s both' } : {}),
            }}
          >
            <PixelIcon name="gift" size={20} />
            Claim Reward
          </button>
        </div>

        {/* ── Keyframe Animations ── */}
        <style>{`
          @keyframes daily-reward-enter {
            0% { opacity: 0; transform: scale(0.88) translateY(12px); }
            60% { opacity: 1; transform: scale(1.02) translateY(-2px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes daily-reward-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes daily-fade-up {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes daily-sparkle-drift {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
            50% { transform: translateY(-6px) scale(1.15); opacity: 0.35; }
          }
          @keyframes daily-glow-ring {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.08); opacity: 1; }
          }
          @keyframes daily-shimmer-sweep {
            0%, 100% { background-position: 200% center; }
            50% { background-position: -200% center; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
