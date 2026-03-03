/**
 * PetRevealModal Component
 *
 * Shown after a focus session completes to reveal the pet that was earned.
 * Displays the pet species, growth size, and rarity with a celebration animation.
 */

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { getPetById, GROWTH_SCALES, RARITY_GLOW, type GrowthSize, type PetRarity } from "@/data/PetDatabase";
import { Sparkles } from "lucide-react";

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

const RARITY_COLORS: Record<PetRarity, string> = {
  common: 'hsl(120 20% 50%)',
  uncommon: 'hsl(200 60% 55%)',
  rare: 'hsl(220 70% 60%)',
  epic: 'hsl(270 60% 60%)',
  legendary: 'hsl(45 90% 55%)',
};

const RARITY_BG: Record<PetRarity, string> = {
  common: 'linear-gradient(180deg, hsl(120 25% 30%), hsl(120 20% 22%))',
  uncommon: 'linear-gradient(180deg, hsl(200 40% 30%), hsl(200 35% 22%))',
  rare: 'linear-gradient(180deg, hsl(220 45% 32%), hsl(220 40% 22%))',
  epic: 'linear-gradient(180deg, hsl(270 40% 32%), hsl(270 35% 22%))',
  legendary: 'linear-gradient(180deg, hsl(45 60% 35%), hsl(40 55% 25%))',
};

export const PetRevealModal = ({
  isOpen,
  onClose,
  petId,
  size,
  rarity,
  sessionMinutes,
  cellIndex,
}: PetRevealModalProps) => {
  if (!petId || !size || !rarity) return null;

  const species = getPetById(petId);
  if (!species) return null;

  const scale = GROWTH_SCALES[size];
  const glowColor = RARITY_GLOW[rarity];
  const rarityColor = RARITY_COLORS[rarity];
  const rarityBg = RARITY_BG[rarity];

  return (
    <Dialog open={isOpen && !!species} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="retro-modal max-w-[320px] p-0 overflow-hidden border-0">
        <VisuallyHidden>
          <DialogTitle>New Pet Found</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="retro-modal-header p-5 text-center relative">
          <div className="retro-scanlines opacity-20" />
          <div className="relative z-[1]">
            <div
              className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: rarityBg,
                border: `3px solid ${rarityColor}`,
                boxShadow: `0 3px 0 hsl(0 0% 15%), 0 0 15px ${rarityColor}40`,
              }}
            >
              <Sparkles className="w-7 h-7" style={{ color: rarityColor, filter: `drop-shadow(0 0 4px ${rarityColor})` }} />
            </div>
            <h2
              className="text-xl font-black uppercase tracking-tight text-white"
              style={{ textShadow: '0 0 10px hsl(260 80% 70% / 0.5), 0 2px 0 rgba(0,0,0,0.3)' }}
            >
              New Pet!
            </h2>
          </div>
        </div>

        {/* Pet Display */}
        <div className="p-5 flex flex-col items-center gap-4">
          {/* Pet Image */}
          <div
            className="w-28 h-28 flex items-center justify-center rounded-xl relative"
            style={{
              background: 'linear-gradient(180deg, hsl(120 30% 85%), hsl(120 25% 75%))',
              border: `3px solid ${rarityColor}`,
              boxShadow: glowColor ? `0 0 20px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.3)` : 'inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          >
            <img
              src={species.imagePath}
              alt={species.name}
              className="w-full h-full object-contain"
              style={{
                imageRendering: 'pixelated',
                transform: `scale(${scale})`,
                filter: glowColor ? `drop-shadow(0 0 6px ${glowColor})` : undefined,
              }}
              draggable={false}
            />
            {rarity === 'legendary' && (
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 30%, rgba(234,179,8,0.3) 45%, rgba(234,179,8,0.1) 55%, transparent 70%)',
                  backgroundSize: '200% 100%',
                  animation: 'pet-land-shimmer 2s ease-in-out infinite',
                }}
              />
            )}
          </div>

          {/* Pet Info */}
          <div className="text-center space-y-1.5">
            <h3
              className="text-lg font-black"
              style={{ color: 'hsl(260 20% 20%)' }}
            >
              {species.name}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span
                className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                style={{
                  background: rarityBg,
                  color: rarityColor,
                  border: `1px solid ${rarityColor}40`,
                }}
              >
                {rarity}
              </span>
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                style={{
                  background: 'hsl(260 15% 92%)',
                  color: 'hsl(260 15% 45%)',
                }}
              >
                {SIZE_LABELS[size]}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'hsl(260 10% 55%)' }}>
              {species.description}
            </p>
            <p className="text-[10px]" style={{ color: 'hsl(260 10% 65%)' }}>
              Placed at cell {cellIndex + 1} &middot; {sessionMinutes}min session
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="retro-arcade-btn retro-arcade-btn-purple w-full py-3 text-sm tracking-wider touch-manipulation"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
