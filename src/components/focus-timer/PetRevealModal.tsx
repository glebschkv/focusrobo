/**
 * PetRevealModal Component
 *
 * Shown after a focus session completes. Now includes a choice phase:
 * - "Random Roll" (free) — shows the pre-generated random pet
 * - "Pick a Pet" (50 coins) — shows 4 choices, user picks one
 */

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getPetById, GROWTH_SCALES, RARITY_GLOW, type GrowthSize, type PetRarity } from "@/data/PetDatabase";
import { Sparkles, Star, Shuffle, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLandStore } from "@/stores/landStore";
import { useCoinStore } from "@/stores/coinStore";

interface PetChoice {
  species: { id: string; name: string; rarity: string; imagePath: string };
  size: string;
}

export interface QuestDelta {
  name: string;
  oldPct: number;
  newPct: number;
  completed: boolean;
}

interface PetRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string | null;
  size: GrowthSize | null;
  rarity: PetRarity | null;
  sessionMinutes: number;
  cellIndex: number;
  /** Pet choices for the "Pick" option */
  petChoices?: PetChoice[];
  /** Session minutes for re-generating pet on pick */
  rewardMinutes?: number;
  /** Player level for re-generating pet on pick */
  rewardLevel?: number;
  /** Quest progress deltas for impact summary */
  questDeltas?: QuestDelta[];
  /** Achievements unlocked during this session */
  unlockedAchievements?: string[];
  /** Current streak day count */
  streakDay?: number;
}

const SIZE_LABELS: Record<GrowthSize, string> = {
  baby: 'Baby',
  adolescent: 'Adolescent',
  adult: 'Adult',
};

const SIZE_EMOJI: Record<GrowthSize, string> = {
  baby: '🌱',
  adolescent: '🌿',
  adult: '🌳',
};

const RARITY_CONFIG: Record<PetRarity, {
  label: string;
  color: string;
  bgFrom: string;
  bgTo: string;
  accent: string;
  borderColor: string;
  starCount: number;
  showSparkles: boolean;
}> = {
  common: {
    label: 'Common',
    color: '#78909C',
    bgFrom: '#ECEFF1',
    bgTo: '#CFD8DC',
    accent: '#90A4AE',
    borderColor: '#B0BEC5',
    starCount: 1,
    showSparkles: false,
  },
  uncommon: {
    label: 'Uncommon',
    color: '#43A047',
    bgFrom: '#E8F5E9',
    bgTo: '#C8E6C9',
    accent: '#66BB6A',
    borderColor: '#81C784',
    starCount: 2,
    showSparkles: false,
  },
  rare: {
    label: 'Rare',
    color: '#1E88E5',
    bgFrom: '#E3F2FD',
    bgTo: '#BBDEFB',
    accent: '#42A5F5',
    borderColor: '#64B5F6',
    starCount: 3,
    showSparkles: true,
  },
  epic: {
    label: 'Epic',
    color: '#8E24AA',
    bgFrom: '#F3E5F5',
    bgTo: '#CE93D8',
    accent: '#AB47BC',
    borderColor: '#BA68C8',
    starCount: 4,
    showSparkles: true,
  },
  legendary: {
    label: 'Legendary',
    color: '#F57F17',
    bgFrom: '#FFF8E1',
    bgTo: '#FFE082',
    accent: '#FFB300',
    borderColor: '#FFD54F',
    starCount: 5,
    showSparkles: true,
  },
};

const PICK_COST = 50;

