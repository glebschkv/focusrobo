# PhoNo — Architecture Reference

> Focus timer iOS app with pet collection gamification. Users run focus sessions to earn XP and coins. Each completed session places a pet on a floating isometric island. Longer sessions = bigger pets (baby/adolescent/adult). Fill an island (expands 5×5→12×12), archive it, start a new one. Players can also buy eggs in the shop, choose from pet options, or use a species selector. The archipelago system lets players unlock and switch between 6 themed islands. Built with React 18 + Capacitor 7, deployed as a native iOS app.

## Keeping CLAUDE.md Updated

**IMPORTANT**: Whenever you make changes to the codebase — adding features, modifying data values, adding/removing files, changing constants, updating dependencies, or altering system behavior — you MUST update this CLAUDE.md file to reflect those changes. This document is the single source of truth for AI assistants working on this project. An outdated CLAUDE.md leads to incorrect assumptions and wasted time. Specifically:

- Adding a new component? Add it to the Project Structure section.
- Changing a game constant (prices, XP values, thresholds)? Update it here.
- Adding a new store, hook, or data file? Document it.
- Modifying the tech stack or dependencies? Update the Tech Stack table.
- Adding/removing asset files? Update the Asset State table.
- Adding a new system or feature? Add a section describing it.
- Completing a TODO item? Check it off in the What's Next section.

## Core Gameplay Loop

```
Focus session completes → pet generated (random or player choice from 4 options)
→ pet size based on session length (baby/adolescent/adult)
→ pet placed on floating island using farthest-first spatial algorithm
→ fill island tier (expands 5×5→12×12) → island complete → archive → new island

Alternatively:
Shop → buy egg (common/rare/epic/legendary) with coins
→ egg hatched with custom rarity weights → pet placed on island

Or:
Shop → use Species Selector (5000/8000 coins) → pick exact species → pet placed

Also:
Shop (Decor tab) → buy decoration with coins → goes to inventory
→ tap decorate button on island → select from inventory → tap empty tile → placed
→ decorations are cosmetic, don't count toward island completion

Archipelago:
Unlock themed islands (Coral Reef, Snow Peak, etc.) with coins + level
→ switch between islands → each has its own grid and completion state
→ completing islands grants permanent bonuses (coin rate, XP rate, etc.)
```

## Art & Theme Direction

**Pixel art aesthetic** — cute collectible animals on a floating isometric island:

- **Visual style**: Pixel art pets (PNG sprites, 56–84px responsive), front-facing, transparent background
- **Home screen**: `PetLand` component — floating island with panoramic sky (clouds, sun, god rays, rich SVG landscapes, dust motes, weather particles). Each biome has a dedicated `IslandSkyScene` component rendering unique inline SVG landscapes with organic Bezier-path silhouettes, animated elements (windmill, sailboat, caravan, fireflies, wisteria), and atmospheric effects (heat shimmer SVG filter, aurora, bioluminescence).
- **Island**: Isometric diamond grass surface (inline SVG) with checkerboard tiles, textured cliff walls (dirt + stone bands), grass overhang bumps
- **Island themes**: 6 biome-specific themes (auto-derived from active archipelago island) — Meadow (day), Beach, Winter, Desert, Night Garden, Sakura. Each with unique sky, landscape, cliffs, animated elements
- **Pets**: 41 species across 5 rarities (see Pet Species below)
- **Pet sizes**: Baby (25-45 min), Adolescent (60-90 min), Adult (120+ min) — depth-scaled on island
- **Rarity**: common, uncommon, rare, epic, legendary — with CSS glow/shimmer effects
- **Assets**: `public/assets/pets/*.png` (41 species × 4 variants = 164 PNGs)
- **Decorations**: 20 placeable items across 6 categories — `public/assets/decorations/*.png` (48×48 pixel art PNGs)

## Quick Facts

- **App name**: PhoNo
- **Bundle ID**: `co.phonoinc.app`
- **App Group**: `group.co.phonoinc.app`
- **Package name**: `phono` (in package.json)
- **Storage prefix**: `nomo_` (most localStorage keys; some legacy keys remain)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 (dev on port 8080) |
| Native | Capacitor 7 (iOS primary, Android scaffolded) |
| State | Zustand 5 with `persist` + `subscribeWithSelector` middleware |
| Styling | Tailwind CSS 3 + CSS variables (HSL-based design tokens in `index.css`) |
| UI Library | Radix UI primitives + shadcn/ui components (`src/components/ui/`) |
| Animations | Framer Motion 12 + CSS keyframes |
| Backend | Supabase (auth, database, edge functions) |
| Data Fetching | TanStack React Query 5 |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |
| Date Utils | date-fns 3 |
| Variant Styling | class-variance-authority (CVA) |

## Scripts

```bash
npm run dev          # Vite dev server on :8080
npm run build        # Production build to dist/
npm run build:dev    # Development build (with source maps)
npm run ios          # Build + copy to iOS project
npm run test         # Vitest watch mode
npm run test:run     # Single test run
npm run test:coverage # Coverage report
npm run test:ui      # Vitest UI
npm run test:e2e     # Playwright end-to-end tests
npm run test:e2e:ui  # Playwright UI mode
npm run test:e2e:headed # Playwright headed mode
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run analyze      # Bundle visualization (treemap)
npm run preview      # Preview production build
npm run cap:copy:ios # Copy dist/ to iOS + patch config
```

## Project Structure

