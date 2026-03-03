/**
 * PetRevealModal Component
 *
 * Shown after a focus session completes to reveal the pet that was earned.
 * Uses rarity-themed backgrounds and celebration effects.
 */

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getPetById, GROWTH_SCALES, RARITY_GLOW, type GrowthSize, type PetRarity } from "@/data/PetDatabase";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PetRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string | null;
  size: GrowthSize | null;
  rarity: PetRarity | null;
  sessionMinutes: number;
  cellIndex: number;
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

export const PetRevealModal = ({
  isOpen,
  onClose,
  petId,
  size,
  rarity,
  sessionMinutes,
}: PetRevealModalProps) => {
  if (!petId || !size || !rarity) return null;

  const species = getPetById(petId);
  if (!species) return null;

  const scale = GROWTH_SCALES[size];
  const glowColor = RARITY_GLOW[rarity];
  const config = RARITY_CONFIG[rarity];
  const isHighRarity = rarity === 'rare' || rarity === 'epic' || rarity === 'legendary';

  return (
    <Dialog open={isOpen && !!species} onOpenChange={(open) => { if (!open) onClose(); }}>
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
          {/* Floating sparkles for rare+ */}
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

          {/* Rarity stars */}
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
          {/* Pet image container */}
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
            {rarity === 'legendary' && (
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

          {/* Pet info */}
          <div className="text-center space-y-2 w-full">
            <h3
              className="text-xl font-black tracking-tight"
              style={{ color: '#37474F' }}
            >
              {species.name}
            </h3>

            {/* Rarity + size badges */}
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
                {SIZE_EMOJI[size]} {SIZE_LABELS[size]}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs leading-relaxed px-2" style={{ color: '#78909C' }}>
              {species.description}
            </p>

            {/* Session info */}
            <p className="text-[10px] font-medium" style={{ color: '#B0BEC5' }}>
              Earned from a {sessionMinutes} minute session
            </p>
          </div>
        </div>

        {/* Continue button */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.97]"
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