export const PetRevealModal = ({
  isOpen,
  onClose,
  petId,
  size,
  rarity,
  sessionMinutes,
  petChoices = [],
  rewardMinutes = 0,
  rewardLevel = 1,
  questDeltas = [],
  unlockedAchievements = [],
  streakDay = 0,
}: PetRevealModalProps) => {
  const [phase, setPhase] = useState<'choice' | 'reveal' | 'impact'>('choice');
  const hasImpactContent = questDeltas.length > 0 || unlockedAchievements.length > 0;
  const [revealPetId, setRevealPetId] = useState<string | null>(null);
  const [revealSize, setRevealSize] = useState<GrowthSize | null>(null);
  const [revealRarity, setRevealRarity] = useState<PetRarity | null>(null);

  const coinBalance = useCoinStore((s) => s.balance);
  const canAffordPick = coinBalance >= PICK_COST;

  const handleRandomRoll = useCallback(() => {
    // Place the pre-generated random pet on the island now
    useLandStore.getState().placePendingPet();
    setRevealPetId(petId);
    setRevealSize(size);
    setRevealRarity(rarity);
    setPhase('reveal');
  }, [petId, size, rarity]);

  const handlePickPet = useCallback((choice: PetChoice) => {
    // Spend coins and choose the specific pet
    if (!canAffordPick) return;
    useCoinStore.getState().spendCoins(PICK_COST);
    // Replace the pre-placed random pet with the chosen one
    const pending = useLandStore.getState().choosePet(choice.species.id, rewardMinutes);
    useLandStore.getState().placePendingPet();
    setRevealPetId(pending.petId);
    setRevealSize(pending.size);
    setRevealRarity(pending.rarity as PetRarity);
    setPhase('reveal');
  }, [canAffordPick, rewardMinutes]);

  const handleContinueFromReveal = useCallback(() => {
    if (hasImpactContent) {
      setPhase('impact');
    } else {
      setPhase('choice');
      setRevealPetId(null);
      setRevealSize(null);
      setRevealRarity(null);
      onClose();
    }
  }, [hasImpactContent, onClose]);

  const handleClose = useCallback(() => {
    setPhase('choice');
    setRevealPetId(null);
    setRevealSize(null);
    setRevealRarity(null);
    onClose();
  }, [onClose]);

  if (!petId || !size || !rarity) return null;

  // Choice phase — show "Random" vs "Pick"
  if (phase === 'choice' && petChoices.length > 0) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
        <DialogContent className="max-w-[340px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl bg-white">
          <VisuallyHidden>
            <DialogTitle>Choose Your Reward</DialogTitle>
          </VisuallyHidden>

          <div className="px-5 pt-5 pb-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#78909C] mb-1">
              Session Complete!
            </p>
            <h3 className="text-lg font-bold text-[#37474F]">Choose Your Reward</h3>
          </div>

          {/* Random roll option */}
          <div className="px-5 pb-2">
            <button
              onClick={handleRandomRoll}
              className="w-full p-3.5 rounded-xl border-2 border-[#E0E0E0] bg-gradient-to-b from-white to-gray-50 flex items-center gap-3 transition-all active:scale-[0.98] hover:border-[#90CAF9] touch-manipulation min-h-[48px]"
            >
              <div className="w-10 h-10 rounded-lg bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
                <Shuffle className="w-5 h-5 text-[#1E88E5]" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-[#37474F]">Random Roll</p>
                <p className="text-[10px] text-[#90A4AE]">Mystery pet — could be anything!</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                Free
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="px-5 flex items-center gap-2">
            <div className="flex-1 h-px bg-[#E0E0E0]" />
            <span className="text-[9px] font-bold text-[#BDBDBD] uppercase">or</span>
            <div className="flex-1 h-px bg-[#E0E0E0]" />
          </div>

          {/* Pick option — 4 choices */}
          <div className="px-5 pt-2 pb-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <MousePointerClick className="w-3.5 h-3.5 text-[#78909C]" />
                <span className="text-xs font-bold text-[#546E7A]">Pick a Pet</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!canAffordPick && (
                  <span className="text-[9px] text-[#BDBDBD]">
                    ({coinBalance} owned)
                  </span>
                )}
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  canAffordPick ? "text-amber-600 bg-amber-50" : "text-red-400 bg-red-50"
                )}>
                  {PICK_COST} coins
                </span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {petChoices.map((choice, i) => {
                const choiceRarity = choice.species.rarity as PetRarity;
                const config = RARITY_CONFIG[choiceRarity];
                return (
                  <button
                    key={`${choice.species.id}-${i}`}
                    onClick={() => handlePickPet(choice)}
                    disabled={!canAffordPick}
                    className={cn(
                      "flex flex-col items-center p-2 rounded-xl border-2 transition-all touch-manipulation min-h-[44px]",
                      canAffordPick
                        ? "border-[#E0E0E0] active:scale-95 hover:border-[#90CAF9]"
                        : "border-[#F5F5F5] opacity-50"
                    )}
                    style={{ background: `${config.bgFrom}40` }}
                  >
                    <img
                      src={choice.species.imagePath}
                      alt={choice.species.name}
                      className="w-12 h-12 object-contain mb-1"
                      style={{ imageRendering: 'pixelated' }}
                      draggable={false}
                    />
                    <span className="text-[10px] font-bold text-[#37474F] truncate w-full text-center leading-tight">
                      {choice.species.name}
                    </span>
                    <span
                      className="text-[9px] font-bold uppercase mt-0.5"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Reveal phase — show the pet that was earned
  const displayPetId = revealPetId || petId;
  const displaySize = revealSize || size;
  const displayRarity = revealRarity || rarity;

  const species = getPetById(displayPetId);
  if (!species) return null;

  const scale = GROWTH_SCALES[displaySize];
  const glowColor = RARITY_GLOW[displayRarity];
  const config = RARITY_CONFIG[displayRarity];
  const isHighRarity = displayRarity === 'rare' || displayRarity === 'epic' || displayRarity === 'legendary';

  return (
    <Dialog open={isOpen && !!species} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent
        className="max-w-[320px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl"
        style={{
          background: `linear-gradient(180deg, ${config.bgFrom} 0%, ${config.bgTo} 100%)`,
        }}
      >
        <VisuallyHidden>
          <DialogTitle>New Pet Found</DialogTitle>
        </VisuallyHidden>

        {/* Header banner */}
        <div className="relative px-5 pt-5 pb-3 text-center overflow-hidden">
          {config.showSparkles && (
            <>
              <div className="absolute top-3 left-6 animate-pulse opacity-60">
                <Sparkles className="w-4 h-4" style={{ color: config.accent }} />
              </div>
              <div className="absolute top-5 right-5 animate-pulse opacity-40" style={{ animationDelay: '0.5s' }}>
                <Sparkles className="w-3 h-3" style={{ color: config.accent }} />
              </div>
              <div className="absolute bottom-2 left-10 animate-pulse opacity-30" style={{ animationDelay: '1s' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: config.accent }} />
              </div>
            </>
          )}

          <p
            className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
            style={{ color: config.color }}
          >
            New Pet Found!
          </p>

          <div className="flex items-center justify-center gap-0.5">
            {Array.from({ length: config.starCount }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3.5 h-3.5 fill-current",
                  isHighRarity && "animate-pulse"
                )}
                style={{
                  color: config.accent,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Pet display area */}
        <div className="px-5 pb-2 flex flex-col items-center">
          <div
            className="relative w-32 h-32 flex items-center justify-center rounded-2xl mb-4"
            style={{
              background: `linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))`,
              border: `3px solid ${config.borderColor}`,
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
                transform: `scale(${Math.max(scale, 0.8)})`,
                filter: glowColor ? `drop-shadow(0 0 8px ${glowColor})` : undefined,
                animation: 'pet-reveal-bounce 0.6s ease-out',
              }}
              draggable={false}
            />
            {displayRarity === 'legendary' && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 30%, rgba(234,179,8,0.25) 45%, rgba(234,179,8,0.08) 55%, transparent 70%)',
                  backgroundSize: '200% 100%',
                  animation: 'pet-land-shimmer 2s ease-in-out infinite',
                }}
              />
            )}
          </div>

          <div className="text-center space-y-2 w-full">
            <h3
              className="text-xl font-black tracking-tight"
              style={{ color: '#37474F' }}
            >
              {species.name}
            </h3>

            <div className="flex items-center justify-center gap-2">
              <span
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wide"
                style={{
                  background: `${config.color}18`,
                  color: config.color,
                  border: `1.5px solid ${config.color}30`,
                }}
              >
                {config.label}
              </span>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  color: '#546E7A',
                }}
              >
                {SIZE_EMOJI[displaySize]} {SIZE_LABELS[displaySize]}
              </span>
            </div>

            <p className="text-xs leading-relaxed px-2" style={{ color: '#78909C' }}>
              {species.description}
            </p>

            <p className="text-[10px] font-medium" style={{ color: '#B0BEC5' }}>
              Earned from a {sessionMinutes} minute session
            </p>
          </div>
        </div>

        {/* Continue button */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={handleContinueFromReveal}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.97] touch-manipulation min-h-[48px]"
            style={{
              background: config.color,
              color: '#fff',
              boxShadow: `0 3px 0 ${config.color}90, 0 6px 16px ${config.color}30`,
            }}
          >
            Continue
          </button>
        </div>

        {/* Bounce animation for pet image */}
        <style>{`
          @keyframes pet-reveal-bounce {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(${Math.max(scale, 0.8) * 1.15}); opacity: 1; }
            70% { transform: scale(${Math.max(scale, 0.8) * 0.95}); }
            100% { transform: scale(${Math.max(scale, 0.8)}); }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};