```
src/
├── App.tsx                    # Root: ErrorBoundary → QueryClient → NativePluginProvider → OfflineProvider → Router
├── main.tsx                   # Entry point
├── index.css                  # Global CSS, HSL design tokens, Tailwind imports
├── App.css                    # App-level styles
├── vite-env.d.ts              # Vite type declarations
├── pages/
│   ├── Index.tsx              # Main page: auth gate → splash → onboarding → GameUI (lazy-loaded)
│   ├── Auth.tsx               # Login/signup (Apple Sign-In + guest mode) (lazy-loaded)
│   ├── PrivacyPolicy.tsx      # (lazy-loaded)
│   ├── TermsOfService.tsx     # (lazy-loaded)
│   └── NotFound.tsx           # (lazy-loaded)
├── components/
│   ├── PetLand.tsx            # Home screen — floating isometric island with pets
│   ├── IslandSVG.tsx          # Inline SVG island — grass diamond, cliff walls, tile grid, textures
│   ├── IslandSkyScene.tsx     # Rich SVG landscape backgrounds per biome (meadow hills, ocean waves, peaks, dunes, cliffs, cherry hills)
│   ├── IslandPet.tsx          # Single pet on island — positioned, scaled, animated
│   ├── IslandDecoration.tsx   # Single decoration on island — positioned, scaled, sway animation
│   ├── IslandSwitcher.tsx     # Archipelago island switcher UI
│   ├── IslandUnlockModal.tsx  # Modal for unlocking new archipelago islands
│   ├── DecorationPicker.tsx   # Bottom sheet for placing decorations from inventory
│   ├── WeatherParticles.tsx   # Ambient weather particles (dust, snow, leaves, sparkles, fireflies)
│   ├── HomeGoalsWidget.tsx    # Goals widget on home screen
│   ├── NextGoalWidget.tsx     # Compact "next goal" card below status bar (auto-rotates closest goals)
│   ├── GameUI.tsx             # Tab navigation + status bar + reward modals overlay
│   ├── TabContent.tsx         # Lazy-loaded tab renderer with skeleton fallbacks
│   ├── IOSTabBar.tsx          # Bottom tab bar (iOS-native style)
│   ├── TopStatusBar.tsx       # XP bar, coins, level, streak at top
│   ├── UnifiedFocusTimer.tsx  # Focus timer tab (orchestrates timer sub-components)
│   ├── PetCollectionBook.tsx  # Pet collection catalog with wish-list support
│   ├── Shop.tsx               # Shop tab (eggs, power-ups, bundles, decor, featured)
│   ├── Settings.tsx           # Settings tab
│   ├── RewardModals.tsx       # Reward modal coordinator
│   ├── RewardModal.tsx        # Generic reward popup
│   ├── XPRewardModal.tsx      # XP/level-up reward modal
│   ├── DailyLoginRewardModal.tsx  # Daily login bonus modal
│   ├── StreakDisplay.tsx       # Streak visualization
│   ├── AchievementGallery.tsx # Achievement display grid
│   ├── AchievementTracker.tsx # Achievement progress tracker
│   ├── PremiumSubscription.tsx # Premium upgrade UI
│   ├── QuickFocusButton.tsx   # Quick-start focus button
│   ├── GlobalSoundToggle.tsx  # Global sound on/off toggle
│   ├── VersionNotice.tsx      # App version display
│   ├── SplashScreen.tsx       # Loading splash screen
│   ├── ErrorBoundary.tsx      # Top-level error boundary
│   ├── FeatureErrorBoundary.tsx # Feature-scoped error boundary
│   ├── PageErrorBoundary.tsx  # Page-scoped error boundary
│   ├── PluginUnavailableBanner.tsx # Native plugin unavailable warning
│   ├── IslandExpansionModal.tsx # Island tier expansion celebration modal
│   ├── LandCompleteModal.tsx  # Celebration when island is fully filled
│   ├── PetDetailCard.tsx      # Detailed pet info card
│   ├── PetTooltip.tsx         # Pet tap tooltip on island (name, rarity, size)
│   ├── collection/            # Pet collection sub-components
│   │   ├── index.ts, constants.ts
│   │   ├── SpeciesTab.tsx     # Pet species discovery grid grouped by rarity with wish-list
│   │   ├── LandsTab.tsx       # Current and archived floating islands, completion progress
│   │   ├── SpeciesCard.tsx    # Individual species card with rarity badge, discovery count
│   │   ├── SpeciesDetailDrawer.tsx # Drawer modal showing full pet details, affinity, wish mechanics
│   │   ├── LandPreviewModal.tsx # Preview modal for archived islands
│   │   └── ProgressRing.tsx   # SVG circular progress ring for island fill percentage
│   ├── focus-timer/           # Timer sub-components
│   │   ├── index.ts, constants.ts
│   │   ├── TimerView.tsx      # Timer circle display
│   │   ├── TimerDisplay.tsx   # Time remaining display
│   │   ├── TimerControls.tsx  # Start/pause/stop buttons
│   │   ├── TimerPresetGrid.tsx # Duration presets (25/30/45/60/90/120/180 min)
│   │   ├── TimerStats.tsx     # Session statistics summary
│   │   ├── TimerModals.tsx    # Timer-related modals coordinator
│   │   ├── StatsView.tsx      # Detailed statistics view
│   │   ├── ViewToggle.tsx     # Timer/stats view toggle
│   │   ├── FocusLockScreen.tsx # Lock screen during focus
│   │   ├── FocusShieldNudge.tsx # Prompt to enable focus shield
│   │   ├── AppBlockingSection.tsx # App blocking config UI
│   │   ├── AmbientSoundPicker.tsx # Sound selection UI
│   │   ├── BackgroundThemeSwitcher.tsx # Timer background theme picker
│   │   ├── PetRevealModal.tsx # Post-session pet reveal animation
│   │   ├── BreakTransitionModal.tsx # Break between sessions modal
│   │   ├── SessionNotesModal.tsx # Post-session notes
│   │   ├── SessionCompleteView.tsx # Session completion summary view
│   │   ├── TaskIntentionModal.tsx # Pre-session task intention
│   │   ├── backgrounds/       # Timer background themes (6)
│   │   │   ├── index.tsx, ThemeContext.tsx
│   │   │   ├── SkyBackground.tsx, ForestBackground.tsx, SnowBackground.tsx
│   │   │   ├── NightBackground.tsx, SunsetBackground.tsx, CityBackground.tsx
│   │   └── hooks/             # Timer-specific hooks
│   │       ├── useTimerCore.ts, useTimerCountdown.ts, useTimerControls.ts
│   │       ├── useTimerLogic.ts, useTimerRewards.ts, useTimerPersistence.ts
│   │       ├── useTimerAudio.ts, useBackgroundTheme.ts
│   │       ├── useBreakTransition.ts, useSessionNotes.ts
│   ├── gamification/          # Challenges/achievements tab
│   │   ├── index.ts
│   │   ├── GamificationHub.tsx, AchievementUnlockModal.tsx, MilestoneCelebration.tsx
│   ├── analytics/             # Analytics dashboard (30 files)
│   │   ├── index.ts, Analytics.tsx
│   │   ├── AnalyticsStatCards.tsx, AnalyticsGoalRing.tsx, AnalyticsWeeklyChart.tsx
│   │   ├── AnalyticsHeatmap.tsx, AnalyticsBestHours.tsx, AnalyticsCategoryBreakdown.tsx
│   │   ├── AnalyticsComparison.tsx, AnalyticsCompletionTrend.tsx
│   │   ├── AnalyticsFocusQuality.tsx, AnalyticsFocusScore.tsx, AnalyticsFocusScoreTrend.tsx
│   │   ├── AnalyticsInsights.tsx, AnalyticsMilestones.tsx, AnalyticsMonthlySummary.tsx
│   │   ├── AnalyticsRecords.tsx, AnalyticsSessionHistory.tsx, AnalyticsWeeklyReport.tsx
│   │   ├── AnalyticsFlowStates.tsx, AnalyticsFocusPersonality.tsx
│   │   ├── AnalyticsGamificationPanel.tsx, AnalyticsPredictions.tsx
│   │   ├── AnalyticsRadarChart.tsx, AnalyticsSessionTimeline.tsx
│   │   ├── AnalyticsSmartSchedule.tsx, AnalyticsStreakFlame.tsx, AnalyticsStreakAlert.tsx
│   │   ├── CollapsibleAnalyticsSection.tsx, SimpleBarChart.tsx
│   ├── shop/                  # Shop sub-components
│   │   ├── styles.ts
│   │   ├── BundleConfirmDialog.tsx, PurchaseConfirmDialog.tsx
│   │   ├── ShopPreviewComponents.tsx
│   │   ├── EggHatchAnimation.tsx    # Egg hatching animation
│   │   ├── SpeciesSelectorModal.tsx # Species selector purchase modal
│   │   └── tabs/
│   │       ├── EggsTab.tsx, BackgroundsTab.tsx, FeaturedTab.tsx
│   │       ├── InventoryTab.tsx, PowerUpsTab.tsx, DecorTab.tsx
│   ├── settings/              # Settings sub-components (10 files)
│   │   ├── SettingsProfile.tsx, SettingsAccount.tsx, SettingsTimer.tsx
│   │   ├── SettingsFocusMode.tsx, SettingsGame.tsx, SettingsSound.tsx
│   │   ├── SettingsAnalytics.tsx, SettingsAppearance.tsx
│   │   ├── SettingsData.tsx, SettingsAbout.tsx
│   ├── onboarding/
│   │   └── OnboardingFlow.tsx
│   ├── dev/
│   │   └── PerformanceMonitor.tsx
│   └── ui/                    # shadcn/ui component library (41 files)
│       ├── button.tsx, card.tsx, dialog.tsx, drawer.tsx, input.tsx ...
│       ├── skeleton-loaders.tsx, PixelIcon.tsx
│       ├── badge.variants.ts, button.variants.ts, toggle.variants.ts
│       ├── use-form-field.ts, use-sidebar.ts
│       └── (40+ Radix-based primitives)
├── stores/                    # Zustand state management (16 files)
│   ├── index.ts               # Store exports
│   ├── landStore.ts           # Pet island grid, archipelago, egg hatching, wish list, passive income, decorations
│   ├── xpStore.ts             # XP, level (max 50), unlocked entities
│   ├── coinStore.ts           # Coin balance, earnings, spending, server sync
│   ├── premiumStore.ts        # Subscription tier management
│   ├── streakStore.ts         # Streak tracking, freezes, milestones
│   ├── focusStore.ts          # Focus mode settings, blocked apps, strict mode
│   ├── navigationStore.ts     # Active tab, modal state (not persisted)
│   ├── shopStore.ts           # Owned items, equipped background
│   ├── collectionStore.ts     # Legacy collection state
│   ├── soundStore.ts          # Sound mixer layers, ambient sounds, volume
│   ├── questStore.ts          # Daily/weekly quests, challenges
│   ├── onboardingStore.ts     # Onboarding completion state
│   ├── authStore.ts           # Guest ID, guest mode flag
│   ├── themeStore.ts          # Home background theme (deprecated — theme now derived from active island biome)
│   └── offlineSyncStore.ts    # Offline action queue for sync
├── hooks/                     # Custom React hooks (40 files)
│   ├── useAuth.ts, useXPSystem.ts, useCoinSystem.ts, useStreakSystem.ts
│   ├── useFocusMode.ts, useStoreKit.ts, useDeviceActivity.ts
│   ├── useQuestSystem.ts, useAchievementSystem.ts, useAchievementTracking.ts
│   ├── useMilestoneCelebrations.ts, useDailyLoginRewards.ts, useCoinBooster.ts
│   ├── useRewardHandlers.ts, useSoundMixer.ts, useAmbientSound.ts
│   ├── useSoundEffects.ts, useClickSound.ts, useHaptics.ts
│   ├── useWidgetSync.ts, useTimerExpiryGuard.ts
│   ├── useBackendAppState.ts, useBackendStreaks.ts, useBackendQuests.ts
│   ├── useSupabaseData.ts, useShop.ts, useSettings.ts, useOnboarding.ts
│   ├── usePremiumStatus.ts, useAnalytics.ts, useAnimatedCounter.ts
│   ├── useAppStateTracking.ts, useNotifications.ts, useNativePluginStatus.ts
│   ├── useOfflineSyncManager.ts, usePerformanceMonitor.ts, useReducedMotion.ts
│   ├── useServiceWorker.ts, usePassiveIncome.ts, use-mobile.tsx
│   └── xp/                    # XP system module
│       ├── index.ts, useXPSystem.ts, xpConstants.ts, xpTypes.ts, xpUtils.ts
├── data/
│   ├── PetDatabase.ts         # 41 pet species, rarity weights, growth sizes, roll functions
│   ├── EggData.ts             # 4 egg types, prices, custom rarity weights, species selector prices
│   ├── ArchipelagoData.ts     # 6 archipelago island definitions with unlock/cost/bonuses
│   ├── IslandThemes.ts        # 11 island themes with full color configs (sky, grass, cliff, particles)
│   ├── islandPositions.ts     # Island slot positions, isometric projection, depth scaling, expansion tiers
│   ├── DecorationData.ts      # 20 decoration definitions (6 categories), rarity, prices, sprites
│   ├── ShopData.ts            # Shop items, backgrounds, bundles, coin packs, utility items
│   ├── GamificationData.ts    # 41 milestones, 20 daily + 10 weekly challenge templates
│   ├── AmbientSoundsData.ts   # 31 ambient sounds (8 free + 23 premium), 5 categories
│   ├── SpecialAnimations.ts   # Special celebration animations
│   └── LazySpecialAnimations.ts # Lazy-loaded animation variants
├── types/                     # TypeScript type definitions (14 files)
│   ├── index.ts, achievements.ts, analytics.ts, app.ts, browser-utils.ts
│   ├── gamification.ts, plugins.ts, quest-system.ts, rewards.ts
│   ├── shop.ts, streak-system.ts, supabase-models.ts, theme.ts, xp-system.ts
├── lib/                       # Utilities (17 files)
│   ├── constants.ts           # ALL game constants (XP, coins, streaks, pity, passive income, etc.)
│   ├── validation.ts          # Input validation helpers
│   ├── storage-validation.ts  # Zod schemas for persisted state
│   ├── storage-keys.ts        # localStorage key constants
│   ├── validated-zustand-storage.ts # Safe Zustand storage adapter with Zod
│   ├── logger.ts              # Structured logging
│   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
│   ├── security.ts, accessibility.ts, apiUtils.ts, debounce.ts
│   ├── errorHandling.ts, errorReporting.ts, iosOptimizations.ts
│   ├── memoization.ts, minimalSentry.ts, spriteAnimationManager.ts
├── styles/                    # Modular CSS (13 files)
│   ├── pet-land.css, animations.css, base.css, navigation.css
│   ├── timer-controls.css, timer-backgrounds.css
│   ├── collection.css, gamification.css, shop.css, settings.css
│   ├── retro-theme.css, retro-elements.css, utilities.css
├── contexts/                  # React contexts (4 files)
│   ├── AppContext.tsx, AppStateContext.tsx
│   ├── NativePluginContext.tsx, OfflineContext.tsx
├── plugins/                   # Capacitor native plugins
│   ├── device-activity/       # iOS Screen Time / DeviceActivity framework
│   ├── store-kit/             # StoreKit 2 IAP
│   ├── app-review/            # App Store review prompt
│   └── widget-data/           # iOS widget data bridge
├── services/                  # Business logic services
│   ├── achievementService.ts  # Achievement processing service
│   └── achievement/           # Achievement sub-modules (7 files)
├── test/                      # Test files (mirrors src/ structure)
│   ├── setup.ts
│   ├── components/ (1 test), contexts/ (1 test), database/ (3 tests)
│   ├── hooks/ (24 tests), stores/ (6 tests), lib/ (13 tests)
│   ├── services/, integration/ (4 tests), e2e/ (1 test), utils/
└── integrations/
    └── supabase/              # Supabase client + generated types
```

