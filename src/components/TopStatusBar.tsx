import { useAppState } from "@/contexts/AppStateContext";
import { useCoinSystem } from "@/hooks/useCoinSystem";
import { ChevronDown, Settings } from "lucide-react";
import { useState, useCallback } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ZONE_DATABASE } from "@/data/RobotDatabase";
import { useShopStore, useThemeStore } from "@/stores";
import { PixelIcon } from "@/components/ui/PixelIcon";

const ZONE_CONFIG: Record<string, { bg: string; icon: string }> = {
  'Meadow': { bg: 'day', icon: 'meadow' },
  'Sunset': { bg: 'sunset', icon: 'sunset' },
  'Night': { bg: 'night', icon: 'moon' },
  'Forest': { bg: 'forest', icon: 'leaf' },
  'Snow': { bg: 'snow', icon: 'snowflake' },
  'City': { bg: 'city', icon: 'city' },
  'Deep Ocean': { bg: 'deepocean', icon: 'wave' },
};

interface TopStatusBarProps {
  currentTab: string;
  onSettingsClick?: () => void;
}

export const TopStatusBar = ({ currentTab, onSettingsClick }: TopStatusBarProps) => {
  const [statsOpen, setStatsOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const {
    currentLevel,
    currentXP,
    xpToNextLevel,
    unlockedRobots,
    getLevelProgress,
    streakData,
    availableZones,
    currentZone,
    switchZone,
  } = useAppState();
  const coinSystem = useCoinSystem();

  // Use Zustand stores instead of localStorage/events
  const equippedBackground = useShopStore((state) => state.equippedBackground);
  const setEquippedBackground = useShopStore((state) => state.setEquippedBackground);
  const setHomeBackground = useThemeStore((state) => state.setHomeBackground);

  const handleSwitchZone = useCallback((biomeName: string) => {
    switchZone(biomeName);

    // Clear any equipped premium background when switching biomes
    if (equippedBackground) {
      setEquippedBackground(null);
    }

    // Use the biome's background image if available, otherwise fall back to theme ID
    const zone = ZONE_DATABASE.find(b => b.name === biomeName);
    const backgroundTheme = zone?.backgroundImage || ZONE_CONFIG[biomeName]?.bg || 'day';
    setHomeBackground(backgroundTheme);
  }, [switchZone, equippedBackground, setEquippedBackground, setHomeBackground]);

  if (currentTab !== "home") return null;

  const progress = getLevelProgress();
  const hasActiveStreak = streakData.currentStreak >= 3;
  const currentZoneIcon = ZONE_CONFIG[currentZone]?.icon || 'meadow';

  return (
    <div className="status-bar-container">
      {/* Game-style unified top bar */}
      <div className="game-top-bar">
        {/* Left section: Level + Zone */}
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
                      <PixelIcon name="robot" size={14} className="inline mr-1 align-middle" />
                      Bots Collected
                    </span>
                    <span className="stat-val">{unlockedRobots.length}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">
                      <PixelIcon name="flame-stats" size={14} className="inline mr-1 align-middle" />
                      Best Streak
                    </span>
                    <span className="stat-val">{streakData.longestStreak} days</span>
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

          {/* Zone Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="zone-btn">
                <PixelIcon name={currentZoneIcon} size={16} className="zone-icon" />
                <ChevronDown className="w-3 h-3 zone-chevron" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="zone-menu">
              {availableZones.map((zoneName) => {
                const config = ZONE_CONFIG[zoneName];
                const isActive = zoneName === currentZone;
                return (
                  <DropdownMenuItem
                    key={zoneName}
                    onClick={() => handleSwitchZone(zoneName)}
                    className={`zone-menu-item ${isActive ? 'selected' : ''}`}
                  >
                    <PixelIcon name={config?.icon || 'globe'} size={16} />
                    <span>{zoneName}</span>
                    {isActive && <span className="zone-check">✓</span>}
                  </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
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

          {/* Settings Button */}
          <button
            onClick={onSettingsClick}
            className="settings-btn"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
