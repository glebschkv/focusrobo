# BotBlock — Architecture Reference

> Focus timer iOS app with pet collection gamification. Users run focus sessions to earn XP and coins. Each completed session places a random pet on a floating isometric island. Longer sessions = bigger pets (baby/adolescent/adult). Fill an island (100 pets), archive it, start a new one. Built with React + Capacitor, deployed as a native iOS app.

## Core Gameplay Loop

```
Focus session completes → random pet generated (weighted by rarity + player level)
→ pet size based on session length (baby/adolescent/adult)
→ pet placed on floating island using farthest-first spatial algorithm
→ fill island (expands 5×5→20×20) = island complete → archive → new island
```

## Art & Theme Direction

**Pixel art aesthetic** — cute collectible animals on a floating isometric island:

- **Visual style**: Pixel art pets (PNG sprites, 56–84px responsive), front-facing, transparent background
- **Home screen**: `PetLand` component — floating island with panoramic sky (clouds, sun, god rays, mountains, dust motes)
- **Island**: Isometric diamond grass surface (inline SVG) with checkerboard tiles, textured cliff walls (dirt + stone bands), grass overhang bumps
- **Pets**: 20 species across 5 rarities (see Pet Species below)
- **Pet sizes**: Baby (25-45 min), Adolescent (60-90 min), Adult (120+ min) — depth-scaled on island
- **Rarity**: common, uncommon, rare, epic, legendary — with CSS glow/shimmer effects
- **Land themes**: Meadow (default), Beach, Snow, Desert, Night Garden, Sakura (purchasable)
- **Assets**: `public/assets/pets/*.png` (20 species: bunny, cat, chick, crane, deer, dragon, duckling, fox, frog, hamster, hedgehog, mouse, otter, owl, penguin, phoenix, raccoon, sparrow, unicorn, wolf)

## Quick Facts

- **App name**: BotBlock
- **Bundle ID**: `co.botblock.app`
- **App Group**: `group.co.botblock.app`
- **Package name**: `botblock` (in package.json)
- **Storage prefix**: `nomo_` (all localStorage keys)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite (dev on port 8080) |
| Native | Capacitor 7 (iOS primary, Android scaffolded) |
| State | Zustand 5 with `persist` + `subscribeWithSelector` middleware |
| Styling | Tailwind CSS + CSS variables (HSL-based design tokens in `index.css`) |
| UI Library | Radix UI primitives + shadcn/ui components (`src/components/ui/`) |
| Animations | Framer Motion + CSS keyframes |
| Backend | Supabase (auth, database, edge functions) |
| Data Fetching | TanStack React Query |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |

## Scripts