### Other Project Directories

```
scripts/                       # Build & generation scripts
├── assemble-spritesheet.mjs, generate-island-decorations.ts
├── generate-pet-sprites.ts, generate-placeholders.cjs
├── generate-splash.py, generate-sprite-directions.ts
└── patch-ios-config.cjs

docs/                          # Documentation (9 files)
├── API.md, APP_STORE_CONNECT_IAP_SETUP.txt, IAP_STRATEGY.md
├── IOS_SETUP.md, PRIVACY_POLICY.md, TERMS_OF_SERVICE.md
├── TESTING.md, WIDGETS.md, privacy.html

e2e/                           # Playwright E2E tests
├── auth.spec.ts, collection.spec.ts, focus-timer.spec.ts
├── navigation.spec.ts, shop.spec.ts, streaks.spec.ts
└── integration/ (3 specs: error-handling, rewards-achievements, user-journey)

public/assets/                 # Static assets
├── pets/                      # 164 PNG files (41 species × 4 variants)
├── decorations/               # 20 PNG decoration sprites (48×48)
├── icons/                     # 177 PNG icon files
├── robots/                    # 25 SVG robot files across 6 subdirectories (legacy)
├── worlds/                    # 11 PNG world background files
└── sprites/                   # (empty, reserved for spritesheets)
```

