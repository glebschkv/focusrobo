/**
 * NextGoalWidget — compact card showing the nearest upcoming goal on the home screen.
 *
 * Calculates % completion for next level, next island unlock, and next species
 * milestone. Shows the one closest to completion. Auto-rotates between close
 * goals (within 20%) every 8 seconds. Tappable to expand a popover with top 3.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useXPStore } from '@/stores/xpStore';
import { useCoinBalance } from '@/stores/coinStore';
import { useLandStore } from '@/stores/landStore';
import { ARCHIPELAGO_ISLANDS } from '@/data/ArchipelagoData';
import { getNextMilestone } from '@/data/GamificationData';
import { calculateLevelRequirement } from '@/hooks/xp/xpUtils';
import { MAX_LEVEL } from '@/hooks/xp/xpConstants';

interface Goal {
  id: string;
  icon: string;
  text: string;
  percent: number;
}

function useGoals(): Goal[] {
  const currentLevel = useXPStore((s) => s.currentLevel);
  const currentXP = useXPStore((s) => s.currentXP);
  const xpToNextLevel = useXPStore((s) => s.xpToNextLevel);
  const coinBalance = useCoinBalance();
  const speciesCatalog = useLandStore((s) => s.speciesCatalog);
  const archipelago = useLandStore((s) => s.archipelago);

  return useMemo(() => {
    const goals: Goal[] = [];

    // --- Next level goal ---
    if (currentLevel < MAX_LEVEL) {
      const nextLevelXP = calculateLevelRequirement(currentLevel + 1);
      const currentLevelXP = calculateLevelRequirement(currentLevel);
      const totalNeeded = nextLevelXP - currentLevelXP;
      const progress = totalNeeded > 0 ? Math.max(0, totalNeeded - xpToNextLevel) : 0;
      const pct = totalNeeded > 0 ? progress / totalNeeded : 0;
      goals.push({
        id: 'level',
        icon: '⭐',
        text: `${xpToNextLevel} XP to Level ${currentLevel + 1}`,
        percent: pct,
      });
    }

    // --- Next island unlock goal ---
    const unlockedIds = new Set(archipelago.map((i) => i.id));
    // Home is always unlocked implicitly
    unlockedIds.add('home');
    const nextIsland = ARCHIPELAGO_ISLANDS.find(
      (def) => !unlockedIds.has(def.id) && def.coinCost > 0,
    );
    if (nextIsland) {
      const levelMet = currentLevel >= nextIsland.unlockLevel;
      if (levelMet) {
        // Show coins remaining
        const coinsNeeded = Math.max(0, nextIsland.coinCost - coinBalance);
        const pct = nextIsland.coinCost > 0 ? Math.min(1, coinBalance / nextIsland.coinCost) : 1;
        goals.push({
          id: `island-${nextIsland.id}`,
          icon: nextIsland.icon,
          text: coinsNeeded > 0
            ? `${coinsNeeded} coins to ${nextIsland.name}`
            : `${nextIsland.name} ready to unlock!`,
          percent: pct,
        });
      } else {
        // Show level remaining
        const pct = nextIsland.unlockLevel > 0 ? currentLevel / nextIsland.unlockLevel : 0;
        goals.push({
          id: `island-${nextIsland.id}`,
          icon: nextIsland.icon,
          text: `Level ${nextIsland.unlockLevel} for ${nextIsland.name}`,
          percent: Math.min(1, pct),
        });
      }
    }

    // --- Next species milestone ---
    const discoveredCount = Object.keys(speciesCatalog).length;
    const nextMilestone = getNextMilestone('collection', discoveredCount);
    if (nextMilestone) {
      const remaining = nextMilestone.threshold - discoveredCount;
      const pct = nextMilestone.threshold > 0 ? discoveredCount / nextMilestone.threshold : 0;
      goals.push({
        id: `species-${nextMilestone.id}`,
        icon: '📖',
        text: `${remaining} more species to ${nextMilestone.title}`,
        percent: Math.min(1, pct),
      });
    }

    // Sort by % completion descending (closest to done first)
    goals.sort((a, b) => b.percent - a.percent);

    return goals;
  }, [currentLevel, currentXP, xpToNextLevel, coinBalance, speciesCatalog, archipelago]);
}

export function NextGoalWidget() {
  const goals = useGoals();
  const [expanded, setExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Goals that should auto-rotate (within 20% of the top goal)
  const rotatingGoals = useMemo(() => {
    if (goals.length <= 1) return goals;
    const topPct = goals[0]?.percent ?? 0;
    return goals.filter((g) => topPct - g.percent <= 0.2);
  }, [goals]);

  // Auto-rotate every 8s
  useEffect(() => {
    if (rotatingGoals.length <= 1 || expanded) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % rotatingGoals.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [rotatingGoals.length, expanded]);

  // Reset index when goals change
  useEffect(() => {
    setActiveIndex(0);
  }, [goals.length]);

  // Close popover on outside tap
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.next-goal-widget')) {
        setExpanded(false);
      }
    };
    const t = setTimeout(() => document.addEventListener('pointerdown', handler), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener('pointerdown', handler);
    };
  }, [expanded]);

  const handleTap = useCallback(() => {
    if (goals.length > 1) {
      setExpanded((v) => !v);
    }
  }, [goals.length]);

  if (goals.length === 0) return null;

  const current = rotatingGoals[activeIndex % rotatingGoals.length] ?? goals[0];

  return (
    <div className="next-goal-widget">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="pill"
            className="next-goal-card"
            onClick={handleTap}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={current.id}
                className="next-goal-card__content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="next-goal-card__icon">{current.icon}</span>
                <span className="next-goal-card__text">{current.text}</span>
                <span className="next-goal-card__pct">
                  {Math.round(current.percent * 100)}%
                </span>
              </motion.span>
            </AnimatePresence>
            {/* Progress track */}
            <span
              className="next-goal-card__bar"
              style={{ '--goal-pct': `${current.percent * 100}%` } as React.CSSProperties}
            />
            {goals.length > 1 && (
              <svg
                className="next-goal-card__chevron"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="popover"
            className="next-goal-popover"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="next-goal-popover__header">
              <span className="next-goal-popover__title">Upcoming Goals</span>
              <button
                className="next-goal-popover__close"
                onClick={() => setExpanded(false)}
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </div>
            {goals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="next-goal-popover__row">
                <span className="next-goal-popover__icon">{goal.icon}</span>
                <span className="next-goal-popover__text">{goal.text}</span>
                <span className="next-goal-popover__pct">
                  {Math.round(goal.percent * 100)}%
                </span>
                <span
                  className="next-goal-popover__bar"
                  style={{ '--goal-pct': `${goal.percent * 100}%` } as React.CSSProperties}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
