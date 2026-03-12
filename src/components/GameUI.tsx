/**
 * GameUI Component
 *
 * Main game interface that orchestrates navigation, status, and reward modals.
 * Refactored to use smaller, focused components with single responsibilities:
 *
 * - useRewardHandlers: Manages all reward-related logic
 * - TabContent: Renders tab content with lazy loading
 * - RewardModals: Orchestrates all reward-related modals
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAppStateTracking } from "@/hooks/useAppStateTracking";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { useRewardHandlers } from "@/hooks/useRewardHandlers";
import { useCoinSystem } from "@/hooks/useCoinSystem";
import { TopStatusBar } from "@/components/TopStatusBar";
import { IOSTabBar } from "@/components/IOSTabBar";
import { AchievementTracker } from "@/components/AchievementTracker";
import { TabContent, preloadTabComponents } from "@/components/TabContent";
import { RewardModals } from "@/components/RewardModals";
import { GlobalSoundToggle } from "@/components/GlobalSoundToggle";
import { LAND_COMPLETE_BONUS_COINS, useLandStore } from "@/stores/landStore";
import { IslandExpansionModal } from "@/components/IslandExpansionModal";
import { LandCompleteModal } from "@/components/LandCompleteModal";
import { RewardModalErrorBoundary } from "@/components/FeatureErrorBoundary";
import { useNavigationStore } from "@/stores/navigationStore";

const TAB_STORAGE_KEY = 'nomo_current_tab';
const VALID_TABS = ['home', 'timer', 'collection', 'shop', 'settings'];

function getPersistedTab(): string {
  try {
    const saved = localStorage.getItem(TAB_STORAGE_KEY);
    if (saved && VALID_TABS.includes(saved)) return saved;
  } catch { /* ignore */ }
  return 'home';
}