## App Flow

1. `App.tsx` — wraps everything in ErrorBoundary → QueryClientProvider → NativePluginProvider → OfflineProvider → TooltipProvider → BrowserRouter. All pages lazy-loaded via `React.lazy()`.
2. Routes: `/` (Index), `/auth`, `/privacy`, `/terms`, `*` (NotFound)
3. `Index.tsx`:
   - Checks auth → redirects to `/auth` if not authenticated
   - Hides native + HTML splash screens once auth resolves
   - Shows `OnboardingFlow` if `!hasCompletedOnboarding`
   - Renders **GameUI** (full-screen overlay, lazy-loaded)
4. **GameUI** manages tab state and renders:
   - `TopStatusBar` — XP bar, level, coins, streak (home tab only)
   - `TabContent` — renders active tab (PetLand for home, lazy-loads others)
   - `IOSTabBar` — bottom navigation
   - `RewardModals` — XP/coin/milestone/daily-login reward popups
   - `AchievementTracker` — cross-component achievement tracking
   - `IslandExpansionModal` / `LandCompleteModal` — island celebrations
5. **Tabs**: home (PetLand), timer, collection (PetCollectionBook), shop, settings

## Stores (Zustand)

All stores use `zustand/persist` (except navigationStore) with validated localStorage via `createValidatedStorage()` and Zod schemas where indicated. Storage keys are prefixed with `nomo_` unless noted.

| Store | Key | Validated | Purpose |
|-------|-----|-----------|---------|
| `landStore` | `nomo_land_data` | Yes | **Island grid, archipelago (6 islands), expansion tiers, species catalog, pending pet/egg, wished species, species affinity, pity counter, decoration inventory, passive income** |
| `xpStore` | `nomo_xp_system` | Yes | XP, level (max 50), prestige |
| `coinStore` | `nomo_coin_system` | Yes | Coin balance, totalEarned, totalSpent, server sync |
| `premiumStore` | `nomo_premium` | Yes | Subscription tier (free/premium), benefits |
| `streakStore` | `nomo_streak_data` | No | Current streak, longest streak, streak freezes (max 3), total sessions |
| `focusStore` | `nomo_focus_mode` | No | Focus mode settings, blocked apps, strict mode |
| `navigationStore` | *(not persisted)* | — | Active tab, modal state, navigation history |
| `shopStore` | `nomo_shop_inventory` | No | Owned characters/backgrounds, equipped background, purchased bundles, daily deal purchase date |
| `collectionStore` | `botblock-collection` | No | Legacy collection state (activeHomeBots, favorites) |
| `soundStore` | `nomo_sound` | No | Sound mixer layers, ambient sounds, island ambient, volume |
| `questStore` | `nomo_quest_system` | No | Daily/weekly quests, daily/weekly challenges |
| `onboardingStore` | `nomo_onboarding` | No | Onboarding completion, chosen starter pet, island name |
| `authStore` | `nomo_auth` | No | Guest ID, guest mode flag |
| `themeStore` | `petIsland_homeBackground` | No | Home background theme — **deprecated**, theme now auto-derived from active island biome |
| `offlineSyncStore` | `nomo_offline_sync` | No | Offline action queue, sync status |

### landStore Key State

