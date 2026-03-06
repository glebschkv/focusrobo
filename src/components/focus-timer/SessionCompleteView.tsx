/**
 * SessionCompleteView
 *
 * Unified post-session celebration screen that replaces the chain of
 * SessionNotesModal → PetRevealModal → XPRewardModal with a single
 * cohesive scrollable view. Shows XP, pet reveal, mood rating, and
 * coins in one place with staggered animations.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { getPetById, GROWTH_SCALES, RARITY_GLOW, type GrowthSize, type PetRarity } from "@/data/PetDatabase";
import type { PendingPet } from "@/stores/landStore";
interface SessionCompleteViewProps {
  isVisible: boolean;
  onDismiss: (notes: string, rating: number) => void;
  onTakeBreak: () => void;
  /** Session duration in seconds */
  sessionDuration: number;
  /** XP earned this session */
  xpEarned: number;
  /** Coins earned this session */
  coinsEarned: number;
  /** Pet placed on island (null if no pet) */
  lastPlacedPet: PendingPet | null;
  /** Task label from intention modal */
  taskLabel?: string;
  /** Whether break option is available */
  showBreakOption: boolean;
}

const MOOD_OPTIONS = [
  { value: 1, icon: 'mood-exhausted', label: 'Struggled' },
  { value: 2, icon: 'mood-neutral', label: 'Okay' },
  { value: 3, icon: 'mood-content', label: 'Good' },
  { value: 4, icon: 'mood-happy', label: 'Great' },
  { value: 5, icon: 'mood-fire', label: 'Crushing it!' },
];

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

