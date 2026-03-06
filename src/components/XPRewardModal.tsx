import { useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { XPReward } from "@/hooks/useXPSystem";
import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/ui/PixelIcon";

interface XPRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: XPReward | null;
  newLevel: number;
  levelProgress: number;
}

export const XPRewardModal = ({
  isOpen,
  onClose,
  reward,
  newLevel,
  levelProgress
}: XPRewardModalProps) => {
  // Cache last valid reward so content persists during Dialog close animation
  const lastRewardRef = useRef<XPReward | null>(null);
  if (reward) lastRewardRef.current = reward;
  const displayReward = reward || lastRewardRef.current;

  if (!displayReward) return null;

  // Guard open with content presence — on iOS/Capacitor, a Dialog opening
  // without content (or closing abruptly via state race) can leave an orphaned
  // bg-black/60 overlay that blocks the entire screen.
  return (
    <Dialog open={isOpen && !!displayReward} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="retro-modal max-w-[320px] p-0 overflow-hidden border-0 max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Session Complete</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="retro-modal-header p-5 text-center relative">
          <div className="retro-scanlines opacity-20" />

          <div className="relative z-[1]">
            <div
              className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: 'hsl(42 65% 52%)',
                border: '2px solid hsl(42 55% 42%)',
                boxShadow: '0 2px 0 hsl(42 55% 36%)',
              }}
            >
              <PixelIcon name="lightning" size={28} />
            </div>

            <h2 className="text-xl font-black uppercase tracking-tight" style={{ color: 'hsl(150 10% 12%)' }}>
              Session Complete!
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* XP Gained */}
          <div className={cn("retro-reward-item legendary", "flex-col !items-center !gap-1 py-3")}>
            {displayReward.hasBonusXP && (
              <div
                className="inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-1 animate-pulse border"
                style={{
                  background: displayReward.bonusType === 'mega_bonus'
                    ? 'hsl(42 65% 52%)'
                    : displayReward.bonusType === 'super_lucky'
                    ? 'hsl(270 40% 50%)'
                    : 'hsl(152 44% 45%)',
                  borderColor: displayReward.bonusType === 'mega_bonus'
                    ? 'hsl(42 55% 42%)'
                    : displayReward.bonusType === 'super_lucky'
                    ? 'hsl(270 35% 42%)'
                    : 'hsl(152 40% 38%)',
                  color: 'white',
                }}
              >
                <PixelIcon name="fire" size={12} />
                {displayReward.bonusType === 'mega_bonus' && 'MEGA BONUS! 2x XP'}
                {displayReward.bonusType === 'super_lucky' && 'SUPER LUCKY! 1.5x XP'}
                {displayReward.bonusType === 'lucky' && 'LUCKY! +25% XP'}
              </div>
            )}
            <div className="flex items-center justify-center gap-2">
              <PixelIcon name="star" size={20} />
              <span className="text-2xl font-black tabular-nums text-amber-600">
                +{displayReward.xpGained}
              </span>
              <span className="text-sm font-bold text-amber-500/70">XP</span>
            </div>
            {displayReward.hasBonusXP && displayReward.bonusXP > 0 && (
              <p className="text-[10px] text-green-400 font-bold">
                (+{displayReward.bonusXP} bonus XP!)
              </p>
            )}
            <p className="text-[10px] text-amber-400/50">
              Great focus session!
            </p>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="retro-level-badge px-2 py-0.5 text-xs">
                <span className="font-bold">LV.{newLevel}</span>
              </div>
              <span
                className="text-xs font-mono font-bold"
                style={{ color: 'hsl(150 10% 50%)' }}
              >
                {Math.round(levelProgress)}%
              </span>
            </div>
            <div className="retro-xp-bar">
              <div
                className="retro-xp-fill"
                style={{ width: `${Math.max(2, levelProgress)}%` }}
              >
                <div className="shine" />
              </div>
            </div>
          </div>

          {/* Level Up Celebration */}
          {displayReward.leveledUp && (
            <div
              className="relative overflow-hidden rounded-lg p-4 text-center"
              style={{
                background: 'hsl(42 65% 52%)',
                border: '2px solid hsl(42 55% 42%)',
                boxShadow: '0 2px 0 hsl(42 55% 36%)',
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <PixelIcon name="trophy" size={24} />
                <span className="text-lg font-black uppercase tracking-wide text-white">
                  Level Up!
                </span>
                <PixelIcon name="sparkles" size={20} />
              </div>
              <p className="text-sm text-white/90 font-bold">
                You reached Level {displayReward.newLevel}!
              </p>
            </div>
          )}

          {/* Unlocked Rewards */}
          {displayReward.unlockedRewards.length > 0 && (
            <div className="space-y-2">
              <div
                className="text-[9px] font-black uppercase tracking-[0.2em] text-center"
                style={{ color: 'hsl(150 10% 40%)' }}
              >
                <PixelIcon name="gift" size={12} className="inline mr-1" />
                New Unlocks
              </div>

              <div className="space-y-1.5">
                {displayReward.unlockedRewards.map((unlock, index) => (
                  <div
                    key={index}
                    className={cn(
                      "retro-reward-item",
                      unlock.type === 'zone' ? '' : 'epic'
                    )}
                  >
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: unlock.type === 'zone'
                          ? 'linear-gradient(180deg, hsl(260 30% 22%), hsl(260 35% 16%))'
                          : 'linear-gradient(180deg, hsl(320 35% 25%), hsl(320 30% 18%))',
                        border: unlock.type === 'zone'
                          ? '2px solid hsl(260 35% 30%)'
                          : '2px solid hsl(320 40% 35%)',
                      }}
                    >
                      {unlock.type === 'zone' ? (
                        <span className="text-sm">🌍</span>
                      ) : (
                        <span className="text-sm">🐾</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-purple-100/90">{unlock.name}</span>
                        <span
                          className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded"
                          style={{
                            background: unlock.type === 'zone'
                              ? 'hsl(260 40% 30%)'
                              : 'hsl(320 40% 30%)',
                            color: unlock.type === 'zone'
                              ? 'hsl(260 60% 75%)'
                              : 'hsl(320 60% 75%)',
                          }}
                        >
                          {unlock.type === 'zone' ? 'World' : 'Pet'}
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-300/50">
                        {unlock.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="retro-arcade-btn retro-arcade-btn-green w-full py-3 text-sm tracking-wider touch-manipulation"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