export const GameUI = () => {
  const [currentTab, setCurrentTab] = useState(getPersistedTab);
  const [isTaskbarCompact, setIsTaskbarCompact] = useState(false);

  // Persist current tab so it survives iOS WebView reloads
  useEffect(() => {
    try { localStorage.setItem(TAB_STORAGE_KEY, currentTab); } catch { /* ignore */ }
  }, [currentTab]);

  // Preload tab components after initial render for faster navigation
  useEffect(() => {
    preloadTabComponents();
  }, []);

  // Theme color — respects dark mode (4.2)
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
      || document.documentElement.classList.contains('dark');
    meta.setAttribute('content', isDark ? '#111614' : '#F8F8F4');
  }, [currentTab]);

  // Listen for programmatic tab switches (e.g. from collection "Buy from Shop" button)
  useEffect(() => {
    const handleSwitchToTab = (event: CustomEvent<string>) => {
      const tab = event.detail;
      if (tab && VALID_TABS.includes(tab)) setCurrentTab(tab);
    };
    window.addEventListener('switchToTab', handleSwitchToTab as EventListener);
    return () => {
      window.removeEventListener('switchToTab', handleSwitchToTab as EventListener);
    };
  }, []);

  // Award land completion bonus coins
  const coinSystem = useCoinSystem();
  useEffect(() => {
    const handleLandCompleted = () => {
      coinSystem.addCoins(LAND_COMPLETE_BONUS_COINS);
    };
    window.addEventListener('landCompleted', handleLandCompleted as EventListener);
    return () => {
      window.removeEventListener('landCompleted', handleLandCompleted as EventListener);
    };
  }, [coinSystem]);

  // Passive income is now collected manually via TopStatusBar collect button

  // Track whether SessionCompleteView is active (suppresses other modals)
  const sessionRewardsActive = useNavigationStore((s) => s.sessionRewardsActive);

  // Deferred island celebration modals — queue events and show on home tab
  const [deferredExpansion, setDeferredExpansion] = useState<{ oldTier: number; newTier: number; newCells: number } | null>(null);
  const [deferredLandComplete, setDeferredLandComplete] = useState<{ landNumber: number; cells: unknown[]; totalFocusMinutes: number } | null>(null);
  const [showDeferredExpansion, setShowDeferredExpansion] = useState(false);
  const [showDeferredLandComplete, setShowDeferredLandComplete] = useState(false);

  // Intercept island events and defer them when session rewards are active
  useEffect(() => {
    const handleExpansion = (e: CustomEvent) => {
      if (useNavigationStore.getState().sessionRewardsActive) {
        setDeferredExpansion(e.detail);
        e.stopImmediatePropagation();
      }
      // If not in session, let the original IslandExpansionModal handle it
    };
    const handleLandCompleted = (e: CustomEvent) => {
      if (useNavigationStore.getState().sessionRewardsActive) {
        setDeferredLandComplete(e.detail);
        e.stopImmediatePropagation();
      }
      // If not in session, let the original LandCompleteModal handle it
    };
    // Add with capture to intercept before the modal components' own listeners
    window.addEventListener('islandExpanded', handleExpansion as EventListener, true);
    window.addEventListener('landCompleted', handleLandCompleted as EventListener, true);
    return () => {
      window.removeEventListener('islandExpanded', handleExpansion as EventListener, true);
      window.removeEventListener('landCompleted', handleLandCompleted as EventListener, true);
    };
  }, []);

  // Show deferred island modals when navigating to home tab
  useEffect(() => {
    if (currentTab === 'home' && !sessionRewardsActive) {
      if (deferredExpansion) {
        // Re-dispatch the event so IslandExpansionModal picks it up
        window.dispatchEvent(new CustomEvent('islandExpanded', { detail: deferredExpansion }));
        setDeferredExpansion(null);
      }
      if (deferredLandComplete) {
        // Slight delay to let expansion modal show first
        const timer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('landCompleted', { detail: deferredLandComplete }));
          setDeferredLandComplete(null);
        }, deferredExpansion ? 500 : 0);
        return () => clearTimeout(timer);
      }
    }
  }, [currentTab, sessionRewardsActive, deferredExpansion, deferredLandComplete]);

  // Single instance of useAppStateTracking — shared via context with all children
  const appState = useAppStateTracking();
  const {
    currentLevel,
    showRewardModal,
    currentReward,
    dismissRewardModal,
    getLevelProgress,
    dailyLoginRewards,
    handleClaimDailyReward,
  } = appState;

  // Reward handlers (XP, coins, milestones, daily rewards)
  const {
    handleXPReward,
    handleCoinReward,
    handleMilestoneClaim,
    handleDailyRewardClaim,
  } = useRewardHandlers(handleClaimDailyReward);

  return (
    <AppStateProvider value={appState}>
      <AchievementTracker>
        <div className="fixed inset-0 pointer-events-none z-40">
          {/* Unified Top Status Bar */}
          <TopStatusBar
            currentTab={currentTab}
          />

          {/* Full Screen Content */}
          <div
            style={{ paddingBottom: 'calc(var(--dock-height, 82px) + env(safe-area-inset-bottom, 0px) + 16px)' }}
            className={`absolute inset-0 pointer-events-auto ${
              currentTab === "home" ? "overflow-hidden" : "overflow-auto"
            } ${
              currentTab === "home" ? "" : "bg-[hsl(var(--background))]"
            } ${
              currentTab === "timer" || currentTab === "home" ? "" : "pt-safe"
            }`}
          >
            <TabContent
              currentTab={currentTab}
              onXPReward={handleXPReward}
              onCoinReward={handleCoinReward}
            />
          </div>

          {/* Global sound mini-player — shows when sounds active, hidden on timer tab */}
          <GlobalSoundToggle currentTab={currentTab} />

          {/* Modern Floating Dock Navigation */}
          <IOSTabBar
            activeTab={currentTab}
            onTabChange={setCurrentTab}
            isCompact={isTaskbarCompact}
            onCompactChange={setIsTaskbarCompact}
          />

          {/* Reward Modals */}
          <RewardModals
            showRewardModal={showRewardModal}
            dismissRewardModal={dismissRewardModal}
            currentReward={currentReward}
            newLevel={currentLevel}
            levelProgress={getLevelProgress()}
            dailyLoginRewards={dailyLoginRewards}
            onDailyRewardClaim={handleDailyRewardClaim}
            onMilestoneClaim={handleMilestoneClaim}
            suppressPostSession={sessionRewardsActive}
          />

          {/* Island celebration modals */}
          <RewardModalErrorBoundary>
            <IslandExpansionModal />
          </RewardModalErrorBoundary>
          <RewardModalErrorBoundary>
            <LandCompleteModal />
          </RewardModalErrorBoundary>
        </div>
      </AchievementTracker>
    </AppStateProvider>
  );
};
