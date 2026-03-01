import { lazy, Suspense, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { SplashScreen } from "@/components/SplashScreen";
import { SplashScreen as NativeSplash } from '@capacitor/splash-screen';
import { DeviceActivity } from '@/plugins/device-activity';
import { useBackendAppState } from "@/hooks/useBackendAppState";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

import { useAuth } from "@/hooks/useAuth";
import { useWidgetSync } from "@/hooks/useWidgetSync";
import { useTimerExpiryGuard } from "@/hooks/useTimerExpiryGuard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Lazy load heavy components to reduce initial bundle size
const PixelVillage = lazy(() => import("@/components/pixel-world/PixelVillage").then(m => ({ default: m.PixelVillage })));
const GameUI = lazy(() => import("@/components/GameUI").then(m => ({ default: m.GameUI })));
const OnboardingFlow = lazy(() => import("@/components/onboarding/OnboardingFlow").then(m => ({ default: m.OnboardingFlow })));

// Loading fallback for lazy-loaded components — larger and more visible on mobile
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full w-full gap-3">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary"></div>
    <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
  </div>
);

// Module-level guard: survives component remounts (Suspense re-resolution,
// route transitions) so the native splash is only ever hidden once.
let _splashHidden = false;

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { unlockedAnimals, currentLevel, isLoading: isDataLoading } = useBackendAppState();
  const hasCompletedOnboarding = useOnboardingStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  usePerformanceMonitor();
  useWidgetSync();
  useTimerExpiryGuard();

  // Hide splash screens once after auth check resolves.
  useEffect(() => {
    if (!isLoading && !_splashHidden) {
      _splashHidden = true;
      DeviceActivity.dismissSplash().catch(() => { /* Not on native */ });
      NativeSplash.hide().catch(() => { /* Not on native */ });
      const htmlSplash = document.getElementById('splash-screen');
      if (htmlSplash) {
        htmlSplash.style.opacity = '0';
        setTimeout(() => htmlSplash.remove(), 400);
      }
    }
  }, [isLoading]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return (
      <PageErrorBoundary pageName="home page">
        <div className="h-screen w-full flex items-center justify-center" style={{ background: '#0a0a1a' }}>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-cyan-400">BotBlock</h1>
            <p className="text-slate-400">Create an account to save your progress!</p>
            <Button onClick={() => navigate('/auth')}>Get Started</Button>
          </div>
        </div>
      </PageErrorBoundary>
    );
  }

  if (isDataLoading) {
    return (
      <PageErrorBoundary pageName="home page">
        <div className="h-screen w-full flex items-center justify-center" style={{ background: '#0a0a1a' }}>
          <LoadingFallback />
        </div>
      </PageErrorBoundary>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <PageErrorBoundary pageName="home page">
        <div className="h-screen w-full overflow-hidden relative max-w-screen" style={{ background: '#0a0a1a' }}>
          <Suspense fallback={<LoadingFallback />}>
            <OnboardingFlow onComplete={() => completeOnboarding()} />
          </Suspense>
        </div>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary pageName="home page">
      <div className="h-screen w-full overflow-hidden relative max-w-screen" style={{ background: '#0a0a1a' }}>
        {/* Pixel Village Home Screen */}
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <PixelVillage
              unlockedRobots={unlockedAnimals}
              currentLevel={currentLevel}
            />
          </Suspense>
        </ErrorBoundary>

        {/* Game UI Overlay */}
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <GameUI />
          </Suspense>
        </ErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
};

export default Index;