```bash
npm run dev          # Vite dev server on :8080
npm run build        # Production build to dist/
npm run build:dev    # Development build
npm run ios          # Build + copy to iOS project
npm run test         # Vitest watch mode
npm run test:run     # Single test run
npm run test:coverage # Coverage report
npm run test:ui      # Vitest UI
npm run test:e2e     # Playwright end-to-end tests
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
├── vite-env.d.ts              # Vite type declarations
├── pages/
│   ├── Index.tsx              # Main page: auth gate → splash → onboarding → GameUI
│   ├── Auth.tsx               # Login/signup (Apple Sign-In + guest mode)
│   ├── PrivacyPolicy.tsx
│   ├── TermsOfService.tsx
│   └── NotFound.tsx
├── components/
│   ├── PetLand.tsx            # Home screen — floating isometric island with pets
│   ├── IslandSVG.tsx          # Inline SVG island — grass diamond, cliff walls, tile grid, textures
│   ├── IslandPet.tsx          # Single pet on island — positioned, scaled, animated
│   ├── GameUI.tsx             # Tab navigation + status bar + reward modals overlay
│   ├── TabContent.tsx         # Lazy-loaded tab renderer with skeleton fallbacks
│   ├── IOSTabBar.tsx          # Bottom tab bar (iOS-native style)
│   ├── TopStatusBar.tsx       # XP bar, coins, level, streak at top
│   ├── UnifiedFocusTimer.tsx  # Focus timer tab (orchestrates timer sub-components)
│   ├── PetCollectionBook.tsx  # Pet collection catalog + species discovery tracking
│   ├── Shop.tsx               # Shop tab (backgrounds, power-ups, bundles)
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
│   ├── focus-timer/           # Timer sub-components
│   │   ├── index.ts           # Barrel exports
│   │   ├── constants.ts       # Timer constants
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
│   │   ├── TaskIntentionModal.tsx # Pre-session task intention
│   │   ├── backgrounds/       # Timer background themes
│   │   │   ├── index.tsx      # Background component exports
│   │   │   └── ThemeContext.tsx # Background theme context
│   │   └── hooks/             # Timer-specific hooks
│   │       ├── useTimerCore.ts       # Core timer state machine
│   │       ├── useTimerCountdown.ts  # Countdown logic
│   │       ├── useTimerControls.ts   # Play/pause/stop actions
│   │       ├── useTimerLogic.ts      # Timer business logic orchestrator
│   │       ├── useTimerRewards.ts    # Post-session reward calculation
│   │       ├── useTimerPersistence.ts # Timer state persistence
│   │       ├── useTimerAudio.ts      # Timer sound effects
│   │       ├── useBackgroundTheme.ts # Background theme management
│   │       ├── useBreakTransition.ts # Break flow management
│   │       └── useSessionNotes.ts    # Session notes management
│   ├── gamification/          # Challenges/achievements tab
│   │   ├── index.ts           # Barrel exports
│   │   ├── GamificationHub.tsx # Main gamification tab layout
│   │   ├── AchievementUnlockModal.tsx # Achievement unlock celebration
│   │   └── MilestoneCelebration.tsx # Milestone celebration overlay
│   ├── analytics/             # Analytics dashboard (tab)
│   │   ├── index.ts           # Barrel exports
│   │   ├── Analytics.tsx      # Main analytics dashboard
│   │   ├── AnalyticsStatCards.tsx, AnalyticsHeatmap.tsx, AnalyticsWeeklyChart.tsx ...
│   │   ├── AnalyticsFocusScore.tsx, AnalyticsGoalRing.tsx, AnalyticsMilestones.tsx ...
│   │   ├── CollapsibleAnalyticsSection.tsx # Collapsible section wrapper
│   │   └── SimpleBarChart.tsx # Bar chart utility
│   ├── settings/              # Settings sub-components
│   │   ├── SettingsProfile.tsx, SettingsAccount.tsx, SettingsTimer.tsx
│   │   ├── SettingsFocusMode.tsx, SettingsGame.tsx, SettingsSound.tsx
│   │   ├── SettingsAnalytics.tsx, SettingsAppearance.tsx
│   │   ├── SettingsData.tsx   # Data export/delete (GDPR)
│   │   └── SettingsAbout.tsx  # About screen
│   ├── onboarding/
│   │   └── OnboardingFlow.tsx # New user onboarding wizard
│   ├── dev/
│   │   └── PerformanceMonitor.tsx # Development performance monitor
│   ├── shop/                  # Shop sub-components
│   │   ├── styles.ts          # Shop styling utilities
│   │   ├── BundleConfirmDialog.tsx # Bundle purchase confirmation
│   │   ├── PurchaseConfirmDialog.tsx # Purchase confirmation
│   │   ├── ShopPreviewComponents.tsx # Item preview cards
│   │   └── tabs/              # Shop tab views
│   │       ├── BackgroundsTab.tsx # Background themes shop
│   │       ├── FeaturedTab.tsx    # Featured items
│   │       ├── InventoryTab.tsx   # User inventory
│   │       └── PowerUpsTab.tsx    # Power-up items
│   └── ui/                    # shadcn/ui component library
│       ├── button.tsx, card.tsx, dialog.tsx, drawer.tsx, input.tsx ...
│       ├── skeleton-loaders.tsx # Context-aware loading skeletons
│       ├── PixelIcon.tsx      # Pixel art icon component
│       └── (35+ Radix-based primitives)
├── stores/                    # Zustand state management
│   ├── index.ts               # Store exports
│   ├── landStore.ts           # Pet island grid state (current land, completed lands, species catalog)
│   ├── xpStore.ts             # XP, level (max 50), unlocked entities
│   ├── coinStore.ts           # Coin balance, earnings, spending, server sync
│   ├── premiumStore.ts        # Subscription tier management
│   ├── streakStore.ts         # Streak tracking, freezes, milestones
│   ├── focusStore.ts          # Focus mode settings, blocked apps, strict mode
│   ├── navigationStore.ts     # Active tab, modal state (not persisted)
│   ├── shopStore.ts           # Owned items, equipped background
│   ├── collectionStore.ts     # Legacy collection state
│   ├── soundStore.ts          # Sound mixer layers, ambient sounds, volume
│   ├── questStore.ts          # Daily/weekly quests
│   ├── onboardingStore.ts     # Onboarding completion state
│   ├── authStore.ts           # Guest ID, guest mode flag
│   ├── themeStore.ts          # Home background theme
│   └── offlineSyncStore.ts    # Offline action queue for sync
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts             # Supabase auth, guest mode
│   ├── useXPSystem.ts         # XP calculations, level-ups (re-exports from xp/)
│   ├── xp/                    # XP system module
│   │   ├── index.ts           # Barrel exports
│   │   ├── useXPSystem.ts     # Core XP hook
│   │   ├── xpConstants.ts     # XP curve constants
│   │   ├── xpTypes.ts         # XP type definitions
│   │   └── xpUtils.ts         # XP calculation utilities
│   ├── useCoinSystem.ts       # Coin earning, spending, server validation
│   ├── useStreakSystem.ts     # Streak tracking, freeze management
│   ├── useFocusMode.ts        # Focus mode activation, app blocking
│   ├── useStoreKit.ts         # StoreKit 2 IAP (subscriptions, coin packs, bundles)
│   ├── useDeviceActivity.ts   # iOS Screen Time / DeviceActivity integration
│   ├── useQuestSystem.ts      # Daily/weekly quest generation and tracking
│   ├── useAchievementSystem.ts # Achievement unlock logic
│   ├── useAchievementTracking.ts # Event-based achievement progress tracking
│   ├── useMilestoneCelebrations.ts # Milestone detection and celebration UI
│   ├── useDailyLoginRewards.ts # Daily login reward logic
│   ├── useCoinBooster.ts      # Temporary coin boost items
│   ├── useRewardHandlers.ts   # Session completion reward orchestration
│   ├── useSoundMixer.ts       # Ambient sound layering
│   ├── useAmbientSound.ts     # Individual ambient sound playback
│   ├── useSoundEffects.ts     # UI sound effects
│   ├── useClickSound.ts       # Button click sound
│   ├── useHaptics.ts          # iOS haptic feedback
│   ├── useWidgetSync.ts       # iOS widget data synchronization
│   ├── useTimerExpiryGuard.ts # Ensures timer fires even if app backgrounded
│   ├── useBackendAppState.ts  # Fetches user state from Supabase on load
│   ├── useBackendStreaks.ts   # Server-side streak sync
│   ├── useBackendQuests.ts    # Server-side quest sync
│   ├── useSupabaseData.ts     # Generic Supabase data fetching
│   ├── useShop.ts             # Shop purchase logic
│   ├── useSettings.ts         # App settings management
│   ├── useOnboarding.ts       # Onboarding flow logic
│   ├── usePremiumStatus.ts    # Premium tier queries
│   ├── useAnalytics.ts        # Analytics event tracking
│   ├── useAnimatedCounter.ts  # Animated number transitions
│   ├── useAppStateTracking.ts # App foreground/background tracking
│   ├── useNotifications.ts    # Push notification management
│   ├── useNativePluginStatus.ts # Native plugin availability
│   ├── useOfflineSyncManager.ts # Offline sync queue management
│   ├── usePerformanceMonitor.ts # Performance metrics logging
│   ├── useReducedMotion.ts    # Reduced motion preference detection
│   ├── useServiceWorker.ts    # Service worker registration
│   └── use-mobile.tsx         # Mobile device detection
├── data/
│   ├── PetDatabase.ts         # Pet species definitions, rarity weights, growth sizes, random roll
│   ├── islandPositions.ts     # 100 island slot positions, isometric projection, depth scaling
│   ├── ShopData.ts            # Shop items, backgrounds, bundles
│   ├── GamificationData.ts    # Milestone/achievement definitions
│   ├── AmbientSoundsData.ts   # Sound library catalog
│   ├── SpecialAnimations.ts   # Special celebration animations
│   └── LazySpecialAnimations.ts # Lazy-loaded animation variants
├── types/                     # TypeScript type definitions
│   ├── index.ts               # Core app types
│   ├── achievements.ts        # Achievement types
│   ├── analytics.ts           # Analytics event types
│   ├── app.ts                 # App-level types
│   ├── browser-utils.ts       # Browser utility types
│   ├── gamification.ts        # Gamification types
│   ├── plugins.ts             # Native plugin types
│   ├── quest-system.ts        # Quest types
│   ├── rewards.ts             # Reward types
│   ├── shop.ts                # Shop types
│   ├── streak-system.ts       # Streak types
│   ├── supabase-models.ts     # Supabase DB model types
│   ├── theme.ts               # Theme types
│   └── xp-system.ts           # XP system types
├── lib/                       # Utilities
│   ├── constants.ts           # ALL game constants (XP, coins, streaks, etc.)
│   ├── validation.ts          # Input validation helpers
│   ├── storage-validation.ts  # Zod schemas for persisted state
│   ├── storage-keys.ts        # localStorage key constants
│   ├── validated-zustand-storage.ts # Safe Zustand storage adapter with Zod
│   ├── logger.ts              # Structured logging
│   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
│   ├── security.ts            # Security utilities
│   ├── accessibility.ts       # Accessibility helpers
│   ├── apiUtils.ts            # API request utilities
│   ├── debounce.ts            # Debounce utility
│   ├── errorHandling.ts       # Error handling utilities
│   ├── errorReporting.ts      # Error reporting service
│   ├── iosOptimizations.ts    # iOS-specific performance optimizations
│   ├── memoization.ts         # Memoization utilities
│   ├── minimalSentry.ts       # Lightweight error tracking
│   └── spriteAnimationManager.ts # Sprite animation frame management
├── styles/                    # Modular CSS
│   ├── pet-land.css           # Island sky, clouds, god rays, mountains, parallax, pets, tooltips, progress bar, zoom
│   ├── animations.css         # Shared keyframe animations
│   ├── base.css               # Base/reset styles
│   ├── navigation.css         # Tab bar, navigation styles
│   ├── timer-controls.css     # Timer button styles
│   ├── timer-backgrounds.css  # Timer background themes
│   ├── collection.css         # Collection grid styles
│   ├── gamification.css       # Achievement/quest styles
│   ├── shop.css               # Shop layout styles
│   ├── retro-theme.css        # Retro/pixel art theme tokens
│   ├── retro-elements.css     # Retro UI element styles
│   └── utilities.css          # CSS utility classes
├── contexts/                  # React contexts
│   ├── AppContext.tsx          # Global app state context
│   ├── AppStateContext.tsx     # App lifecycle state (foreground/background)
│   ├── NativePluginContext.tsx # Native plugin availability context
│   └── OfflineContext.tsx      # Offline/online status context
├── plugins/                   # Capacitor native plugins
│   ├── device-activity/       # iOS Screen Time / DeviceActivity framework
│   │   ├── index.ts           # Plugin registration
│   │   ├── definitions.ts     # TypeScript interface definitions
│   │   └── web.ts             # Web fallback (no-op)
│   ├── store-kit/             # StoreKit 2 IAP
│   │   ├── index.ts
│   │   └── web.ts
│   ├── app-review/            # App Store review prompt
│   │   ├── index.ts
│   │   └── web.ts
│   └── widget-data/           # iOS widget data bridge
│       └── index.ts
├── services/                  # Business logic services
│   ├── achievementService.ts  # Achievement processing service
│   └── achievement/           # Achievement sub-modules
│       ├── index.ts, achievementTypes.ts, achievementConstants.ts
│       ├── achievementDefinitions.ts  # Achievement definitions
│       ├── achievementProgress.ts     # Progress tracking
│       ├── achievementStorage.ts      # Persistence
│       └── achievementUtils.ts        # Utilities
├── test/                      # Test files (mirrors src/ structure)
│   ├── setup.ts               # Test setup (Vitest)
│   ├── components/            # Component tests
│   ├── hooks/                 # Hook tests
│   ├── stores/                # Store tests
│   ├── lib/                   # Utility tests
│   ├── services/              # Service tests
│   ├── contexts/              # Context tests
│   ├── database/              # Database tests
│   ├── integration/           # Integration tests
│   ├── e2e/                   # End-to-end tests
│   └── utils/                 # Test utilities
└── integrations/
    └── supabase/              # Supabase client + generated types
```

