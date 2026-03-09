/**
 * EggHatchAnimation — full-screen Dialog with a 3-second wobble → crack → reveal sequence.
 * Tap anywhere to skip to the final state.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { getPetById, RARITY_GLOW, RARITY_STYLES, type PetRarity, type GrowthSize } from '@/data/PetDatabase';
import { PixelIcon } from '@/components/ui/PixelIcon';
import type { PendingPet } from '@/stores/landStore';

const EGG_ICON_MAP: Record<string, string> = {
  common: 'egg',
  rare: 'egg-rare',
  epic: 'egg-epic',
  legendary: 'egg-legendary',
};

interface EggHatchAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  eggRarity: string;
  result: PendingPet;
}

type Phase = 'wobble' | 'crack' | 'reveal' | 'info';

/** Generate burst particle positions */
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
    const dist = 50 + Math.random() * 30;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
    };
  });
}

export const EggHatchAnimation = ({ isOpen, onClose, eggRarity, result }: EggHatchAnimationProps) => {
  const [phase, setPhase] = useState<Phase>('wobble');
  const [skipped, setSkipped] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const species = getPetById(result.petId);
  const rarity = result.rarity as PetRarity;
  const style = RARITY_STYLES[rarity];
  const glowColor = RARITY_GLOW[rarity];
  const isHighRarity = rarity === 'epic' || rarity === 'legendary';
  const particleCount = isHighRarity ? 12 : 8;
  const particles = useRef(generateParticles(particleCount));

  // Reset on open
  useEffect(() => {
    if (!isOpen) {
      setPhase('wobble');
      setSkipped(false);
      particles.current = generateParticles(particleCount);
      return;
    }

    // Run phase timeline
    const t1 = setTimeout(() => setPhase('crack'), 800);
    const t2 = setTimeout(() => setPhase('reveal'), 1500);
    const t3 = setTimeout(() => setPhase('info'), 2500);
    timersRef.current = [t1, t2, t3];

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isOpen, particleCount]);

  const handleSkip = useCallback(() => {
    if (phase === 'info') return; // Already at final state
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setSkipped(true);
    setPhase('info');
  }, [phase]);

  if (!species) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-[320px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl"
        style={{
          background: phase === 'info' || phase === 'reveal'
            ? `linear-gradient(180deg, ${style.bg} 0%, ${style.bgEnd} 100%)`
            : 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
        }}
        onClick={handleSkip}
      >
        <VisuallyHidden>
          <DialogTitle>Hatching Egg</DialogTitle>
        </VisuallyHidden>

        <div className="flex flex-col items-center justify-center min-h-[360px] relative">
          {/* Flash overlay for epic/legendary */}
          {isHighRarity && (phase === 'reveal') && !skipped && (
            <div
              className="absolute inset-0 bg-background pointer-events-none rounded-2xl z-10"
              style={{ animation: 'egg-flash 0.3s ease-out forwards' }}
            />
          )}

          {/* Egg (visible during wobble + crack) */}
          {(phase === 'wobble' || phase === 'crack') && (
            <div
              className="relative"
              style={{
                animation: skipped ? 'none' : (
                  phase === 'wobble'
                    ? 'egg-hatch-wobble 0.35s ease-in-out infinite'
                    : 'egg-hatch-wobble 0.15s ease-in-out infinite'
                ),
              }}
            >
              <PixelIcon name={EGG_ICON_MAP[eggRarity] || 'egg'} size={128} />

              {/* Crack lines — use foreground color with glow for visibility on any bg */}
              {phase === 'crack' && !skipped && (
                <svg
                  className="absolute inset-0 w-full h-full text-foreground"
                  viewBox="0 0 128 128"
                  style={{ opacity: 0, animation: 'fade-in 0.3s ease-out forwards' }}
                >
                  <line x1="52" y1="35" x2="42" y2="70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }} />
                  <line x1="64" y1="28" x2="72" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }} />
                  <line x1="78" y1="40" x2="86" y2="68" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }} />
                </svg>
              )}
            </div>
          )}

          {/* Pet reveal + particles */}
          {(phase === 'reveal' || phase === 'info') && (
            <div className="relative flex flex-col items-center">
              {/* Burst particles */}
              {!skipped && (
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                  {particles.current.map((p, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        backgroundColor: style.accent,
                        left: '50%',
                        top: '50%',
                        '--dx': `${p.dx}px`,
                        '--dy': `${p.dy}px`,
                        animation: `burst-particle 0.7s ease-out ${i * 0.03}s forwards`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              )}

              {/* Pet sprite */}
              <div
                className="relative w-32 h-32 flex items-center justify-center rounded-2xl mb-4"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--card) / 0.8), hsl(var(--card) / 0.4))',
                  border: `3px solid ${style.border}`,
                  boxShadow: glowColor
                    ? `0 0 24px ${glowColor}, 0 4px 16px rgba(0,0,0,0.08)`
                    : '0 4px 16px rgba(0,0,0,0.08)',
                }}
              >
                <img
                  src={species.imagePath}
                  alt={species.name}
                  className="w-full h-full object-contain"
                  style={{
                    imageRendering: 'pixelated',
                    animation: skipped ? 'none' : 'pet-hatch-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                    filter: glowColor ? `drop-shadow(0 0 8px ${glowColor})` : undefined,
                  }}
                  draggable={false}
                />
              </div>

              {/* Info — name + rarity badge */}
              {phase === 'info' && (
                <div
                  className="text-center space-y-2"
                  style={{ animation: skipped ? 'none' : 'fade-in 0.3s ease-out' }}
                >
                  <h3 className="text-xl font-black tracking-tight text-foreground">
                    {species.name}
                  </h3>

                  <div className="flex items-center justify-center gap-2">
                    <span
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wide"
                      style={{
                        background: style.bg,
                        color: style.color,
                        border: `1.5px solid ${style.border}`,
                      }}
                    >
                      {style.label}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed px-4 text-muted-foreground">
                    {species.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Skip hint (small, non-intrusive) */}
          {phase !== 'info' && !skipped && (
            <p className="absolute bottom-4 text-[10px] font-medium text-muted-foreground/40">
              Tap to skip
            </p>
          )}
        </div>

        {/* Done button — only in info phase */}
        {phase === 'info' && (
          <div className="px-5 pb-5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.97] touch-manipulation min-h-[48px] text-white"
              style={{
                background: style.color,
                boxShadow: `0 3px 0 ${style.text}, 0 6px 16px ${style.accent}40`,
              }}
            >
              Done
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
