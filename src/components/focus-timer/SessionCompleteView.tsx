/**
 * SessionCompleteView
 *
 * Unified post-session celebration screen. Shows XP, egg reward with
 * tap-to-hatch animation, pet reveal, mood rating, and coins in one
 * cohesive scrollable view with staggered animations.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useHaptics } from "@/hooks/useHaptics";
import { getPetById, GROWTH_SCALES, RARITY_GLOW, RARITY_STYLES, type GrowthSize, type PetRarity, type EggTier } from "@/data/PetDatabase";
import { FOCUS_BONUS } from "@/lib/constants";
import type { Milestone } from "@/types/gamification";
import type { PendingPet, PendingEgg } from "@/stores/landStore";

export interface QuestDelta {
  name: string;
  oldPct: number;
  newPct: number;
  completed: boolean;
}

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
  /** Pet placed on island after hatching (null before hatch) */
  lastPlacedPet: PendingPet | null;
  /** Session egg to hatch (null if no egg or already hatched) */
  pendingSessionEgg: PendingEgg | null;
  /** Hatch the pending egg */
  onHatchEgg: () => void;
  /** Navigate to island to see placed pet */
  onGoToIsland: () => void;
  /** Task label from intention modal */
  taskLabel?: string;
  /** Whether break option is available */
  showBreakOption: boolean;
  /** Quest progress deltas for impact summary */
  questDeltas?: QuestDelta[];
  /** Current streak day count */
  streakDay?: number;
  /** Level-up info if user leveled up during this session */
  levelUpInfo?: { newLevel: number; oldLevel: number; unlockedRewards: Array<{ name: string; description: string }> } | null;
  /** Milestone achieved during this session */
  milestoneInfo?: Milestone | null;
  /** Focus bonus type ('PERFECT FOCUS' | 'GOOD FOCUS' | '') */
  focusBonusType?: string;
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

const SIZE_ICONS: Record<GrowthSize, string> = {
  baby: 'sprout',
  adolescent: 'four-leaf-clover',
  adult: 'mushroom',
};

const EGG_SIZE_LABELS: Record<GrowthSize, string> = {
  baby: 'Small',
  adolescent: 'Medium',
  adult: 'Large',
};

/** Badge colors derived from shared RARITY_STYLES */
const RARITY_BADGE_COLORS = Object.fromEntries(
  (Object.entries(RARITY_STYLES) as [PetRarity, typeof RARITY_STYLES[PetRarity]][]).map(
    ([key, style]) => [key, { bg: style.bg, text: style.text, border: style.border }]
  )
) as Record<PetRarity, { bg: string; text: string; border: string }>;

/** Map egg tier to its icon name and rarity badge color key */
const EGG_TIER_CONFIG: Record<EggTier, { icon: string; badgeKey: PetRarity; label: string }> = {
  common: { icon: 'egg', badgeKey: 'common', label: 'Common Egg' },
  rare: { icon: 'egg-rare', badgeKey: 'rare', label: 'Rare Egg' },
  epic: { icon: 'egg-epic', badgeKey: 'epic', label: 'Epic Egg' },
  legendary: { icon: 'egg-legendary', badgeKey: 'legendary', label: 'Legendary Egg' },
};

/** Crack frame icons per egg tier (3 frames each) */
const EGG_CRACK_ICONS: Record<EggTier, [string, string, string]> = {
  common: ['egg-crack-1', 'egg-crack-2', 'egg-crack-3'],
  rare: ['egg-rare-crack-1', 'egg-rare-crack-2', 'egg-rare-crack-3'],
  epic: ['egg-epic-crack-1', 'egg-epic-crack-2', 'egg-epic-crack-3'],
  legendary: ['egg-legendary-crack-1', 'egg-legendary-crack-2', 'egg-legendary-crack-3'],
};

/** Hatch duration in ms per egg tier */
const HATCH_DURATIONS: Record<EggTier, number> = {
  common: 800,
  rare: 1200,
  epic: 1800,
  legendary: 2500,
};

type EggPhase = 'idle' | 'hatching' | 'revealed';