## App Flow

1. `App.tsx` — wraps everything in ErrorBoundary → QueryClientProvider → NativePluginProvider → OfflineProvider → TooltipProvider → BrowserRouter
2. Routes: `/` (Index), `/auth`, `/privacy`, `/terms`, `*` (NotFound)
3. `Index.tsx`:
   - Checks auth → redirects to `/auth` if not authenticated
   - Hides native + HTML splash screens once auth resolves
   - Shows `OnboardingFlow` if `!hasCompletedOnboarding`
   - Renders **GameUI** (full-screen overlay)
4. **GameUI** manages tab state and renders:
   - `TopStatusBar` — XP bar, level, coins, streak (home tab only)
   - `TabContent` — renders active tab (PetLand for home, lazy-loads others)
   - `IOSTabBar` — bottom navigation
   - `RewardModals` — XP/coin/milestone/daily-login reward popups
5. **Tabs**: home (PetLand), timer, collection (PetCollectionBook), challenges, shop, settings

## Stores (Zustand)

All stores use `zustand/persist` with validated localStorage via `createValidatedStorage()` and Zod schemas. Storage keys are prefixed with `nomo_`.

| Store | Key | Purpose |
|-------|-----|---------|
| `landStore` | `nomo_land_data` | **Current island grid (100 cells), grid expansion tier, completed lands, species catalog, pending pet** |
| `xpStore` | `nomo_xp_system` | XP, level (max 50), unlocked entities |
| `coinStore` | `nomo_coin_system` | Coin balance, totalEarned, totalSpent, server sync state |
| `premiumStore` | `nomo_premium` | Subscription tier (free/premium/premium_plus/lifetime) |
| `streakStore` | `nomo_streak_data` | Current streak, longest streak, streak freezes (max 3), total sessions |
| `focusStore` | `nomo_focus_mode` | Focus mode settings, blocked apps, strict mode |
| `navigationStore` | (not persisted) | Active tab, modal state, navigation history |
| `shopStore` | (persisted) | Owned items, equipped background |
| `collectionStore` | (persisted) | Legacy collection state |
| `soundStore` | (persisted) | Sound mixer layers, ambient sounds, volume |
| `questStore` | (persisted) | Daily/weekly quests |
| `onboardingStore` | (persisted) | Onboarding completion state |
| `authStore` | (persisted) | Guest ID, guest mode flag |
| `themeStore` | (persisted) | Home background theme |
| `offlineSyncStore` | (persisted) | Offline action queue for background sync |

