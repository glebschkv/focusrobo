/**
 * HomeGoalsWidget — Expandable card on the home screen that surfaces
 * daily/weekly challenge progress and nearest achievement.
 */

import { useState, useEffect, useMemo } from 'react';
import { useQuestStore, useDailyChallenge, useRefreshDailyChallenge, useWeeklyChallenge, useRefreshWeeklyChallenge } from '@/stores/questStore';
import { useAchievementSystem } from '@/hooks/useAchievementSystem';
import { DAILY_CHALLENGES, WEEKLY_CHALLENGES, DIFFICULTY_COLORS } from '@/data/GamificationData';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelIcon } from '@/components/ui/PixelIcon';

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
  const [expanded, setExpanded] = useState(true);

  const quests = useQuestStore((s) => s.quests);
  const { achievements } = useAchievementSystem();
  const dailyChallenge = useDailyChallenge();
  const refreshDailyChallenge = useRefreshDailyChallenge();
  const weeklyChallenge = useWeeklyChallenge();
  const refreshWeeklyChallenge = useRefreshWeeklyChallenge();

  // Auto-generate daily + weekly challenges on mount
  useEffect(() => {
    refreshDailyChallenge();
    refreshWeeklyChallenge();
  }, [refreshDailyChallenge, refreshWeeklyChallenge]);

  // Get the challenge template for display
  const challengeTemplate = useMemo(() => {
    if (!dailyChallenge) return null;
    return DAILY_CHALLENGES.find(c => c.id === dailyChallenge.templateId) ?? null;
  }, [dailyChallenge]);

  // Get weekly challenge template
  const weeklyChallengeTemplate = useMemo(() => {
    if (!weeklyChallenge) return null;
    return WEEKLY_CHALLENGES.find(c => c.id === weeklyChallenge.templateId) ?? null;
  }, [weeklyChallenge]);

  // Time remaining until midnight (daily)
  const timeRemaining = useMemo(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diffMs = midnight.getTime() - now.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  }, [expanded]); // recalc on expand

  // Time remaining until Sunday midnight (weekly)
  const weeklyTimeRemaining = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    endOfWeek.setHours(24, 0, 0, 0);
    const diffMs = endOfWeek.getTime() - now.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  }, [expanded]);

  // Active daily quests (not completed, not expired)
  const activeDaily = useMemo(() => {
    const now = Date.now();
    return quests
      .filter(q => q.type === 'daily' && !q.isCompleted && (!q.expiresAt || q.expiresAt > now))
      .slice(0, 3);
  }, [quests]);

  // Nearest achievement
  const nearest = useMemo(() => getNearestAchievement(achievements), [achievements]);

  // Close on tap outside
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
  const hasContent = dailyChallenge || weeklyChallenge || activeDaily.length > 0 || nearest;
  if (!hasContent) return null;

  // Collapsed pill text
  const pillText = (() => {
    if (dailyChallenge && challengeTemplate) {
      if (dailyChallenge.completed) return 'Daily Challenge Complete!';
      return challengeTemplate.title;
    }
    if (nearest) return nearest.name;
    return 'Daily Challenges';
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
            <PixelIcon name="fire" size={10} className="inline mr-0.5 align-middle" />
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
              <div className="home-goals-card__header-left">
                <PixelIcon name="fire" size={14} className="inline align-middle" />
                <span className="home-goals-card__title">Daily Challenges</span>
                {dailyChallenge && !dailyChallenge.completed && (
                  <span className="home-goals-card__countdown">{timeRemaining}</span>
                )}
              </div>
              <button
                className="home-goals-card__close"
                onClick={() => setExpanded(false)}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              </button>
            </div>

            {/* Challenge streak badge */}
            {dailyChallenge && dailyChallenge.challengeStreak > 0 && (
              <div className="home-goals-card__streak-badge">
                <PixelIcon name="fire" size={10} className="inline align-middle" />
                <span>{dailyChallenge.challengeStreak} day streak</span>
              </div>
            )}

            {/* Daily Challenge (featured) */}
            {dailyChallenge && challengeTemplate && (
              <div className="home-goals-card__challenge">
                <div className="home-goals-card__row-info">
                  <span className="home-goals-card__row-label" style={{ fontWeight: 700 }}>
                    <PixelIcon name="lightning" size={12} className="inline mr-0.5 align-middle" /> {challengeTemplate.title}
                  </span>
                  <span className="home-goals-card__row-progress" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span
                      className="home-goals-card__difficulty-badge"
                      style={{
                        background: DIFFICULTY_COLORS[challengeTemplate.difficulty].bg,
                        color: DIFFICULTY_COLORS[challengeTemplate.difficulty].text,
                        border: `1px solid ${DIFFICULTY_COLORS[challengeTemplate.difficulty].border}`,
                        fontSize: '8px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '1px 5px',
                        borderRadius: '6px',
                      }}
                    >
                      {challengeTemplate.difficulty}
                    </span>
                  </span>
                </div>
                <div className="home-goals-card__row-info" style={{ marginTop: '2px' }}>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>{challengeTemplate.description}</span>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>
                    {dailyChallenge.progress}/{dailyChallenge.target}
                  </span>
                </div>
                <div className="home-goals-card__bar">
                  <div
                    className="home-goals-card__bar-fill"
                    style={{
                      width: `${Math.min(100, (dailyChallenge.progress / dailyChallenge.target) * 100)}%`,
                      background: dailyChallenge.completed
                        ? 'linear-gradient(90deg, hsl(142 60% 45%), hsl(142 50% 55%))'
                        : undefined,
                    }}
                  />
                </div>
                {dailyChallenge.completed ? (
                  <span className="home-goals-card__completed">Completed!</span>
                ) : (
                  <div className="home-goals-card__reward">
                    <span>+{challengeTemplate.rewards.coins} coins</span>
                    <span className="home-goals-card__reward-dot" />
                    <span>+{challengeTemplate.rewards.xp} XP</span>
                  </div>
                )}
              </div>
            )}

            {/* Quest rows (informational only, no navigation) */}
            {activeDaily.map((quest) => {
              const firstObj = quest.objectives[0];
              if (!firstObj) return null;
              const pct = Math.min(100, (firstObj.current / firstObj.target) * 100);
              return (
                <div
                  key={quest.id}
                  className="home-goals-card__row"
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
                </div>
              );
            })}

            {/* Weekly Challenge */}
            {weeklyChallenge && weeklyChallengeTemplate && (
              <div className="home-goals-card__weekly">
                <div className="home-goals-card__section-label">
                  <span>Weekly Challenge</span>
                  <span className="home-goals-card__countdown">{weeklyTimeRemaining}</span>
                </div>
                <div className="home-goals-card__row-info" style={{ marginTop: '6px' }}>
                  <span className="home-goals-card__row-label" style={{ fontWeight: 700 }}>
                    <PixelIcon name="star" size={12} className="inline mr-0.5 align-middle" /> {weeklyChallengeTemplate.title}
                  </span>
                </div>
                <div className="home-goals-card__row-info" style={{ marginTop: '2px' }}>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>{weeklyChallengeTemplate.description}</span>
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>
                    {weeklyChallenge.progress}/{weeklyChallenge.target}
                  </span>
                </div>
                <div className="home-goals-card__bar">
                  <div
                    className="home-goals-card__bar-fill"
                    style={{
                      width: `${Math.min(100, (weeklyChallenge.progress / weeklyChallenge.target) * 100)}%`,
                      background: weeklyChallenge.completed
                        ? 'linear-gradient(90deg, hsl(142 60% 45%), hsl(142 50% 55%))'
                        : 'linear-gradient(90deg, hsl(var(--primary)), hsl(200 60% 50%))',
                    }}
                  />
                </div>
                {weeklyChallenge.completed ? (
                  <span className="home-goals-card__completed">Completed!</span>
                ) : (
                  <div className="home-goals-card__reward">
                    <span>+{weeklyChallengeTemplate.rewards.coins} coins</span>
                    <span className="home-goals-card__reward-dot" />
                    <span>+{weeklyChallengeTemplate.rewards.xp} XP</span>
                  </div>
                )}
              </div>
            )}

            {/* Nearest achievement */}
            {nearest && (
              <button
                className="home-goals-card__row home-goals-card__row--achievement"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('switchToTab', { detail: 'collection' }));
                  setExpanded(false);
                }}
              >
                <div className="home-goals-card__row-info">
                  <span className="home-goals-card__row-label">
                    <PixelIcon name="trophy" size={12} className="inline mr-0.5 align-middle" /> {nearest.name}
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
