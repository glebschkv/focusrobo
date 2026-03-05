import { useAppState } from "@/contexts/AppStateContext";
import { useCoinSystem } from "@/hooks/useCoinSystem";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PixelIcon } from "@/components/ui/PixelIcon";
import { useLandStore } from "@/stores/landStore";
import { useSpeciesCatalog } from "@/stores/landStore";

interface TopStatusBarProps {
  currentTab: string;
}

export const TopStatusBar = ({ currentTab }: TopStatusBarProps) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const {
    currentLevel,
    currentXP,
    xpToNextLevel,
    getLevelProgress,
    streakData,
  } = useAppState();
  const coinSystem = useCoinSystem();
  const speciesCatalog = useSpeciesCatalog();
  const filledCount = useLandStore((s) => s.getFilledCount)();

  if (currentTab !== "home") return null;

  const progress = getLevelProgress();
  const hasActiveStreak = streakData.currentStreak >= 3;
  const speciesFound = Object.keys(speciesCatalog).length;

  return (
    <div className="status-bar-container">
      {/* Game-style unified top bar */}
      <div className="game-top-bar">
        {/* Left section: Level */}
        <div className="top-bar-left">
          {/* Level Badge with Stats Popover */}
          <Popover open={statsOpen} onOpenChange={setStatsOpen}>
            <PopoverTrigger asChild>
              <button className="level-badge-btn" aria-label="View stats">
                <div className="level-badge-inner">
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
                    <span className="stat-val tabular-nums">{filledCount}/100</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">
                      <PixelIcon name="compass" size={14} className="inline mr-1 align-middle" />
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

        {/* Right section: Streak + Settings */}
        <div className="top-bar-right">
          <Popover open={streakOpen} onOpenChange={setStreakOpen}>
            <PopoverTrigger asChild>
              <button className={`stat-chip streak-chip ${hasActiveStreak ? 'active' : ''}`} aria-label="View daily streak">
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

        </div>
      </div>
    </div>
  );
};