## Pet Collection System

### Pet Species (20 total)

| Rarity | Species | Unlock Level |
|--------|---------|-------------|
| Common (8) | Bunny, Chick, Frog, Hamster, Duckling, Hedgehog, Mouse, Sparrow | 0–14 |
| Uncommon (5) | Fox, Cat, Penguin, Raccoon, Otter | 4–22 |
| Rare (4) | Deer, Owl, Wolf, Crane | 9–32 |
| Epic (2) | Dragon, Phoenix | 20, 35 |
| Legendary (1) | Unicorn | 40 |

**Unlock level details**: Bunny/Chick (0), Frog (2), Hamster (3), Fox (4), Duckling (5), Hedgehog (7), Cat (8), Deer (9), Mouse (10), Penguin (12), Sparrow (14), Owl (16), Raccoon (18), Dragon (20), Otter (22), Wolf (25), Crane (32), Phoenix (35), Unicorn (40).

### Growth Sizes (3 tiers)
| Size | Session Duration | Scale Factor |
|------|-----------------|-------------|
| Baby | 25-45 min | 0.65 |
| Adolescent | 60-90 min | 0.82 |
| Adult | 120+ min | 1.0 |

### Rarity & Drop Weights
| Rarity | Drop Weight | Glow Effect | Glow Color |
|--------|------------|-------------|------------|
| Common | 45% | None | — |
| Uncommon | 28% | White drop-shadow (3px) | `rgba(255, 255, 255, 0.6)` |
| Rare | 17% | Blue drop-shadow (4px) | `rgba(59, 130, 246, 0.7)` |
| Epic | 8% | Purple drop-shadow (5px) | `rgba(168, 85, 247, 0.7)` |
| Legendary | 2% | Gold drop-shadow (6px) + shimmer animation | `rgba(234, 179, 8, 0.8)` |