```typescript
interface LandStoreState {
  currentLand: Land;              // Active island (cells, gridSize, theme, etc.)
  completedLands: Land[];         // Archived islands
  speciesCatalog: Record<string, SpeciesCatalogEntry>; // Discovery tracking
  pendingPet: PendingPet | null;  // Pet waiting to be placed
  pendingEgg: PendingEgg | null;  // Egg waiting to be hatched
  ownedThemes: string[];
  selectedNextTheme: string;
  wishedSpecies: string | null;
  speciesAffinity: Record<string, number>;
  lastOfflineCheck: number;       // For passive income calculation
  pityCounter: number;            // Bad luck protection
  lastSessionTimestamp: number;
  decorationInventory: Record<string, number>;
  archipelago: ArchipelagoIsland[]; // Multi-island system
  activeIslandIndex: number;      // Currently active island
}
```

### landStore Key Actions

- `generateRandomPet(sessionMinutes, playerLevel, premiumBoost?)` — rolls random pet
- `generatePetChoices(sessionMinutes, playerLevel, count=4)` — gives player 4 options to choose from
- `choosePet(speciesId, sessionMinutes)` — player picks a specific pet from choices
- `hatchEgg(egg, playerLevel)` — hatches shop egg with custom rarity weights
- `generateSessionEgg(sessionMinutes, playerLevel)` — generates egg from focus session
- `hatchSessionEgg()` — hatches a session-generated egg
- `selectSpecies(speciesId)` — species selector purchase
- `placePendingPet()` — places pet on island using farthest-first algorithm
- `startNewLand()`, `isLandComplete()`, `isTierFull()`, `getFilledCount()`, `getAvailableCells()`
- `setWishedSpecies(speciesId)`, `getAffinityLevel(speciesId)`
- `collectOfflineIncome()`, `getDailyIncomeRate()`, `getIslandMood()`
- `addDecorationToInventory()`, `placeDecoration()`, `removeDecoration()`, `moveDecoration()`
- `switchIsland()`, `unlockIsland()`, `getActiveIsland()`, `getCompletedIslandBonuses()`

## Pet Collection System

### Pet Species (41 total)

| Rarity | Count | Species | Unlock Levels |
|--------|-------|---------|--------------|
| Common | 16 | Bunny, Chick, Frog, Hamster, Duckling, Capybara, Hedgehog, Turtle, Bee, Mouse, Butterfly, Elephant, Monkey, Sparrow, Jellyfish, Sloth | 0–16 |
| Uncommon | 10 | Fox, Cat, Corgi, Penguin, Shiba Inu, Koala, Raccoon, Parrot, Otter, Seal | 4–24 |
| Rare | 9 | Deer, Owl, Panda, Red Panda, Wolf, Arctic Fox, Polar Bear, Flamingo, Crane | 9–32 |
| Epic | 4 | Dragon, Tiger, Axolotl, Phoenix | 20–35 |
| Legendary | 2 | Unicorn, Koi Fish | 40, 45 |

### Growth Sizes (3 tiers)
| Size | Session Duration | Scale Factor |
|------|-----------------|-------------|
| Baby | 25-45 min | 0.65 |
| Adolescent | 60-90 min | 0.82 |
| Adult | 120+ min | 1.0 |

### Rarity & Drop Weights
| Rarity | Drop Weight | Glow Color |
|--------|------------|------------|
| Common | 45% | None |
| Uncommon | 28% | `rgba(255, 255, 255, 0.6)` |
| Rare | 17% | `rgba(59, 130, 246, 0.7)` |
| Epic | 8% | `rgba(168, 85, 247, 0.7)` |
| Legendary | 2% | `rgba(234, 179, 8, 0.8)` + shimmer |

### Pity System (Bad Luck Protection)
| Threshold | Guarantee |
|-----------|-----------|
| 15 rolls without rare+ | Guaranteed rare |
| 40 rolls without epic+ | Guaranteed epic |
| 80 rolls without legendary | Guaranteed legendary |

Premium rarity boost shifts weights: common -8, uncommon +2, rare +3, epic +2, legendary +1.

### Egg System

| Egg | Price | Common | Uncommon | Rare | Epic | Legendary |
|-----|-------|--------|----------|------|------|-----------|
| Starter Egg | 50 coins | 95% | 5% | 0% | 0% | 0% |
| Common Egg | 150 coins | 80% | 15% | 5% | 0% | 0% |
| Rare Egg | 600 coins | 40% | 35% | 20% | 5% | 0% |
| Epic Egg | 1,200 coins | 0% | 15% | 40% | 35% | 10% |
| Legendary Egg | 4,500 coins | 0% | 0% | 20% | 40% | 40% |

**Species Selector**: 5,000 coins (discovered species) / 8,000 coins (undiscovered species).

**Session Egg Tier Drop Rates**: common 55%, rare 30%, epic 12%, legendary 3%.

### Wish List & Affinity

- `wishedSpecies` — players can wish for a specific species (stored in landStore)
- `speciesAffinity` — tracks affinity with species over time (levels: none/familiar/bonded/devoted)
- `SpeciesDetailDrawer` shows full pet details with affinity stats and wish mechanics

### Passive Income System

Pets generate coins per day based on rarity and growth size:

| Rarity | Baby | Adolescent | Adult |
|--------|------|------------|-------|
| Common | 2 | 3 | 4 |
| Uncommon | 3 | 5 | 7 |
| Rare | 5 | 7 | 11 |
| Epic | 7 | 11 | 16 |
| Legendary | 12 | 16 | 24 |

- Max accumulation: 3 days
- Min hours before claim: 1
- Premium multiplier: 2x

### Floating Island System

**Island Visual Structure** (`IslandSVG.tsx` + `pet-land.css`):
- **Sky**: Themed gradient (defined in `IslandThemes.ts`) with animated sun, god rays, clouds, mountains, weather particles
- **Island wrapper**: Floating bob animation (4s, ±6px vertical)
- **Island container**: Multi-layer parallax tilt (ref-based, no React re-renders)
- **Island SVG** (`IslandSVG.tsx`): Inline SVG (viewBox 420×258) with isometric diamond, checkerboard tiles, cliff walls, grass overhang
- **Pinch-to-zoom**: 0.8×–2.0×, supports pinch, wheel, and double-tap

**Grid Constants** (`islandPositions.ts`):
```
GRID_SIZE = 20              // Underlying grid dimension (20×20 = 400 cells)
MIN_GRID_TIER = 5           // Island starts as centered 5×5 (25 cells)
MAX_GRID_TIER = 12          // Maximum expansion to centered 12×12 (144 cells)
EXPANSION_TIERS = [5, 6, 7, 8, 9, 10, 11, 12]
```