export const SessionCompleteView = ({
  isVisible,
  onDismiss,
  onTakeBreak,
  sessionDuration,
  xpEarned,
  coinsEarned,
  lastPlacedPet,
  pendingSessionEgg,
  onHatchEgg,
  onGoToIsland,
  taskLabel,
  showBreakOption,
  questDeltas = [],
  streakDay = 0,
  levelUpInfo,
  milestoneInfo,
  focusBonusType = '',
}: SessionCompleteViewProps) => {
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [eggPhase, setEggPhase] = useState<EggPhase>('idle');
  const [crackFrame, setCrackFrame] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const { haptic } = useHaptics();
  const hatchTimerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  const animatedXP = useAnimatedCounter(xpEarned, prefersReducedMotion ? 0 : 900, isVisible);
  const animatedCoins = useAnimatedCounter(coinsEarned, prefersReducedMotion ? 0 : 700, isVisible);

  const sessionMinutes = Math.floor(sessionDuration / 60);

  const pet = lastPlacedPet ? getPetById(lastPlacedPet.petId) : null;
  const petRarity = lastPlacedPet?.rarity;
  const petSize = lastPlacedPet?.size;
  const petGlow = petRarity ? RARITY_GLOW[petRarity] : null;
  const petScale = petSize ? GROWTH_SCALES[petSize] : 1;

  // Auto-start hatch animation when the view opens with a new egg
  const autoHatchTriggeredRef = useRef(false);
  useEffect(() => {
    if (isVisible && pendingSessionEgg && !lastPlacedPet) {
      setEggPhase('idle');
      setCrackFrame(0);
      autoHatchTriggeredRef.current = false;
    }
  }, [isVisible, pendingSessionEgg, lastPlacedPet]);

  const handleTapToHatch = useCallback(() => {
    if (!pendingSessionEgg || eggPhase !== 'idle') return;

    haptic('medium');
    setEggPhase('hatching');

    const tier = pendingSessionEgg.eggTier;
    const totalDuration = prefersReducedMotion ? 300 : HATCH_DURATIONS[tier];
    const frameDelay = totalDuration / 4; // 3 crack frames + final hatch

    // Clear any previous timers
    hatchTimerIds.current.forEach(clearTimeout);
    hatchTimerIds.current = [];

    // Frame 1 (small cracks)
    hatchTimerIds.current.push(setTimeout(() => {
      setCrackFrame(1);
    }, frameDelay));

    // Frame 2 (bigger cracks)
    hatchTimerIds.current.push(setTimeout(() => {
      setCrackFrame(2);
    }, frameDelay * 2));

    // Frame 3 (fully cracked)
    hatchTimerIds.current.push(setTimeout(() => {
      setCrackFrame(3);
      haptic('success');
    }, frameDelay * 3));

    // Hatch! Pet emerges
    hatchTimerIds.current.push(setTimeout(() => {
      onHatchEgg();
    }, totalDuration));
  }, [pendingSessionEgg, eggPhase, haptic, onHatchEgg, prefersReducedMotion]);

  // Trigger hatch animation automatically after egg appears
  useEffect(() => {
    if (isVisible && pendingSessionEgg && !lastPlacedPet && eggPhase === 'idle' && !autoHatchTriggeredRef.current) {
      autoHatchTriggeredRef.current = true;
      const autoHatchDelay = setTimeout(() => {
        handleTapToHatch();
      }, 1200);
      return () => clearTimeout(autoHatchDelay);
    }
  }, [isVisible, pendingSessionEgg, lastPlacedPet, eggPhase, handleTapToHatch]);

  // When lastPlacedPet appears (after hatch), transition to revealed
  useEffect(() => {
    if (lastPlacedPet && eggPhase === 'hatching') {
      setEggPhase('revealed');
    }
  }, [lastPlacedPet, eggPhase]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      hatchTimerIds.current.forEach(clearTimeout);
      hatchTimerIds.current = [];
    };
  }, []);

  // Haptic on modal appear
  useEffect(() => {
    if (isVisible) {
      haptic('success');
    }
  }, [isVisible, haptic]);

  const handleDone = useCallback(() => {
    onDismiss(notes, rating);
    setNotes("");
    setRating(3);
    setShowNotes(false);
    setEggPhase('idle');
    setCrackFrame(0);
  }, [onDismiss, notes, rating]);

  const handleBreak = useCallback(() => {
    onDismiss(notes, rating);
    setNotes("");
    setRating(3);
    setShowNotes(false);
    setEggPhase('idle');
    setCrackFrame(0);
    // Short delay so notes save before break modal opens
    setTimeout(() => onTakeBreak(), 100);
  }, [onDismiss, onTakeBreak, notes, rating]);

  // Staggered card animation variants — disabled when reduced motion is preferred
  const cardVariants = prefersReducedMotion
    ? { hidden: {}, visible: () => ({}) }
    : {
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

  const noMotion = { duration: 0 };

  let cardIndex = 0;

  // Determine what egg/pet card to show
  const showEggCard = pendingSessionEgg && eggPhase !== 'revealed';
  const showPetCard = eggPhase === 'revealed' && pet && petRarity && petSize;
  const eggTier = pendingSessionEgg?.eggTier ?? 'common';
  const eggConfig = EGG_TIER_CONFIG[eggTier];
  const eggBadge = RARITY_BADGE_COLORS[eggConfig.badgeKey];
  const eggGlow = RARITY_GLOW[eggConfig.badgeKey];

  // Determine current egg icon (base or crack frame)
  const currentEggIcon = eggPhase === 'hatching' && crackFrame > 0
    ? EGG_CRACK_ICONS[eggTier][Math.min(crackFrame - 1, 2)]
    : eggConfig.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? noMotion : { duration: 0.25 }}
        >
          {/* Backdrop — blocks scroll-through on iOS */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            style={{ touchAction: 'none' }}
          />

          {/* Content */}
          <motion.div
            className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl bg-background"
            role="dialog"
            aria-modal="true"
            aria-label="Session Complete"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={prefersReducedMotion ? noMotion : { type: "spring", damping: 28, stiffness: 300 }}
            style={{
              paddingBottom: 'calc(var(--dock-height, 82px) + env(safe-area-inset-bottom, 0px) + 8px)',
              overscrollBehavior: 'contain',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <motion.div
              className="text-center px-5 pt-2 pb-4"
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? noMotion : { delay: 0.05, duration: 0.35 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.85))',
                  boxShadow: '0 4px 12px hsl(var(--primary) / 0.3)',
                }}
              >
                <PixelIcon name="trophy" size={26} />
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
                  className="rounded-xl border border-border bg-card p-4"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <div className="flex items-center gap-2">
                    <PixelIcon name="star" size={20} />
                    <span className="text-2xl font-black tabular-nums text-primary">
                      +{animatedXP}
                    </span>
                    <span className="text-sm font-bold text-primary/70">XP</span>
                  </div>
                </motion.div>
              )}

              {/* Level-Up Banner */}
              {levelUpInfo && (
                <motion.div
                  className="rounded-xl overflow-hidden relative"
                  style={{
                    background: 'linear-gradient(135deg, hsl(42 80% 55%), hsl(42 60% 45%))',
                    border: '1px solid hsl(42 60% 40%)',
                  }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  {/* Mini confetti particles */}
                  {!prefersReducedMotion && Array.from({ length: 12 }).map((_, i) => (
                    <span
                      key={i}
                      className="absolute w-1 h-1 rounded-full pointer-events-none"
                      style={{
                        left: `${8 + Math.random() * 84}%`,
                        top: `-4px`,
                        background: ['#ef4444', '#8b5cf6', '#3b82f6', '#22c55e', '#f97316', '#eab308'][i % 6],
                        animation: `celebration-particle 2s ease-out ${i * 0.08}s forwards`,
                        opacity: 0.8,
                      }}
                    />
                  ))}
                  <div className="p-3 flex items-center gap-3 relative z-[1]">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'hsl(42 90% 65% / 0.3)',
                        border: '1px solid hsl(42 80% 70% / 0.4)',
                      }}
                    >
                      <PixelIcon name="trophy" size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white tracking-tight">
                        Level {levelUpInfo.newLevel} Reached!
                      </p>
                      {levelUpInfo.unlockedRewards.length > 0 && (
                        <p className="text-[10px] font-medium text-white/80 truncate mt-0.5">
                          Unlocked: {levelUpInfo.unlockedRewards.map(r => r.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Focus Bonus Card */}
              {focusBonusType && (
                <motion.div
                  className="rounded-xl border p-3 flex items-center gap-2.5"
                  style={{
                    borderColor: focusBonusType === FOCUS_BONUS.PERFECT_FOCUS.label
                      ? 'hsl(152 44% 45% / 0.4)'
                      : 'hsl(210 70% 55% / 0.4)',
                    background: focusBonusType === FOCUS_BONUS.PERFECT_FOCUS.label
                      ? 'hsl(152 44% 45% / 0.08)'
                      : 'hsl(210 70% 55% / 0.08)',
                  }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <PixelIcon name="shield" size={18} />
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: focusBonusType === FOCUS_BONUS.PERFECT_FOCUS.label
                        ? 'hsl(152 44% 40%)'
                        : 'hsl(210 70% 50%)',
                    }}
                  >
                    {focusBonusType === FOCUS_BONUS.PERFECT_FOCUS.label
                      ? `Perfect Focus! +25% XP +${FOCUS_BONUS.PERFECT_FOCUS.coinBonus} coins`
                      : `Good Focus! +10% XP +${FOCUS_BONUS.GOOD_FOCUS.coinBonus} coins`}
                  </span>
                </motion.div>
              )}

              {/* Egg Card — idle + hatching phases */}
              {showEggCard && (
                <motion.div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: eggBadge.border,
                    background: `linear-gradient(180deg, ${eggBadge.bg}, hsl(var(--card)))`,
                  }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <button
                    className="w-full p-4 flex items-center gap-4 touch-manipulation active:scale-[0.98] transition-transform"
                    onClick={handleTapToHatch}
                    disabled={eggPhase !== 'idle'}
                    aria-label="Tap to hatch egg"
                  >
                    {/* Egg icon */}
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                      style={{
                        background: 'hsl(var(--card) / 0.6)',
                        border: `2px solid ${eggBadge.border}`,
                        boxShadow: eggGlow ? `0 0 16px ${eggGlow}` : undefined,
                      }}
                    >
                      <div
                        style={{
                          animation: prefersReducedMotion ? 'none'
                            : eggPhase === 'hatching'
                              ? 'egg-hatch-wobble 0.3s ease-in-out infinite'
                              : 'egg-idle-wobble 3s ease-in-out infinite',
                        }}
                      >
                        <PixelIcon name={currentEggIcon} size={48} />
                      </div>
                      {/* Sparkles for epic/legendary */}
                      {(eggTier === 'epic' || eggTier === 'legendary') && (
                        <>
                          <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-yellow-300/60" style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
                          <span className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-yellow-300/40" style={{ animation: 'sparkle 2s ease-in-out infinite 0.7s' }} />
                          <span className="absolute top-3 left-3 w-1 h-1 rounded-full bg-white/50" style={{ animation: 'sparkle 2s ease-in-out infinite 1.3s' }} />
                        </>
                      )}
                    </div>

                    {/* Egg info */}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
                        {eggPhase === 'idle' ? 'You earned an egg!' : 'Hatching...'}
                      </p>
                      <h3 className="text-lg font-black tracking-tight text-foreground">
                        {eggConfig.label}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{
                            background: eggBadge.bg,
                            color: eggBadge.text,
                            border: `1px solid ${eggBadge.border}`,
                          }}
                        >
                          {eggTier}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {EGG_SIZE_LABELS[pendingSessionEgg!.size]} Egg
                        </span>
                      </div>
                      {eggPhase === 'idle' && (
                        <p className="text-[10px] font-bold text-primary mt-2" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                          Tap to Hatch!
                        </p>
                      )}
                    </div>
                  </button>
                </motion.div>
              )}

              {/* Pet Reveal Card — after hatching */}
              {showPetCard && (
                <motion.div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: RARITY_BADGE_COLORS[petRarity!].border,
                    background: `linear-gradient(180deg, ${RARITY_BADGE_COLORS[petRarity!].bg}, hsl(var(--card)))`,
                  }}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                  transition={prefersReducedMotion ? noMotion : { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <div className="p-4 flex items-center gap-4">
                    {/* Pet image */}
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'hsl(var(--card) / 0.6)',
                        border: `2px solid ${RARITY_BADGE_COLORS[petRarity!].border}`,
                        boxShadow: petGlow ? `0 0 16px ${petGlow}` : undefined,
                      }}
                    >
                      <img
                        src={pet!.imagePath}
                        alt={pet!.name}
                        className="w-full h-full object-contain"
                        style={{
                          imageRendering: 'pixelated',
                          transform: `scale(${Math.max(petScale, 0.8)})`,
                          filter: petGlow ? `drop-shadow(0 0 6px ${petGlow})` : undefined,
                          animation: prefersReducedMotion ? 'none' : 'pet-reveal-bounce 0.6s ease-out',
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
                        {pet!.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{
                            background: RARITY_BADGE_COLORS[petRarity!].bg,
                            color: RARITY_BADGE_COLORS[petRarity!].text,
                            border: `1px solid ${RARITY_BADGE_COLORS[petRarity!].border}`,
                          }}
                        >
                          {petRarity}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          <PixelIcon name={SIZE_ICONS[petSize!]} size={12} className="inline-block mr-0.5" /> {SIZE_LABELS[petSize!]}
                        </span>
                      </div>
                      <button
                        onClick={onGoToIsland}
                        className="mt-2 text-[10px] font-bold text-primary underline underline-offset-2 touch-manipulation"
                      >
                        View on Island
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Coins Card */}
              {coinsEarned > 0 && (
                <motion.div
                  className="rounded-xl border border-border bg-card p-3 flex items-center justify-between"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <div className="flex items-center gap-2">
                    <PixelIcon name="coin" size={20} />
                    <span className="text-lg font-black tabular-nums text-primary">
                      +{animatedCoins}
                    </span>
                    <span className="text-xs font-bold text-primary/70">Coins</span>
                  </div>
                </motion.div>
              )}

              {/* Milestone Card */}
              {milestoneInfo && (
                <motion.div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: milestoneInfo.celebrationType === 'stars'
                      ? 'hsl(42 80% 55% / 0.5)'
                      : milestoneInfo.celebrationType === 'fireworks'
                        ? 'hsl(25 100% 50% / 0.4)'
                        : 'hsl(280 60% 55% / 0.4)',
                    background: milestoneInfo.celebrationType === 'stars'
                      ? 'hsl(42 80% 55% / 0.06)'
                      : milestoneInfo.celebrationType === 'fireworks'
                        ? 'hsl(25 100% 50% / 0.06)'
                        : 'hsl(280 60% 55% / 0.06)',
                  }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <div className="p-3 flex items-center gap-3" style={{ maxHeight: '72px' }}>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'hsl(var(--card) / 0.6)',
                      }}
                    >
                      <PixelIcon name={milestoneInfo.icon || 'star'} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {milestoneInfo.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {milestoneInfo.rewards?.xp && (
                          <span className="text-[10px] font-bold text-primary">
                            +{milestoneInfo.rewards.xp} XP
                          </span>
                        )}
                        {milestoneInfo.rewards?.coins && (
                          <span className="text-[10px] font-bold text-amber-600">
                            +{milestoneInfo.rewards.coins} Coins
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Session Impact — quest progress + streak */}
              {(questDeltas.length > 0 || streakDay > 0) && (
                <motion.div
                  className="rounded-xl border border-border bg-card p-4 space-y-3"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  custom={cardIndex++}
                >
                  <p className="text-xs font-bold text-foreground">Session Impact</p>

                  {/* Quest progress rows */}
                  {questDeltas.map((delta, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-foreground truncate flex-1 mr-2">
                          {delta.name}
                        </span>
                        {delta.completed ? (
                          <span className="flex items-center gap-1">
                            <span
                              className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                              style={{
                                background: 'hsl(152 44% 45% / 0.15)',
                                color: 'hsl(152 44% 35%)',
                                border: '1px solid hsl(152 44% 45% / 0.3)',
                              }}
                            >
                              <PixelIcon name="check" size={10} className="inline-block mr-0.5" />
                              Done
                            </span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {Math.round(delta.newPct)}%
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: delta.completed
                              ? RARITY_STYLES.legendary.color
                              : 'hsl(var(--primary))',
                          }}
                          initial={{ width: `${delta.oldPct}%` }}
                          animate={{ width: `${Math.min(delta.newPct, 100)}%` }}
                          transition={
                            prefersReducedMotion
                              ? { duration: 0 }
                              : { duration: 0.5, delay: 0.15 * i, ease: [0.4, 0, 0.2, 1] }
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {/* Streak day */}
                  {streakDay > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <PixelIcon name="fire" size={16} />
                      <span className="text-[11px] font-bold text-foreground">
                        Day {streakDay}
                      </span>
                      <span className="text-[10px] text-muted-foreground">streak</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Mood Rating */}
              <motion.div
                className="rounded-xl border border-border bg-card p-4"
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
                      onClick={() => {
                        setRating(option.value);
                        haptic('light');
                      }}
                      aria-label={option.label}
                      aria-pressed={rating === option.value}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl flex flex-col items-center gap-1 transition-all duration-150",
                        "active:scale-90 touch-manipulation",
                        rating === option.value
                          ? "bg-primary/10 ring-2 ring-primary/50"
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
                    className="mt-2.5 min-h-[44px] flex items-center text-[11px] text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
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

        </motion.div>
      )}
    </AnimatePresence>
  );
};