### Floating Island System

The home screen renders a **floating isometric island** (not a flat grid). Key concepts:

**Island Visual Structure** (`IslandSVG.tsx` + `pet-land.css`):
- **Sky**: Smooth 4-stop gradient (`#7EC8E3` → `#A5D8EF` → `#D0EAF5` → `#EEF4F0`) with animated sun, god rays, 5 volumetric clouds, distant mountain/hill/treeline silhouettes, warm horizon haze, dust motes, and sparkles
- **Island wrapper**: Floating bob animation (4s, ±6px vertical)
- **Island container**: Multi-layer parallax tilt (ref-based, no React re-renders) — sky, island, and pets layers shift at different speeds on drag
- **Island SVG** (`IslandSVG.tsx`): Inline SVG (viewBox 420×258) with:
  - **Grass diamond**: Isometric diamond shape (vertices: TOP 210,0 / RIGHT 414,105 / BOTTOM 210,210 / LEFT 6,105) with checkerboard tile grid (10×10), grass texture patches, sun dapples, dirt spots
  - **Cliff walls**: Two parallelogram cliff faces (left + right) extending 42px below grass edge, with dirt band, horizontal strata, stone blocks with mortar lines, individual stone shading
  - **Grass overhang**: Organic bumpy edge along cliff tops simulating grass blades hanging over
  - **Sharp cliff corners**: No rounding — clean parallelogram geometry
