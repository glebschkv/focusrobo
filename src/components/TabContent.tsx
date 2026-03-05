/**
 * TabContent Component
 *
 * Renders the content for each tab with lazy loading and context-aware skeletons.
 * Extracts tab rendering logic from GameUI for better separation of concerns.
 *
 * Includes preloading to ensure components are ready before user navigates.
 */

import { lazy, Suspense } from "react";
import {
  TimerDisplaySkeleton,
  CollectionPageSkeleton,
  ShopPageSkeleton,
  SettingsSectionSkeleton,
} from "@/components/ui/skeleton-loaders";
import {
  TimerErrorBoundary,
  CollectionErrorBoundary,
  ShopErrorBoundary,
  SettingsErrorBoundary,
} from "@/components/FeatureErrorBoundary";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PetLand } from "@/components/PetLand";

// Component import functions for preloading
const importUnifiedFocusTimer = () => import("@/components/UnifiedFocusTimer").then(m => ({ default: m.UnifiedFocusTimer }));
const importPetCollectionBook = () => import("@/components/PetCollectionBook").then(m => ({ default: m.PetCollectionBook }));
const importSettings = () => import("@/components/Settings").then(m => ({ default: m.Settings }));
const importShop = () => import("@/components/Shop").then(m => ({ default: m.Shop }));
// Lazy load heavy tab components for better initial load performance
const UnifiedFocusTimer = lazy(importUnifiedFocusTimer);
const PetCollectionBook = lazy(importPetCollectionBook);
const Settings = lazy(importSettings);
const Shop = lazy(importShop);

// Preload all tab components after initial render
// This ensures components are cached and ready when user navigates
export const preloadTabComponents = () => {
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedulePreload = (callback: () => void) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: 2000 });
    } else {
      setTimeout(callback, 100);
    }
  };

  // Preload components in order of likely use
  schedulePreload(() => {
    importUnifiedFocusTimer();
    importPetCollectionBook();
  });

  // Preload less commonly used components with slight delay
  schedulePreload(() => {
    setTimeout(() => {
      importShop();
      importSettings();
    }, 500);
  });
};

// Context-aware loading skeleton based on tab
const getTabSkeleton = (tab: string) => {
  switch (tab) {
    case "timer":
      return <TimerDisplaySkeleton />;
    case "collection":
      return <CollectionPageSkeleton />;
    case "shop":
      return <ShopPageSkeleton />;
    case "settings":
      return <SettingsSectionSkeleton rows={5} />;
    default:
      return null;
  }
};

interface TabContentProps {
  currentTab: string;
  onXPReward: (amount: number) => void;
  onCoinReward: (amount: number) => void;
}

export const TabContent = ({ currentTab, onXPReward, onCoinReward }: TabContentProps) => {
  // Home tab renders PetLand directly (not lazy — it's the default view)
  if (currentTab === "home") {
    return (
      <ErrorBoundary>
        <PetLand />
      </ErrorBoundary>
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case "timer":
        return <TimerErrorBoundary><UnifiedFocusTimer /></TimerErrorBoundary>;
      case "collection":
        return <CollectionErrorBoundary><PetCollectionBook /></CollectionErrorBoundary>;
      case "shop":
        return <ShopErrorBoundary><Shop /></ShopErrorBoundary>;
      case "settings":
        return <SettingsErrorBoundary><Settings /></SettingsErrorBoundary>;
      default:
        return null;
    }
  };

  const content = renderTabContent();

  if (!content) {
    return null;
  }

  return (
    <Suspense fallback={getTabSkeleton(currentTab)}>
      {content}
    </Suspense>
  );
};
