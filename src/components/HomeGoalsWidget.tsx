/**
 * HomeGoalsWidget — Collapsible pill/card on the home screen that surfaces
 * daily quest progress and nearest achievement.
 * Replaces the old `.pet-land__nudge` chip.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuestStore } from '@/stores/questStore';
import { useAchievementSystem } from '@/hooks/useAchievementSystem';
import { motion, AnimatePresence } from 'framer-motion';

/** Find the nearest (closest-to-unlock) locked achievement */
function getNearestAchievement(achievements: { id: string; title: string; progress: number; target: number; isUnlocked: boolean }[]) {
  let best: { name: string; remaining: number; pct: number } | null = null;
  for (const a of achievements) {
    if (a.isUnlocked) continue;
    if (a.target <= 0) continue;
    const remaining = a.target - a.progress;
    const pct = a.progress / a.target;
    if (!best || pct > best.pct) {
      best = { name: a.title, remaining, pct };
    }
  }
  return best;
}

export const HomeGoalsWidget = () => {
  const [expanded, setExpanded] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout>>();

  const quests = useQuestStore((s) => s.quests);
  const { achievements } = useAchievementSystem();

  // Active daily quests (not completed, not expired)
  const activeDaily = useMemo(() => {
    const now = Date.now();
    return quests
      .filter(q => q.type === 'daily' && !q.isClaimed && (!q.expiresAt || q.expiresAt > now))
      .slice(0, 3);
  }, [quests]);

  // Nearest achievement
  const nearest = useMemo(() => getNearestAchievement(achievements), [achievements]);

  // Count completed daily quests
  const completedDaily = useMemo(
    () => activeDaily.filter(q => q.isCompleted).length,
    [activeDaily]
  );

  // Auto-collapse after 5s when expanded
  useEffect(() => {
    if (expanded) {
      collapseTimer.current = setTimeout(() => setExpanded(false), 5000);
      return () => clearTimeout(collapseTimer.current);
    }
  }, [expanded]);

  // Close on tap outside
  const handleClickOutside = useCallback(() => {
    if (expanded) setExpanded(false);
  }, [expanded]);

  useEffect(() => {
    if (expanded) {
      const handler = (e: PointerEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.home-goals-widget')) {
          setExpanded(false);
        }
      };
      // Delay to avoid immediate close from the expanding click
      const t = setTimeout(() => {
        document.addEventListener('pointerdown', handler);
      }, 100);
      return () => {
        clearTimeout(t);
        document.removeEventListener('pointerdown', handler);
      };
    }
  }, [expanded]);

  // Nothing to show
  if (activeDaily.length === 0 && !nearest) return null;

  // Collapsed pill text
  const pillText = (() => {
    const parts: string[] = [];
    if (activeDaily.length > 0) {
      parts.push(`${completedDaily}/${activeDaily.length} Daily`);
    }
    if (nearest) {
      parts.push(`Near: ${nearest.name}`);
    }
    return parts.join(' · ') || 'View Goals';
  })();

  return (
    <div className="home-goals-widget">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="pill"
            className="home-goals-pill"
            onClick={() => setExpanded(true)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
          >
            <span className="home-goals-pill__text">{pillText}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.button>
        ) : (
          <motion.div
            key="card"
            className="home-goals-card"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="home-goals-card__header">
              <span className="home-goals-card__title">Today</span>
              <button
                className="home-goals-card__close"
                onClick={() => setExpanded(false)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </div>

            {/* Quest rows */}
            {activeDaily.map((quest) => {
              const firstObj = quest.objectives[0];
              if (!firstObj) return null;
              const pct = Math.min(100, (firstObj.current / firstObj.target) * 100);
              return (
                <button
                  key={quest.id}
                  className="home-goals-card__row"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('switchToTab', { detail: 'gamification' }));
                    setExpanded(false);
                  }}
                >
                  <div className="home-goals-card__row-info">
                    <span className="home-goals-card__row-label">{quest.title}</span>
                    <span className="home-goals-card__row-progress">
                      {firstObj.current}/{firstObj.target}
                    </span>
                  </div>
                  <div className="home-goals-card__bar">
                    <div
                      className="home-goals-card__bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {quest.isCompleted && (
                    <span className="home-goals-card__completed">Done!</span>
                  )}
                </button>
              );
            })}

            {/* Nearest achievement */}
            {nearest && (
              <button
                className="home-goals-card__row home-goals-card__row--achievement"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('switchToTab', { detail: 'gamification' }));
                  setExpanded(false);
                }}
              >
                <div className="home-goals-card__row-info">
                  <span className="home-goals-card__row-label">
                    🏆 {nearest.name}
                  </span>
                  <span className="home-goals-card__row-progress">
                    {Math.round(nearest.pct * 100)}%
                  </span>
                </div>
                <div className="home-goals-card__bar">
                  <div
                    className="home-goals-card__bar-fill home-goals-card__bar-fill--achievement"
                    style={{ width: `${nearest.pct * 100}%` }}
                  />
                </div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