- **Shadow**: Soft radial shadow below the floating island
- **Pinch-to-zoom**: Range 0.8×–2.0×, supports two-finger pinch, mouse wheel, and double-tap toggle (1.0↔1.5)

**Pet Positioning** (`islandPositions.ts`):
- 100 positions computed from 10×10 grid via **bilinear interpolation on diamond vertices**
- Uses the exact same diamond vertices (TOP, RIGHT, BOTTOM, LEFT) and `diamondPt()` function as `IslandSVG.tsx` — pets align precisely with tile centers
- Cell centers: `(row+0.5)/10, (col+0.5)/10` normalized, then mapped to SVG coords and converted to container percentages
- No jitter — exact centering on each tile
- Pet CSS transform: `translate(-50%, -60%)` positions sprite so feet rest on tile

**Depth System**:
- **Depth scale**: Back of island = 0.85, front = 1.0 (based on isometric row+col)
- **Z-index**: Range 10–28 based on `row + col` for proper layering
- **Final pet scale** = growth scale × depth scale (e.g., baby at back = 0.65 × 0.85 = 0.553)

**Smart Placement Algorithm** (`landStore.ts`):
- First 2 pets placed randomly
- After that: **farthest-first insertion** — picks empty cell with maximum minimum distance to any placed pet
- Random jitter (±0.5–1.0 distance) breaks ties and prevents predictable patterns
- Creates organic, even distribution instead of clustering

**Pet Rendering** (`IslandPet.tsx`):
- Sprite size: 56px base (responsive: 62px@375, 68px@390, 74px@420, 84px@768)
- Image rendering: `pixelated` / `crisp-edges`
- Bob animation: 3s, ±2px, staggered delay per pet `(index % 11) * 0.27s`, per-pet offset variation ±0.5px
- Pop-in animation for new pets: 0.5s bounce (scale 0→1.15→1.0)
- Tap to show tooltip card (name, rarity badge, size, session duration) — tooltip flips below for pets near top, shifts horizontally for edge pets
- Haptic feedback on new pet placement and tap

**Land State** (`landStore.ts`):
```typescript
interface LandCell {
  petId: string;           // Species ID (e.g., "bunny")
  size: 'baby' | 'adolescent' | 'adult';
  sessionMinutes: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  timestamp: number;
}

// Key constants
LAND_SIZE = 400              // Max 20×20 grid
GRID_SIZE = 20               // Underlying grid dimension
LAND_COMPLETE_BONUS_COINS = 500
MIN_GRID_TIER = 5            // Island starts as centered 5×5
MAX_GRID_TIER = 20           // Fully expanded 20×20
EXPANSION_TIERS = [5, 6, 7, 8, 9, 10, 12, 14, 17, 20]
```

**Island Expansion** (Forest-style progressive growth):
- Island starts as a centered **5×5** region (25 cells) within the 20×20 grid
- When all available cells are filled, auto-expands to next tier: **5→6→7→8→9→10→12→14→17→20**
- **Locked tiles** render as earthy/brown; **unlocked tiles** are the bright green checkerboard
- Grid size stored per-land as `gridSize` (5–20); migrates old 10×10 data to 20×20 on rehydration
- Expansion tiers: 5×5(25) → 6×6(36) → ... → 10×10(100) → 12×12(144) → 14×14(196) → 17×17(289) → 20×20(400)
- Each tier uses centered rows/cols: `offset = floor((20 - size) / 2)`
- Old 100-cell arrays auto-migrate to 400-cell via `migrateCells()` (centered at offset 5)

**Actions**:
- `generateRandomPet(sessionMinutes, playerLevel)` — rolls random pet from unlocked pool
- `placePendingPet()` — places pet using farthest-first algorithm, auto-expands tier if full, auto-archives full land
- `startNewLand()` — manually start new island
- `getAvailableCells()` — returns Set of unlocked cell indices for current grid size
- `isTierFull()` — check if all available cells in current tier are filled
- `getFilledCount()` / `isLandComplete()` — query methods

## Game Systems

