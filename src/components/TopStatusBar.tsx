import { useAppState } from "@/contexts/AppStateContext";
import { useCoinSystem } from "@/hooks/useCoinSystem";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useLandStore } from "@/stores/landStore";
import { useSpeciesCatalog } from "@/stores/landStore";
import { getAvailableCellCount } from "@/data/islandPositions";
import { usePassiveIncome } from "@/hooks/usePassiveIncome";
import { usePrestigeLevel } from "@/stores/xpStore";
import { PremiumSubscription } from "@/components/PremiumSubscription";

// ── Floating reward numbers ──────────────────────────────────────
interface FloatingReward {
  id: number;
  type: 'coin' | 'xp';
  amount: number;
  offsetX: number;
}

let floatingId = 0;

interface TopStatusBarProps {
  currentTab: string;
}

export const TopStatusBar = ({ currentTab }: TopStatusBarProps) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [showPremiumNudge, setShowPremiumNudge] = useState(false);
  const nudgeShownRef = useRef(false);
  const {
    currentLevel,
    currentXP,
    xpToNextLevel,
    getLevelProgress,
    streakData,
  } = useAppState();
  const coinSystem = useCoinSystem();
  const prestigeLevel = usePrestigeLevel();
  const speciesCatalog = useSpeciesCatalog();
  const filledCount = useLandStore((s) => s.getFilledCount)();
  const currentLand = useLandStore((s) => s.currentLand);
  const gridSize = currentLand.gridSize;
  const tierCapacity = getAvailableCellCount(gridSize);
  const islandProgressPct = tierCapacity > 0 ? (filledCount / tierCapacity) * 100 : 0;
  const { dailyIncomeRate, accumulatedCoins, justCollected, collect, isPremium } = usePassiveIncome();

  const handleCollect = useCallback(() => {
    const amount = collect();
    if (amount > 0 && !isPremium && !nudgeShownRef.current) {
      nudgeShownRef.current = true;
      // Show nudge after collection animation
      setTimeout(() => setShowPremiumNudge(true), 1500);
    }
  }, [collect, isPremium]);

  // Auto-dismiss premium nudge after 5s
  useEffect(() => {
    if (!showPremiumNudge) return;
    const timer = setTimeout(() => setShowPremiumNudge(false), 5000);
    return () => clearTimeout(timer);
  }, [showPremiumNudge]);

  // ── Floating reward numbers ──────────────────────────────────
  const [floatingRewards, setFloatingRewards] = useState<FloatingReward[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { type, amount } = (e as CustomEvent).detail as { type: 'coin' | 'xp'; amount: number };
      if (!amount || amount <= 0) return;
      const id = ++floatingId;
      const offsetX = Math.random() * 16 - 8;
      setFloatingRewards(prev => {
        const next = [...prev, { id, type, amount, offsetX }];
        return next.length > 5 ? next.slice(-5) : next;
      });
      setTimeout(() => {
        setFloatingRewards(prev => prev.filter(r => r.id !== id));
      }, 1300);
    };
    window.addEventListener('reward-earned', handler);
    return () => window.removeEventListener('reward-earned', handler);
  }, []);

  if (currentTab !== "home") return null;

  const progress = getLevelProgress();
  const hasActiveStreak = streakData.currentStreak >= 3;
  const speciesFound = Object.keys(speciesCatalog).length;

  // Streak risk warning: check if streak might be lost today
  const streakRiskClass = (() => {
    if (streakData.currentStreak <= 0) return '';
    // Check if user has completed a session today
    const lastSession = streakData.lastSessionDate;
    const today = new Date().toDateString();
    if (lastSession === today) return ''; // Already focused today
    const hour = new Date().getHours();
    if (hour >= 21) return 'streak-at-risk--urgent'; // After 9 PM
    if (hour >= 18) return 'streak-at-risk'; // After 6 PM
    return '';
  })();

  return (
    <div className="status-bar-container">
      {/* Game-style unified top bar */}
      <div className="game-top-bar" style={{ position: 'relative' }}>
        {/* Floating reward numbers */}
        {floatingRewards.map((r, i) => (
          <span
            key={r.id}
            className={`floating-reward floating-reward--${r.type}`}
            style={{
              '--float-x': `${r.offsetX}px`,
              animationDelay: `${i * 0.2}s`,
            } as React.CSSProperties}
          >
            +{r.amount} {r.type === 'coin' ? '🪙' : 'XP'}
          </span>
        ))}
        {/* Chips row: level, coins, streak */}
        <div className="game-top-bar-chips">
        {/* Left section: Level */}
        <div className="top-bar-left">
          {/* Level Badge with Stats Popover */}
          <Popover open={statsOpen} onOpenChange={setStatsOpen}>
            <PopoverTrigger asChild>
              <button className="level-badge-btn" aria-label="View stats">
                <div className="level-badge-inner">
                  {prestigeLevel > 0 && (
                    <span className="prestige-stars" style={{ marginRight: '2px', display: 'inline-flex', gap: '1px' }}>
                      {Array.from({ length: Math.min(prestigeLevel, 10) }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '7px',
                            color: prestigeLevel >= 10
                              ? 'hsl(42 75% 52%)'
                              : prestigeLevel >= 7
                                ? 'hsl(42 75% 52%)'
                                : prestigeLevel >= 4
                                  ? 'hsl(0 0% 70%)'
                                  : 'hsl(30 60% 50%)',
                          }}
                        >★</span>
                      ))}
                    </span>
                  )}
                  <span className="level-star">★</span>
                  <span className="level-number">{currentLevel}</span>
                </div>
                <div className="level-progress-track">
                  <div
                    className="level-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="stats-popover" align="start" sideOffset={8}>
              <div className="stats-popover-content">
                <div className="stats-header">
                  <span className="stats-header-star">★</span>
                  <span>Your Progress</span>
                </div>

                <div className="stats-grid">
                  <div className="stat-row">
                    <span className="stat-label">
                      <PixelIcon name="star-level" size={14} className="inline mr-1 align-middle" />
                      Level
                    </span>
                    <span className="stat-val">
                      <span className="retro-level-badge px-1.5 py-0 text-[10px]">{currentLevel}</span>
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">
                      <PixelIcon name="trophy-xp" size={14} className="inline mr-1 align-middle" />
                      XP
                    </span>
                    <span className="stat-val">{currentXP} / {currentXP + xpToNextLevel}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">
                      <PixelIcon name="paw" size={14} className="inline mr-1 align-middle" />
                      Pets on Land
                    </span>
                    <span className="stat-val tabular-nums">{filledCount}/{tierCapacity}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">
                      <PixelIcon name="globe" size={14} className="inline mr-1 align-middle" />
                      Species Found
                    </span>
                    <span className="stat-val tabular-nums">{speciesFound}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">
                      <PixelIcon name="flame-streak" size={14} className="inline mr-1 align-middle" />
                      Best Streak
                    </span>
                    <span className="stat-val tabular-nums">{streakData.longestStreak} days</span>
                  </div>
                  {dailyIncomeRate > 0 && (
                    <div className="stat-row">
                      <span className="stat-label">
                        <PixelIcon name="coin" size={14} className="inline mr-1 align-middle" />
                        Pet Income
                      </span>
                      <span className="stat-val tabular-nums">{dailyIncomeRate}/day</span>
                    </div>
                  )}
                </div>

                {/* XP Progress Bar */}
                <div className="xp-progress-container">
                  <div className="xp-progress-bar">
                    <div
                      className="xp-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="xp-progress-label">{Math.round(progress)}% to next level</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Center section: Coins - tappable to buy more */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('switchToTab', { detail: 'shop' }));
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('navigateToShopCategory', { detail: 'powerups' }));
            }, 50);
          }}
          className="stat-chip coin-chip"
        >
          <PixelIcon name="coin" size={18} className="chip-icon coin-icon" />
          <span className="chip-value">{coinSystem.balance.toLocaleString()}</span>
          <span className="coin-plus-badge">+</span>
        </button>

        {/* Passive income collect button */}
        {accumulatedCoins > 0 && (
          <button
            className="income-collect-btn"
            onClick={handleCollect}
            aria-label={`Collect ${accumulatedCoins} coins from pets`}
          >
            <PixelIcon name="coin" size={14} className="income-collect-icon" />
            <span className="income-collect-amount">+{accumulatedCoins}</span>
          </button>
        )}

        {/* Coin float-up animation after collection */}
        {justCollected != null && (
          <span className="income-coin-float" key={justCollected}>
            +{justCollected}
          </span>
        )}

        {/* Premium nudge after passive income collection */}
        {showPremiumNudge && (
          <button
            className="premium-nudge-pill"
            onClick={() => { setShowPremiumNudge(false); setPremiumOpen(true); }}
          >
            <PixelIcon name="crown-legendary" size={14} />
            <span>Get 2x pet income</span>
          </button>
        )}

        {/* Right section: Streak + Help */}
        <div className="top-bar-right">
          <Popover open={streakOpen} onOpenChange={setStreakOpen}>
            <PopoverTrigger asChild>
              <button className={`stat-chip streak-chip ${hasActiveStreak ? 'active' : ''} ${streakRiskClass}`} aria-label="View daily streak">
                <PixelIcon name="flame-streak" size={18} className="chip-icon streak-icon" />
                <span className="chip-value">{streakData.currentStreak}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="stats-popover w-auto min-w-[180px]" align="end" sideOffset={8}>
              <div className="stats-popover-content">
                <div className="stats-header">
                  <PixelIcon name="flame-streak" size={16} className="inline mr-1" />
                  <span>Daily Streak</span>
                </div>
                <div className="stats-grid">
                  <div className="stat-row">
                    <span className="stat-label">Current</span>
                    <span className="stat-val">{streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Best</span>
                    <span className="stat-val">{streakData.longestStreak} {streakData.longestStreak === 1 ? 'day' : 'days'}</span>
                  </div>
                </div>
                {hasActiveStreak && (
                  <p className="text-[11px] text-center mt-2" style={{ color: 'hsl(20 70% 45%)' }}>
                    Keep it up! Streaks boost your XP.
                  </p>
                )}
                {!hasActiveStreak && streakData.currentStreak > 0 && (
                  <p className="text-[11px] text-muted-foreground text-center mt-2">
                    Reach 3 days to activate streak bonuses!
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <button
            className="top-bar-help-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('openHelp'))}
            aria-label="How to play"
          >
            <span className="top-bar-help-icon">?</span>
          </button>
        </div>
        </div>{/* end game-top-bar-chips */}

        {/* Island Progress Row */}
        <div className="island-progress-row">
          <span className="island-progress-label">Land {currentLand.number}</span>
          <div className="island-progress-track">
            <div
              className="island-progress-fill"
              style={{ width: `${islandProgressPct}%` }}
            />
          </div>
          <span className="island-progress-count tabular-nums">
            {filledCount}/{tierCapacity}
          </span>
        </div>
      </div>

      {/* Premium subscription dialog */}
      <PremiumSubscription isOpen={premiumOpen} onClose={() => setPremiumOpen(false)} />
    </div>
  );
};