**Depth System**: Back of island = 0.85 scale, front = 1.0. Z-index range 10–28.

**Smart Placement Algorithm** (`landStore.ts`):
- First 2 pets placed randomly
- After that: farthest-first insertion with random jitter (±2 distance)

### Archipelago System

6 themed islands that players unlock with coins and level:

| Island | Biome | Level | Cost | Completion Bonus |
|--------|-------|-------|------|-----------------|
| Home Island | Meadow | 0 | Free | — |
| Coral Reef | Beach | 10 | 2,000 | +20% coin rate |
| Snow Peak | Winter | 18 | 5,000 | +2 streak freezes/month |
| Desert Oasis | Desert | 25 | 8,000 | +25% XP rate |
| Moonlit Garden | Night | 32 | 12,000 | +15 daily passive coins |
| Sakura Valley | Sakura | 40 | 15,000 | 35% egg discount |

Players can switch between unlocked islands. Each island has its own grid and completion state.

### Island Themes (6 biome-specific)

Defined in `IslandThemes.ts`. Each theme is auto-derived from the active archipelago island's biome — not user-selectable. Themes specify: sky gradient, grass/cliff/stone colors, unique landscape (hills/ocean/peaks/dunes/cliffs), animated sky elements, weather particle overrides, depth shading, and tier decoration palettes.

| Theme | Island | Landscape | Sky Animation | Unique Features |
|-------|--------|-----------|---------------|-----------------|
| day | Home Island | Rolling hills + treeline | Butterflies | Golden sun, god rays, green moss cliffs |
| beach | Coral Reef | Ocean with waves + palms | Seagulls | Warm sun, coral accents, sandy limestone |
| winter | Snow Peak | Jagged peaks with snow caps | Aurora borealis | Pale sun, icy stone, frost crystals |
| desert | Desert Oasis | Sand dunes | Heat shimmer | Warm sun, sandstone, fossil marks |
| night | Moonlit Garden | Dark cliff outlines | Shooting stars | Moon (no sun), star field, bioluminescent moss |
| sakura | Sakura Valley | Pink hills + cherry trees | Petal stream | Rose-tinted sun, cherry petal accents |

### Decoration System

20 decorations across 6 categories (trees, flowers, rocks, water, structures, fun). Prices range 80–500 coins. Decorations occupy tiles but don't count toward island completion. Edit mode toggle on PetLand enables place/pick-up UX via `DecorationPicker` bottom sheet.

## Game Systems

### XP & Leveling
- **Max level**: 50
- **XP per minute of focus**: 1.2 base
- **Level formula**: Thresholds table for levels 1-20 `[0, 30, 70, 120, 180, 260, 350, 460, 590, 740, 920, 1120, 1350, 1610, 1900, 2230, 2600, 3010, 3470, 3980]`, then 700 XP/level after 20
- **Streak bonus**: +3% per day, capped at 60% (max multiplier 1.6x at 20 days)
- **Premium multiplier**: 2x
- **Focus bonuses**: Perfect focus (0 blocked attempts) = +35% XP + 100 coins; Good focus (1-2 attempts) = +20% XP + 50 coins
- **Level-ups unlock new pet species** in the random drop pool
- **Prestige system** exists in xpStore

### Coins
- **Base rate**: 2 coins/minute of focus
- **Session completion bonuses**: 25→+15, 30→+20, 45→+35, 60→+50, 90→+80, 120→+120, 180→+180, 240→+240, 300→+300
- **Random bonus**: 5% chance mega (2.5x), 10% super lucky (1.75x), 20% lucky (1.5x)
- **Daily login**: 20 coins + 5/streak day (cap 100)
- **Land completion**: 500 coin bonus
- **Server-validated**: via `validate-coins` edge function. Local store is cache.

### Coin Boosters
| Booster | Multiplier | Duration | Cost |
|---------|-----------|----------|------|
| Focus Boost | 2x | 1 day | 400 coins |
| Super Boost | 3x | 3 days | 1,000 coins |
| Weekly Pass | 1.5x | 7 days | 1,500 coins |

### Streaks
- **Milestones**: 3, 7, 14, 30, 60, 100, 365 days
- **XP bonuses**: 75, 200, 400, 1000, 2500, 5000, 15000
- **Coin bonuses**: 100, 300, 600, 1500, 3500, 7500, 20000
- **Streak freezes**: max 3, cost 100 coins each
- **Reset window**: 24 hours

### Premium Tiers
| Benefit | Free | Premium |
|---------|------|---------|
| Coin Multiplier | 1x | 2x |
| XP Multiplier | 1x | 2x |
| Streak Freezes/month | 0 | 3 |
| Sound Mixing Slots | 1 | 3 |
| Focus Preset Slots | 1 | 5 |
| Rarity Boost | No | Yes |
| Passive Income Multi | 1x | 2x |

### Focus Mode
- Blocks configurable apps via iOS DeviceActivity/Screen Time
- Strict mode, notification blocking, emergency bypass with cooldown
- Ambient sound mixer during focus sessions (31 sounds, 5 categories, 8 free + 23 premium)
- Break transitions between Pomodoro sessions (short 5min, long 15min after 4 sessions)
- Task intention + session notes modals

### Challenges & Gamification
- **41 milestones** across level, streak, sessions, hours, and collection categories
- **13 daily challenge templates** (easy/medium/hard), 3 active per day
- **10 weekly challenge templates**
- **Daily Sweep bonus**: 200 coins for completing all 3 daily quests in one day (stored in `questStore.dailySweepClaimed`)
- **Quest completion celebration**: Animated green checkmarks (scale-in 300ms) + coin reward display in SessionCompleteView
- **`DAILY_SWEEP_BONUS`** constant: 200 (in `GamificationData.ts`)
- **60+ achievements** with rarity-based point values

### Next Goal Widget
- Compact 44px card shown on home screen below the status bar
- Calculates % completion for: next level (xpStore), next island unlock (coinStore + ArchipelagoData), next species milestone (landStore + GamificationData)
- Shows the goal closest to completion (highest %)
- Auto-rotates every 8s between goals within 20% of each other
- Tappable popover shows top 3 upcoming goals
- Glass/blur effect matching the home screen aesthetic
- Component: `src/components/NextGoalWidget.tsx`, styles in `src/styles/pet-land.css`