### XP & Leveling
- **Max level**: 50
- **XP per minute of focus**: 1.2 base
- **Level formula**: `15 * 1.15^(level-1)` XP per level, or thresholds table for levels 1-20, then 700 XP/level after 20
- **Streak bonus**: +3% per day, capped at 60% (max multiplier 1.6x at 20 days)
- **Premium multipliers**: free=1x, premium=2x, premium_plus=3x, lifetime=4x
- **Focus bonuses**: Perfect focus (0 blocked attempts) = +25% XP + 50 coins; Good focus (1-2 attempts) = +10% XP + 25 coins
- **Level-ups unlock new pet species** in the random drop pool

### Coins
- **Base rate**: 2 coins/minute of focus
- **Session completion bonuses**: 25min→+15, 30→+20, 45→+35, 60→+50, 90→+80, 120→+120, 180→+180
- **Random bonus**: 5% chance mega (2.5x), 10% super lucky (1.75x), 20% lucky (1.5x)
- **Daily login**: 20 coins + 5/streak day (cap 100)
- **Land completion**: 500 coin bonus
- **Server-validated**: via `validate-coins` edge function. Local store is cache.

### Streaks
- Streak rewards at milestones: 3, 7, 14, 30, 100 days
- Streak freezes: max 3, cost 100 coins each
- XP bonuses: 50 → 100 → 200 → 500 → 1500 at milestones

### Premium Tiers
| Tier | Coin Multi | XP Multi | Streak Freezes/mo | Sound Slots |
|------|-----------|----------|-------------------|-------------|
| Free | 1x | 1x | 0 | 1 |
| Premium | 2x | 2x | 2 | 2 |
| Premium Plus | 3x | 3x | 5 | 3 |
| Lifetime | 4x | 4x | 7 | 3 |

### Focus Mode
- Blocks configurable apps (Instagram, TikTok, Twitter, etc.) via iOS DeviceActivity/Screen Time
- Strict mode, notification blocking, emergency bypass with cooldown
- Ambient sound mixer during focus sessions
- Break transitions between Pomodoro sessions
- Task intention + session notes modals

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useXPSystem` | XP calculations, level-ups. Re-exports from `./xp/` module |
| `useCoinSystem` | Coin earning, spending, server validation wrapper around coinStore |
| `useStreakSystem` | Streak tracking, freeze management |
| `useAuth` | Supabase auth, guest mode |
| `useFocusMode` | Focus mode activation, app blocking coordination |
| `useStoreKit` | StoreKit 2 IAP (subscriptions, coin packs, bundles) |
| `useDeviceActivity` | iOS Screen Time / DeviceActivity integration |
| `useQuestSystem` | Daily/weekly quest generation and tracking |
| `useAchievementSystem` | Achievement unlock logic |
| `useAchievementTracking` | Event-based achievement progress tracking |
| `useMilestoneCelebrations` | Milestone detection and celebration UI |
| `useDailyLoginRewards` | Daily login reward logic |
| `useCoinBooster` | Temporary coin boost items |
| `useRewardHandlers` | Session completion reward orchestration |
| `useSoundMixer` | Ambient sound layering |
| `useHaptics` | iOS haptic feedback |
| `useWidgetSync` | iOS widget data synchronization |
| `useTimerExpiryGuard` | Ensures timer fires even if app backgrounded |
| `useBackendAppState` | Fetches user state from Supabase on load |
| `useBackendStreaks` | Server-side streak sync |
| `useBackendQuests` | Server-side quest sync |
| `useShop` | Shop purchase logic |
| `useSettings` | App settings management |
| `useReducedMotion` | Respects `prefers-reduced-motion` |
| `usePerformanceMonitor` | Performance metrics logging |
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

All plugins have web fallbacks (no-op) so the app runs in browsers during development.

## Supabase Backend

### Edge Functions (`supabase/functions/`)
| Function | Purpose |
|----------|---------|
| `calculate-xp` | Server-side XP calculation and validation |
| `validate-coins` | Server-authoritative coin balance verification |
| `validate-receipt` | StoreKit receipt validation for IAP |
| `process-achievements` | Achievement unlock processing |
| `delete-account` | Account deletion (GDPR compliance) |
| `_shared/cors.ts` | Shared CORS configuration |

### Auth
- Supabase Auth with Apple Sign-In (`@capacitor-community/apple-sign-in`)
- Guest mode supported (local-only, data stored with guest UUID)

## Design System

The current design uses the **Atelier white theme** with **pixel art**:

- **Background**: `#FAFAF9` (warm white/stone) for non-home tabs
- **Home screen**: Floating island on gradient sky (`#6BB8E0` → `#F0F7E4`)
- **Theme color**: `#FAFAF9` for iOS status bar
- **CSS Variables**: HSL-based design tokens in `src/index.css`, consumed via Tailwind
- **Component library**: shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion for page transitions + CSS keyframes for island/pet animations
- **Fonts**: Inter (via `@fontsource/inter`)
- **Responsive**: Pet sprites scale 56px → 62px → 68px → 74px → 84px at breakpoints (375px, 390px, 420px, 768px)
- **Reduced motion**: All animations disabled if `prefers-reduced-motion: reduce`