const RARITY_BADGE_COLORS: Record<PetRarity, { bg: string; text: string; border: string }> = {
  common: { bg: 'hsl(140 6% 90%)', text: 'hsl(140 6% 40%)', border: 'hsl(140 6% 80%)' },
  uncommon: { bg: 'hsl(160 40% 90%)', text: 'hsl(160 40% 35%)', border: 'hsl(160 40% 75%)' },
  rare: { bg: 'hsl(200 60% 90%)', text: 'hsl(200 60% 35%)', border: 'hsl(200 60% 75%)' },
  epic: { bg: 'hsl(270 50% 92%)', text: 'hsl(270 50% 40%)', border: 'hsl(270 50% 78%)' },
  legendary: { bg: 'hsl(42 75% 90%)', text: 'hsl(42 75% 35%)', border: 'hsl(42 75% 70%)' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.12,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export const SessionCompleteView = ({
  isVisible,
  onDismiss,
  onTakeBreak,
  sessionDuration,
  xpEarned,
  coinsEarned,
  lastPlacedPet,
  taskLabel,
  showBreakOption,
}: SessionCompleteViewProps) => {
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  const animatedXP = useAnimatedCounter(xpEarned, 900, isVisible);
  const animatedCoins = useAnimatedCounter(coinsEarned, 700, isVisible);

  const sessionMinutes = Math.floor(sessionDuration / 60);

  const pet = lastPlacedPet ? getPetById(lastPlacedPet.petId) : null;
  const petRarity = lastPlacedPet?.rarity;
  const petSize = lastPlacedPet?.size;
  const petGlow = petRarity ? RARITY_GLOW[petRarity] : null;
  const petScale = petSize ? GROWTH_SCALES[petSize] : 1;

  const handleDone = useCallback(() => {
    onDismiss(notes, rating);
    setNotes("");
    setRating(3);
    setShowNotes(false);
  }, [onDismiss, notes, rating]);

  const handleBreak = useCallback(() => {
    onDismiss(notes, rating);
    setNotes("");
    setRating(3);
    setShowNotes(false);
    // Short delay so notes save before break modal opens
    setTimeout(() => onTakeBreak(), 100);
  }, [onDismiss, onTakeBreak, notes, rating]);

  let cardIndex = 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Content */}
          <motion.div
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl bg-background"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <motion.div
              className="text-center px-5 pt-2 pb-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.35 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
                style={{
                  background: 'linear-gradient(135deg, hsl(152 44% 45%), hsl(152 55% 52%))',
                  boxShadow: '0 4px 12px hsl(152 44% 45% / 0.3)',
                }}
              >
                <PixelIcon name="trophy" size={30} />
              </div>
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Session Complete!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {sessionMinutes} min focused{taskLabel ? ` on ${taskLabel}` : ''}
              </p>
            </motion.div>

            <div className="px-5 pb-6 space-y-3">
              {/* XP Card */}
              {xpEarned > 0 && (
                <motion.div
                  className="rounded-2xl border border-border bg-card p-4"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <div className="flex items-center gap-2">
                    <PixelIcon name="star" size={20} />
                    <span className="text-2xl font-black tabular-nums" style={{ color: 'hsl(42 65% 45%)' }}>
                      +{animatedXP}
                    </span>
                    <span className="text-sm font-bold" style={{ color: 'hsl(42 65% 55%)' }}>XP</span>
                  </div>
                </motion.div>
              )}

              {/* Pet Reveal Card */}
              {pet && petRarity && petSize && (
                <motion.div
                  className="rounded-2xl border overflow-hidden"
                  style={{
                    borderColor: RARITY_BADGE_COLORS[petRarity].border,
                    background: `linear-gradient(180deg, ${RARITY_BADGE_COLORS[petRarity].bg}, hsl(var(--card)))`,
                  }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <div className="p-4 flex items-center gap-4">
                    {/* Pet image */}
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(255,255,255,0.6)',
                        border: `2px solid ${RARITY_BADGE_COLORS[petRarity].border}`,
                        boxShadow: petGlow ? `0 0 16px ${petGlow}` : undefined,
                      }}
                    >
                      <img
                        src={pet.imagePath}
                        alt={pet.name}
                        className="w-full h-full object-contain"
                        style={{
                          imageRendering: 'pixelated',
                          transform: `scale(${Math.max(petScale, 0.8)})`,
                          filter: petGlow ? `drop-shadow(0 0 6px ${petGlow})` : undefined,
                          animation: 'pet-reveal-bounce 0.6s ease-out',
                        }}
                        draggable={false}
                      />
                    </div>

                    {/* Pet info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                        New Pet!
                      </p>
                      <h3 className="text-lg font-black tracking-tight text-foreground">
                        {pet.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{
                            background: RARITY_BADGE_COLORS[petRarity].bg,
                            color: RARITY_BADGE_COLORS[petRarity].text,
                            border: `1px solid ${RARITY_BADGE_COLORS[petRarity].border}`,
                          }}
                        >
                          {petRarity}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {SIZE_EMOJI[petSize]} {SIZE_LABELS[petSize]}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Coins Card */}
              {coinsEarned > 0 && (
                <motion.div
                  className="rounded-2xl border border-border bg-card p-3 flex items-center justify-between"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <div className="flex items-center gap-2">
                    <PixelIcon name="coin" size={20} />
                    <span className="text-lg font-black tabular-nums" style={{ color: 'hsl(42 65% 45%)' }}>
                      +{animatedCoins}
                    </span>
                    <span className="text-xs font-bold" style={{ color: 'hsl(42 65% 55%)' }}>Coins</span>
                  </div>
                </motion.div>
              )}

              {/* Mood Rating */}
              <motion.div
                className="rounded-2xl border border-border bg-card p-4"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={cardIndex++}
              >
                <p className="text-xs font-semibold text-foreground mb-2.5">How did it go?</p>
                <div className="flex gap-1.5 justify-between">
                  {MOOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRating(option.value)}
                      className={cn(
                        "flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-150",
                        "active:scale-90 touch-manipulation",
                        rating === option.value
                          ? "bg-amber-100 ring-2 ring-amber-400"
                          : "bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <PixelIcon name={option.icon} size={24} />
                      <span className="text-[8px] font-semibold text-muted-foreground leading-tight">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Expandable notes */}
                {!showNotes ? (
                  <button
                    onClick={() => setShowNotes(true)}
                    className="mt-2.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    + Add a note
                  </button>
                ) : (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any thoughts about this session?"
                    className="mt-2.5 w-full h-16 p-3 rounded-xl bg-muted/50 border border-border text-xs resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
                    autoFocus
                  />
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="pt-2 space-y-2"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={cardIndex++}
              >
                {showBreakOption ? (
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleDone}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-semibold text-sm",
                        "border border-border text-foreground",
                        "active:scale-[0.97] transition-all duration-150 touch-manipulation"
                      )}
                    >
                      Done
                    </button>
                    <button
                      onClick={handleBreak}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold text-sm text-white",
                        "active:scale-[0.97] transition-all duration-150 touch-manipulation"
                      )}
                      style={{
                        background: 'hsl(var(--primary))',
                        boxShadow: '0 3px 0 hsl(var(--primary) / 0.7), 0 6px 12px hsl(var(--primary) / 0.15)',
                      }}
                    >
                      Take a Break
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleDone}
                    className={cn(
                      "w-full py-3.5 rounded-xl font-bold text-sm text-white tracking-wide",
                      "active:scale-[0.97] transition-all duration-150 touch-manipulation"
                    )}
                    style={{
                      background: 'hsl(var(--primary))',
                      boxShadow: '0 3px 0 hsl(var(--primary) / 0.7), 0 6px 12px hsl(var(--primary) / 0.15)',
                    }}
                  >
                    Done
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Pet bounce animation */}
          <style>{`
            @keyframes pet-reveal-bounce {
              0% { transform: scale(0.3); opacity: 0; }
              50% { transform: scale(1.15); opacity: 1; }
              70% { transform: scale(0.95); }
              100% { transform: scale(1); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
