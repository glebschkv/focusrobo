import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMilestoneCelebrations } from '@/hooks/useMilestoneCelebrations';
import { cn } from '@/lib/utils';
import { Milestone } from '@/data/GamificationData';
import { Sparkles, Gift } from 'lucide-react';
import { PixelIcon } from '@/components/ui/PixelIcon';

interface MilestoneCelebrationProps {
  onClaimReward?: (milestone: Milestone) => void;
  /** When true, keep the Dialog closed (a higher-priority modal is showing). */
  suppress?: boolean;
}

export const MilestoneCelebration = ({ onClaimReward, suppress }: MilestoneCelebrationProps) => {
  const { showCelebration, pendingCelebration, dismissCelebration, getCelebrationType } = useMilestoneCelebrations();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number }[]>([]);
  const lastCelebrationRef = useRef<Milestone | null>(null);

  // Delay unsuppression so a closing higher-priority Dialog portal can fully
  // unmount before this one opens (prevents orphaned bg-black/60 overlay on iOS).
  const [delayedSuppress, setDelayedSuppress] = useState(!!suppress);
  useEffect(() => {
    if (suppress) {
      setDelayedSuppress(true);
    } else {
      const timer = setTimeout(() => setDelayedSuppress(false), 400);
      return () => clearTimeout(timer);
    }
  }, [suppress]);
  if (pendingCelebration) lastCelebrationRef.current = pendingCelebration;

  const celebrationType = getCelebrationType();

  useEffect(() => {
    if (showCelebration && pendingCelebration) {
      const newParticles = [];
      const colors = getParticleColors(celebrationType || 'confetti');

      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 1,
        });
      }
      setParticles(newParticles);
    }
  }, [showCelebration, pendingCelebration, celebrationType]);

  const getParticleColors = (type: string): string[] => {
    switch (type) {
      case 'confetti':
        return ['#f43f5e', '#8b5cf6', '#3b82f6', '#22c55e', '#f97316', '#fbbf24'];
      case 'fireworks':
        return ['#fbbf24', '#f97316', '#ef4444', '#ec4899', '#f43f5e'];
      case 'stars':
        return ['#fbbf24', '#f59e0b', '#fcd34d', '#fef3c7'];
      case 'rainbow':
        return ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
      default:
        return ['#3b82f6', '#8b5cf6', '#22c55e'];
    }
  };

  const handleClaim = () => {
    if (pendingCelebration && onClaimReward) {
      onClaimReward(pendingCelebration);
    }
    dismissCelebration();
  };

  const displayCelebration = pendingCelebration || lastCelebrationRef.current;
  if (!displayCelebration) return null;

  return (
    <Dialog open={!delayedSuppress && showCelebration && !!pendingCelebration} onOpenChange={(open) => { if (!open) handleClaim(); }}>
      <DialogContent className="retro-modal max-w-[320px] p-0 overflow-hidden border-0">
        <VisuallyHidden>
          <DialogTitle>Milestone Celebration</DialogTitle>
        </VisuallyHidden>

        {/* Header with particles */}
        <div className="retro-modal-header relative overflow-hidden" style={{ padding: '32px 24px 24px' }}>
          <div className="retro-scanlines opacity-15" />

          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute animate-celebration-particle"
                style={{
                  left: `${particle.x}%`,
                  top: '-10%',
                  backgroundColor: particle.color,
                  width: celebrationType === 'stars' ? '10px' : '6px',
                  height: celebrationType === 'stars' ? '10px' : '6px',
                  borderRadius: celebrationType === 'stars' ? '0' : '50%',
                  transform: celebrationType === 'stars' ? 'rotate(45deg)' : 'none',
                  animationDelay: `${particle.delay}s`,
                  animationDuration: '2s',
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-[1] text-center">
            {/* Icon */}
            <div className="relative inline-block mb-3">
              <div
                className="absolute inset-0 rounded-full blur-xl scale-[2.5]"
                style={{ background: 'hsl(45 100% 50% / 0.2)' }}
              />
              <div className="relative animate-bounce" style={{ animationDuration: '2s' }}>
                <PixelIcon name={displayCelebration.icon} size={80} />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-amber-300 animate-ping" style={{ animationDuration: '2s' }} />
              </div>
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-black uppercase tracking-tight mb-1"
              style={{ color: 'hsl(var(--foreground))', textShadow: 'none' }}
            >
              {displayCelebration.title}
            </h2>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))', textShadow: 'none' }}>
              {displayCelebration.description}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Rewards */}
          {displayCelebration.rewards && (
            <div className="space-y-1.5">
              <div
                className="text-[9px] font-black uppercase tracking-[0.2em] text-center"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                Rewards
              </div>
              <div className="space-y-1.5">
                {displayCelebration.rewards.xp && (
                  <div className="retro-reward-item legendary">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'hsl(42 40% 92%)',
                        border: '1.5px solid hsl(42 35% 78%)',
                      }}
                    >
                      <PixelIcon name="star" size={16} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold" style={{ color: 'hsl(42 65% 38%)' }}>+{displayCelebration.rewards.xp} XP</span>
                    </div>
                  </div>
                )}
                {displayCelebration.rewards.coins && (
                  <div className="retro-reward-item legendary">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'hsl(42 40% 92%)',
                        border: '1.5px solid hsl(42 35% 78%)',
                      }}
                    >
                      <PixelIcon name="coin" size={16} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold" style={{ color: 'hsl(42 65% 38%)' }}>+{displayCelebration.rewards.coins} Coins</span>
                    </div>
                  </div>
                )}
                {displayCelebration.rewards.badge && (
                  <div className="retro-reward-item epic">
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'hsl(262 35% 92%)',
                        border: '1.5px solid hsl(262 30% 78%)',
                      }}
                    >
                      <PixelIcon name="sports-medal" size={16} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold" style={{ color: 'hsl(262 55% 42%)' }}>New Badge!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Claim button */}
          <button
            onClick={handleClaim}
            className={cn(
              "retro-arcade-btn retro-arcade-btn-green w-full py-3 text-sm tracking-wider touch-manipulation",
              "flex items-center justify-center gap-2"
            )}
          >
            <Gift className="w-5 h-5" />
            Claim Rewards!
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