### CSS Architecture (`src/styles/`)
- `pet-land.css` — Island sky, clouds, god rays, mountains, parallax tilt, pets, tooltips, progress bar, zoom
- `animations.css` — Shared keyframe animations
- `base.css` — Base/reset styles
- `navigation.css` — Tab bar styles
- `timer-controls.css` / `timer-backgrounds.css` — Timer UI styles
- `collection.css` / `gamification.css` / `shop.css` — Feature-specific styles
- `retro-theme.css` / `retro-elements.css` — Pixel art theme tokens and elements
- `utilities.css` — CSS utility classes

### CSS Class Naming
- BEM-style: `.pet-land__sky`, `.island-pet__sprite`, `.island-pet--legendary`
- Modifier classes for rarity: `.island-pet--uncommon`, `--rare`, `--epic`, `--legendary`
- State classes: `.island-pet--new` (pop animation)

## Build & Deploy

1. `npm run build` — Vite builds to `dist/`
2. `npm run cap:copy:ios` — copies `dist/` into iOS project + runs `scripts/patch-ios-config.cjs`
3. Open `ios/App/App.xcworkspace` in Xcode
4. Build/archive from Xcode for TestFlight/App Store

## Important Patterns

- **Validated persistence**: All Zustand stores use `createValidatedStorage()` with Zod schemas — invalid persisted data falls back to defaults instead of crashing.
- **Lazy loading**: All tab content and heavy components are lazy-loaded with `React.lazy()` and context-aware skeleton fallbacks.
- **Error boundaries**: Three levels — `ErrorBoundary` (app), `PageErrorBoundary` (page), `FeatureErrorBoundary` (feature). Errors are isolated, not app-crashing.
- **Server-authoritative coins**: Coin balance changes are cached locally but validated via the `validate-coins` edge function.
- **Event-based achievements**: `useAchievementTracking` uses a custom event dispatch system for cross-component achievement progress.
- **Offline support**: `offlineSyncStore` queues actions when offline, `useOfflineSyncManager` processes them when connectivity returns. `OfflineContext` tracks online/offline state.
- **Native plugin fallbacks**: All Capacitor plugins have web fallbacks so the app runs in browsers. `NativePluginContext` tracks availability.
- **Isometric depth**: Pets at the back of the island render smaller (0.85×) and with lower z-index, creating depth perspective.
- **Parallax tilt**: Touch-drag shifts sky/island/pets layers at different speeds (0.15/0.5/0.85) using ref-based DOM updates — zero React re-renders during interaction. Spring physics for momentum and snap-back.
- **SVG-aligned pet positions**: `islandPositions.ts` and `IslandSVG.tsx` share identical diamond vertices and bilinear interpolation math so pets sit exactly on their tile centers.
- **Legacy storage migration**: Stores check for old localStorage keys (e.g., `petIsland_*`, `botblock_*`) and migrate to new `nomo_*` keys on rehydration.

## Path Aliases

`@/` maps to `src/` (configured in vite.config.ts and tsconfig.json).

## Timer Durations

Available focus session presets: **25, 30, 45, 60, 90, 120, 180 minutes**.
Minimum 25 minutes for XP rewards. Pomodoro-style: 4 sessions then long break (15 min).

## StoreKit Product IDs

```
Subscriptions:
  co.botblock.app.premium.monthly
  co.botblock.app.premium.yearly
  co.botblock.app.premiumplus.monthly
  co.botblock.app.premiumplus.yearly
  co.botblock.app.lifetime

Coin Packs:
  co.botblock.app.coins.value / premium / mega / ultra / legendary

Bundles:
  co.botblock.app.bundle.welcome / starter / collector / ultimate
```

## What's Next (TODO)

- [ ] LandCompleteModal — celebration when 100th cell filled (currently basic overlay)
- [ ] Wire pet generation into timer completion flow (`useTimerRewards` → `landStore`)
- [ ] Update shop for land themes, rarity boosts, species picks
- [ ] Generate final pet pixel art assets (current ones are placeholders)
- [ ] Update onboarding flow for pet/island theme
- [ ] Remove debug "Award Pet" button from PetLand before production