### Daily Deal
- Deterministic daily rotating deal in the shop's Featured tab
- Deal types (weighted): 40% egg (30% off), 30% decoration (40% off), 30% background (25% off)
- Seed: hash of date string for consistent daily selection
- Players below level 10 get cheaper items weighted
- Gold/amber bordered card with shimmer, countdown timer to midnight
- "Claimed" state when purchased (tracked in `shopStore.dailyDealPurchasedDate`)
- Function: `getDailyDeal(playerLevel)` in `src/data/ShopData.ts`
- UI: `src/components/shop/tabs/FeaturedTab.tsx`, styles in `src/styles/shop.css`

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useXPSystem` | XP calculations, level-ups. Re-exports from `./xp/` module |
| `useCoinSystem` | Coin earning/spending with server validation, rate limiting, sync |
| `useStreakSystem` | Streak tracking, freeze management, milestone rewards |
| `useAuth` | Supabase auth, Apple Sign-In, guest mode |
| `useFocusMode` | Focus mode settings, blocked apps list |
| `useStoreKit` | StoreKit 2 IAP (subscriptions, coin packs, bundles), receipt validation |
| `useDeviceActivity` | iOS Screen Time / DeviceActivity integration, app blocking |
| `useQuestSystem` | Daily/weekly quest generation and tracking |
| `useAchievementSystem` | Achievement unlock logic (60+ achievements) |
| `useAchievementTracking` | Event-based cross-component achievement progress |
| `useMilestoneCelebrations` | Milestone detection and celebration UI |
| `useDailyLoginRewards` | 7-day rotating daily login rewards |
| `useCoinBooster` | Temporary coin multiplier items |
| `useRewardHandlers` | Session completion reward orchestration |
| `useSoundMixer` | Ambient sound layering (Web Audio API synthesis) |
| `useSoundEffects` | UI sound effects (synthesized, no audio files) |
| `useHaptics` | iOS haptic feedback |
| `useWidgetSync` | iOS widget data synchronization |
| `useTimerExpiryGuard` | Ensures timer fires even if app backgrounded |
| `useBackendAppState` | Unified app state with Supabase sync |
| `usePassiveIncome` | Passive coin income from pets |
| `useReducedMotion` | Respects `prefers-reduced-motion` |
| `useOfflineSyncManager` | Offline action queue processing |

### Timer Hooks (`focus-timer/hooks/`)

| Hook | Purpose |
|------|---------|
| `useTimerCore` | Core timer state machine (idle/running/paused/break) |
| `useTimerCountdown` | Countdown tick logic |
| `useTimerControls` | Play/pause/stop actions |
| `useTimerLogic` | Orchestrates all timer hooks together |
| `useTimerRewards` | Post-session XP/coin/pet reward calculation |
| `useTimerPersistence` | Persists timer state across app restarts |
| `useTimerAudio` | Timer completion/tick sounds |
| `useBackgroundTheme` | Timer background theme management |
| `useBreakTransition` | Pomodoro break flow management |
| `useSessionNotes` | Session notes management |

## Native Plugins (Capacitor)

| Plugin | Path | Purpose |
|--------|------|---------|
| `DeviceActivity` | `src/plugins/device-activity/` | iOS Screen Time framework for app blocking |
| `StoreKit` | `src/plugins/store-kit/` | StoreKit 2 for IAP (subscriptions + consumables) |
| `AppReview` | `src/plugins/app-review/` | SKStoreReviewController prompts |
| `WidgetData` | `src/plugins/widget-data/` | Bridge data to iOS home screen widgets |

All plugins have web fallbacks (no-op/simulated) so the app runs in browsers during development.

## Supabase Backend

### Edge Functions (`supabase/functions/`)
| Function | Purpose |
|----------|---------|
| `calculate-xp` | Server-side XP calculation and validation |
| `validate-coins` | Server-authoritative coin balance verification |
| `validate-receipt` | StoreKit receipt validation for IAP |
| `process-achievements` | Achievement unlock processing |
| `delete-account` | Account deletion (GDPR compliance) |
| `waitlist-signup` | Public waitlist signup (email, referral code, referral tracking) |
| `_shared/cors.ts` | Shared CORS configuration |

### Auth
- Supabase Auth with Apple Sign-In (`@capacitor-community/apple-sign-in`)
- Guest mode supported (local-only, data stored with guest UUID)

## Design System

- **Background**: `#FAFAF9` (warm white/stone) for non-home tabs
- **Home screen**: Floating island on themed gradient sky
- **CSS Variables**: HSL-based design tokens in `src/index.css`, consumed via Tailwind
- **Component library**: shadcn/ui with Radix UI primitives + CVA for variant systems
- **Animations**: Framer Motion for page transitions + CSS keyframes for island/pet animations
- **Fonts**: SF Pro Display (Apple) with Inter fallback (via `@fontsource/inter`)
- **Responsive**: Pet sprites scale 56px → 62px → 68px → 74px → 84px at breakpoints (375px, 390px, 420px, 768px)
- **Reduced motion**: All animations disabled if `prefers-reduced-motion: reduce`

### CSS Architecture (`src/styles/`)
13 modular CSS files: `pet-land.css`, `animations.css`, `base.css`, `navigation.css`, `timer-controls.css`, `timer-backgrounds.css`, `collection.css`, `gamification.css`, `shop.css`, `settings.css`, `retro-theme.css`, `retro-elements.css`, `utilities.css`

### CSS Class Naming
- BEM-style: `.pet-land__sky`, `.island-pet__sprite`, `.island-pet--legendary`
- Modifier classes for rarity: `.island-pet--uncommon`, `--rare`, `--epic`, `--legendary`
- State classes: `.island-pet--new` (pop animation)
- Decoration classes: `.island-decoration__sprite`, `.island-decoration--sways`

## Build & Deploy

1. `npm run build` — Vite builds to `dist/` (code-split: vendor-react, vendor-radix, vendor-motion, vendor-data, vendor-utils)
2. `npm run cap:copy:ios` — copies `dist/` into iOS project + runs `scripts/patch-ios-config.cjs`
3. Open `ios/App/App.xcworkspace` in Xcode
4. Build/archive from Xcode for TestFlight/App Store

## Important Patterns

- **Validated persistence**: Stores with Zod schemas use `createValidatedStorage()` — invalid data falls back to defaults.
- **Lazy loading**: All pages and tab content lazy-loaded with `React.lazy()` and skeleton fallbacks.
- **Error boundaries**: Three levels — `ErrorBoundary` (app), `PageErrorBoundary` (page), `FeatureErrorBoundary` (feature).
- **Server-authoritative coins**: Coin balance validated via `validate-coins` edge function with offline-first caching.
- **Event-based achievements**: `useAchievementTracking` uses custom events for cross-component progress.
- **Offline support**: `offlineSyncStore` queues actions when offline, `useOfflineSyncManager` processes on reconnect.
- **Native plugin fallbacks**: All Capacitor plugins have web fallbacks. `NativePluginContext` tracks availability.
- **Isometric depth**: Pets at back render smaller (0.85×) with lower z-index.
- **Parallax tilt**: Touch-drag shifts sky/island/pets layers at different speeds using ref-based DOM updates.
- **SVG-aligned positions**: `islandPositions.ts` and `IslandSVG.tsx` share diamond vertices for precise alignment.
- **Pity system**: `pityCounter` in landStore guarantees rare/epic/legendary after N unsuccessful rolls.
- **Archipelago**: Multiple themed islands with unlock requirements, completion bonuses, and independent grids.
- **Passive income**: Pets generate daily coins based on rarity/size, with premium multiplier.
- **Sound synthesis**: All UI sounds and ambient audio synthesized via Web Audio API (no audio files).
- **Fail-closed IAP**: StoreKit purchases validated server-side via `validate-receipt` edge function.

## Path Aliases

`@/` maps to `src/` (configured in vite.config.ts and tsconfig.json).

## Timer Durations

Available focus session presets: **25, 30, 45, 60, 90, 120, 180 minutes**.
Minimum 25 minutes for XP rewards. Pomodoro-style: 4 sessions then long break (15 min), short breaks 5 min.

## StoreKit Product IDs

```
Subscriptions (Auto-Renewable):
  co.phonoinc.app.premium.weekly    — $1.99/week
  co.phonoinc.app.premium.monthly   — $4.99/month
  co.phonoinc.app.premium.yearly    — $29.99/year

Coin Packs (Consumable):
  co.phonoinc.app.coins.handful     — $0.99
  co.phonoinc.app.coins.pouch       — $2.99
  co.phonoinc.app.coins.chest       — $4.99
  co.phonoinc.app.coins.trove       — $9.99
  co.phonoinc.app.coins.hoard       — $19.99

Bundles (Non-Consumable):
  co.phonoinc.app.bundle.welcome       — $1.99
  co.phonoinc.app.bundle.egghunter     — $4.99
  co.phonoinc.app.bundle.islandmaster  — $9.99
```

## Marketing Website (`website/`)

A separate Vite + React project for the pre-launch waitlist landing page.

**Tech**: React 19, TypeScript, Vite 7, Tailwind CSS 4, Framer Motion, react-router-dom v7, @supabase/supabase-js

**URL**: Deployed to Vercel (configured via `website/vercel.json`)

### Website Structure

```
website/
├── index.html, package.json, vercel.json, vite.config.ts
├── src/
│   ├── main.tsx, App.tsx
│   ├── styles/globals.css
│   ├── lib/
│   │   └── supabase.ts        # Supabase client for waitlist API
│   ├── data/
│   │   ├── PetDatabase.ts     # Pet data for showcase
│   │   └── islandPositions.ts  # Island positions for preview
│   └── components/
│       ├── Nav.tsx, HeroSection.tsx, SkyBackground.tsx
│       ├── IslandScene.tsx, IslandSVG.tsx, WaitlistForm.tsx
│       ├── LoopSection.tsx, PetShowcase.tsx, IslandGrowth.tsx
│       ├── RewardsSection.tsx, SocialProof.tsx, FinalCTA.tsx
│       ├── Footer.tsx, PrivacyPolicy.tsx, TermsOfService.tsx, Support.tsx
└── public/
    ├── app-icon.png
    ├── pets/          # 164 PNG files (copies of main app)
    └── decorations/   # 20 PNG files (copies of main app)
```

### Running the Website
```bash
cd website && npm install && npm run dev    # Dev server
cd website && npm run build                 # Production build
```

## Current Asset State

| Asset | Location | Count | Format | Status |
|-------|----------|-------|--------|--------|
| Pet sprites | `public/assets/pets/` | 164 | 48×48 RGBA PNG | **Placeholder** (Pillow-generated) |
| Decoration sprites | `public/assets/decorations/` | 20 | 48×48 RGBA PNG | **Placeholder** (Pillow-generated) |
| Website pet copies | `website/public/pets/` | 164 | 48×48 RGBA PNG | **Placeholder** (copies of above) |
| Website decoration copies | `website/public/decorations/` | 20 | 48×48 RGBA PNG | **Placeholder** (copies of above) |
| Icons | `public/assets/icons/` | 177 | PNG | Done |
| Robots (legacy) | `public/assets/robots/` | 25 | SVG | Legacy (unused) |
| Worlds | `public/assets/worlds/` | 11 | PNG | Done |

## What's Next (TODO)

- [x] LandCompleteModal — celebration when island fully expanded and filled
- [x] Island decorations system — shop tab, placement UX, 20 items across 6 categories
- [x] Marketing website — waitlist landing page with referral system
- [x] Legal pages — Privacy Policy, Terms of Service, Support (website)
- [x] Archipelago system — 6 themed islands with unlock requirements and bonuses
- [x] Island themes — 6 biome-specific themes with unique visuals per archipelago island
- [x] Passive income system — pets generate coins based on rarity/size
- [x] Pity system — bad luck protection for pet rolls
- [x] Daily/weekly challenges — 13 daily + 10 weekly challenge templates
- [x] Coin booster system — temporary multipliers
- [x] Analytics expansion — 8 new analytics components (flow states, personality, predictions, etc.)
- [ ] **Generate final pet pixel art assets** — replace 164 Pillow placeholders with proper pixel art (see `NEXT_AI_PROMPT.md` Task 1)
- [ ] **Generate higher-fidelity decoration sprites** — replace 20 Pillow placeholders (see `NEXT_AI_PROMPT.md` Task 2)
- [ ] **Update onboarding flow** — remove old Star Wizard references, replace with pet/island theme (see `NEXT_AI_PROMPT.md` Task 3)
- [ ] **Verify debug buttons removed** — confirm no debug "Award Pet" button or dev-only UI remains (see `NEXT_AI_PROMPT.md` Task 4)
- [ ] **Sync website assets** — copy regenerated pet/decoration PNGs to `website/public/` (see `NEXT_AI_PROMPT.md` Task 5)
- [ ] Upload screenshots and app icon to App Store Connect
- [ ] Complete App Store Connect IAP setup (see `docs/APP_STORE_CONNECT_IAP_SETUP.txt`)
- [x] Connect waitlist form to real backend (Supabase edge function `waitlist-signup` + `website/src/lib/supabase.ts`)
- [ ] Set up Vercel deployment for website (vercel.json configured, needs `vercel --prod`)
