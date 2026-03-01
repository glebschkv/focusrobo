# BotBlock — Architecture Reference

> Focus timer iOS app with robot-collecting gamification. Users run focus sessions to earn XP and coins, unlock collectible robots across themed zones, and progress through a leveling system. Built with React + Capacitor, deployed as a native iOS app.

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
| Animations | Framer Motion |
| 3D | Three.js + React Three Fiber (hangar scene) |
| Backend | Supabase (auth, database, edge functions) |
| Data Fetching | TanStack React Query |
| Routing | React Router DOM v6 |
| Forms | React Hook Form + Zod validation |
| Icons | Lucide React |

## Scripts

```bash
npm run dev          # Vite dev server on :8080
npm run build        # Production build to dist/
npm run ios          # Build + copy to iOS project
npm run test         # Vitest watch mode
npm run test:run     # Single test run
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run analyze      # Bundle visualization (treemap)
```

## Project Structure

```
src/
├── App.tsx                    # Root: providers, router, lazy page loading
├── pages/
│   ├── Index.tsx              # Main page: auth gate → onboarding → MechHangar + GameUI
│   ├── Auth.tsx               # Login/signup
│   ├── PrivacyPolicy.tsx
│   ├── TermsOfService.tsx
│   └── NotFound.tsx
├── components/
│   ├── hangar/                # Home screen — "Mech Hangar" robot gallery
│   │   ├── MechHangar.tsx     # Main home screen component
│   │   ├── HangarBackground.tsx
│   │   ├── ChargingBay.tsx    # Main featured robot display
│   │   ├── DisplayBay.tsx     # Secondary robot slots (up to 3)
│   │   ├── ChargeBar.tsx      # Focus progress bar
│   │   └── HangarStats.tsx    # Level, streak, coins display
│   ├── GameUI.tsx             # Tab navigation + status bar + reward modals overlay
│   ├── TabContent.tsx         # Lazy-loaded tab renderer with skeleton fallbacks
│   ├── IOSTabBar.tsx          # Bottom tab bar (iOS-native style)
│   ├── TopStatusBar.tsx       # XP bar, coins, level at top
│   ├── UnifiedFocusTimer.tsx  # Focus timer tab
│   ├── BotCollectionGrid.tsx  # Collection tab — robot gallery
│   ├── Shop.tsx               # Shop tab
│   ├── Settings.tsx           # Settings tab
│   ├── focus-timer/           # Timer sub-components
│   │   ├── TimerView.tsx      # Timer circle display
│   │   ├── TimerControls.tsx  # Start/pause/stop buttons
│   │   ├── TimerPresetGrid.tsx # Duration presets (25/30/45/60/90/120/180 min)
│   │   ├── StatsView.tsx      # Session statistics
│   │   ├── FocusLockScreen.tsx # Lock screen during focus
│   │   ├── AppBlockingSection.tsx
│   │   ├── AmbientSoundPicker.tsx
│   │   └── BackgroundThemeSwitcher.tsx
│   ├── gamification/          # Challenges/achievements tab
│   │   ├── GamificationHub.tsx
│   │   ├── AchievementUnlockModal.tsx
│   │   └── MilestoneCelebration.tsx
│   ├── onboarding/
│   │   └── OnboardingFlow.tsx
│   ├── shop/                  # Shop sub-components
│   ├── collection/            # Collection sub-components
│   ├── settings/              # Settings sub-components
│   └── ui/                    # shadcn/ui component library (button, card, dialog, etc.)
├── stores/                    # Zustand state management (see Stores section)
├── hooks/                     # Custom React hooks (see Hooks section)
├── data/                      # Static game data
│   ├── RobotDatabase.ts       # All robots, zones, rarities
│   ├── ShopData.ts            # Shop items, backgrounds, bundles
│   ├── GamificationData.ts    # Milestone definitions
│   ├── AmbientSoundsData.ts   # Sound library
│   └── AnimalDatabase.ts      # Legacy alias → RobotDatabase
├── types/                     # TypeScript type definitions
├── lib/                       # Utilities
│   ├── constants.ts           # ALL game constants (XP, coins, streaks, etc.)
│   ├── validation.ts          # Input validation helpers
│   ├── storage-validation.ts  # Zod schemas for persisted state
│   ├── validated-zustand-storage.ts # Safe Zustand storage adapter
│   ├── logger.ts              # Structured logging
│   ├── utils.ts               # cn() helper (clsx + tailwind-merge)
│   └── security.ts            # Security utilities
├── contexts/                  # React contexts
│   ├── NativePluginContext.tsx # Native plugin availability
│   ├── OfflineContext.tsx      # Offline state detection
│   ├── AppContext.tsx
│   └── AppStateContext.tsx
├── plugins/                   # Capacitor native plugins
│   ├── device-activity/       # iOS Screen Time / DeviceActivity framework
│   ├── store-kit/             # StoreKit 2 IAP
│   ├── app-review/            # App Store review prompt
│   └── widget-data/           # iOS widget data bridge
└── integrations/
    └── supabase/              # Supabase client + generated types
```

## App Flow

1. `App.tsx` — wraps everything in ErrorBoundary, QueryClient, NativePluginProvider, OfflineProvider
2. Routes: `/` (Index), `/auth`, `/privacy`, `/terms`
3. `Index.tsx` — checks auth → shows onboarding if new → renders **MechHangar** (home) + **GameUI** (overlay)
4. **GameUI** manages tab state and renders:
   - `TopStatusBar` — XP bar, level, coins
   - `TabContent` — lazy-loads the active tab component
   - `IOSTabBar` — bottom navigation
   - `RewardModals` — XP/coin/milestone reward popups
5. **Tabs**: home (MechHangar), timer, collection, challenges, shop, settings

## Stores (Zustand)

All stores use `zustand/persist` with validated localStorage via `createValidatedStorage()` and Zod schemas. Storage keys are prefixed with `nomo_`.

| Store | Key | Purpose |
|-------|-----|---------|
| `xpStore` | `nomo_xp_system` | XP, level (max 50), unlocked robots, current zone, available zones |
| `coinStore` | `nomo_coin_system` | Coin balance, totalEarned, totalSpent, server sync state |
| `premiumStore` | `nomo_premium` | Subscription tier (free/premium/premium_plus/lifetime) |
| `streakStore` | `nomo_streak_data` | Current streak, longest streak, streak freezes (max 3), total sessions |
| `focusStore` | `nomo_focus_mode` | Focus mode settings, blocked apps, strict mode |
| `navigationStore` | (not persisted) | Active tab, modal state, navigation history |
| `shopStore` | (persisted) | Owned characters, backgrounds, equipped background |
| `collectionStore` | (persisted) | Active home bots, favorites |
| `soundStore` | (persisted) | Sound mixer layers, ambient sounds, volume |
| `questStore` | (persisted) | Daily/weekly quests |
| `onboardingStore` | (persisted) | Onboarding completion state |
| `authStore` | (persisted) | Guest ID, guest mode flag |
| `themeStore` | (persisted) | Home background theme |
| `offlineSyncStore` | (persisted) | Offline operation queue |

## Game Systems

### XP & Leveling
- **Max level**: 50
- **XP per minute of focus**: 1.2 base
- **Level formula**: `15 * 1.15^(level-1)` XP per level (in xpStore), or use thresholds table in constants.ts for levels 1-20, then 700 XP/level after 20
- **Streak bonus**: +3% per day, capped at 60% (max multiplier 1.6x at 20 days)
- **Premium multipliers**: free=1x, premium=2x, premium_plus=3x, lifetime=4x
- **Focus bonuses**: Perfect focus (0 blocked attempts) = +25% XP + 50 coins; Good focus (1-2 attempts) = +10% XP + 25 coins

### Coins
- **Base rate**: 2 coins/minute of focus
- **Session completion bonuses**: 25min→+15, 30→+20, 45→+35, 60→+50, 90→+80, 120→+120, 180→+180
- **Random bonus**: 5% chance mega (2.5x), 10% super lucky (1.75x), 20% lucky (1.5x)
- **Daily login**: 20 coins + 5/streak day (cap 100)
- **Server-validated**: via `validate-coins` edge function. Local store is cache.

### Robots & Zones
- **Rarities**: common, rare, epic, legendary
- **Zones** (unlock by level):
  - Assembly Line (level 0) — Bolt Bot, Gear Pup, Rivet, Spark Welder
  - Workshop (level 5) — Wrench Bot, Cog Roller, Chrome Cat, Piston, Plasma Pup, Iron Scholar
  - Stealth Lab (level 9) — Shadow Drone, Neon Phantom, Cipher, Stealth Owl
  - Biotech Zone (level 13) — Moss Mech, Spore Bot, Vine Walker
  - Solar Fields (level 19) — Sun Charger, Prism Bot, Nova
  - Cyber District (level 24) — Neon Sentinel, Quantum Core, Omega Prime, Focus Titan
- **Shop exclusives**: purchasable with coins (e.g., Turbo Tank, Plasma Pup, Iron Scholar, Stealth Owl, Focus Titan)
- **Study hours robots**: unlock after specific focus time thresholds
- Each robot has: id, name, icon, rarity, unlockLevel, description, abilities[], zone, imageConfig (imagePath, glowColor)

### Streaks
- Streak rewards at milestones: 3, 7, 14, 30, 100 days
- Streak freezes: max 3, cost 100 coins each
- XP bonuses: 50 → 100 → 200 → 500 → 1500 at milestones

### Achievements & Milestones
- Milestone types: level, streak, sessions, focus_hours, collection
- Celebration types: confetti, stars, fireworks, rainbow
- Achievement categories: focus sessions, total minutes, streak days, bots collected, coins earned

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

## Key Hooks

| Hook | Purpose |
|------|---------|
| `useXPSystem` | XP calculations, level-ups, robot unlocks. Re-exports from `./xp/` module |
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
| `useBondSystem` | Robot bond/friendship leveling |
| `useSoundMixer` | Ambient sound layering |
| `useHaptics` | iOS haptic feedback |
| `useWidgetSync` | iOS widget data synchronization |
| `useTimerExpiryGuard` | Ensures timer fires even if app backgrounded |
| `useBackendAppState` | Fetches user state from Supabase on load |
| `useBackendStreaks` | Server-side streak sync |
| `useBackendQuests` | Server-side quest sync |
| `useOfflineSyncManager` | Queues operations when offline, syncs on reconnect |
| `useOnboarding` | Onboarding flow state |
| `usePerformanceMonitor` | Performance tracking |
| `useReducedMotion` | Respects prefers-reduced-motion |
| `useAnalytics` | Event analytics |
| `useNotifications` | Push/local notification management |
| `usePremiumStatus` | Premium tier checks |
| `useShop` | Shop purchase logic |
| `useCollection` | Collection management |
| `useSettings` | User settings |

## Native Plugins (Capacitor)

| Plugin | Path | Purpose |
|--------|------|---------|
| `DeviceActivity` | `src/plugins/device-activity/` | iOS Screen Time framework for app blocking |
| `StoreKit` | `src/plugins/store-kit/` | StoreKit 2 for IAP (subscriptions + consumables) |
| `AppReview` | `src/plugins/app-review/` | SKStoreReviewController prompts |
| `WidgetData` | `src/plugins/widget-data/` | Bridge data to iOS home screen widgets |

## Supabase Backend

### Edge Functions (`supabase/functions/`)
| Function | Purpose |
|----------|---------|
| `calculate-xp` | Server-side XP calculation and validation |
| `validate-coins` | Server-authoritative coin balance verification |
| `validate-receipt` | StoreKit receipt validation for IAP |
| `process-achievements` | Achievement unlock processing |
| `delete-account` | Account deletion (GDPR compliance) |
| `_shared/` | Shared utilities across functions |

### Auth
- Supabase Auth with Apple Sign-In (`@capacitor-community/apple-sign-in`)
- Guest mode supported (local-only, data stored with guest UUID)

## Design System — "Atelier" Theme

The current design language is **"Atelier" — a white surrealist gallery aesthetic**:

- **Background**: `#FAFAF9` (warm white/stone)
- **Theme color**: `#FAFAF9` for iOS status bar
- **CSS Variables**: HSL-based design tokens in `src/index.css`, consumed via Tailwind (`hsl(var(--primary))`)
- **Component library**: shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion for page transitions, reward celebrations
- **3D**: React Three Fiber for hangar scene elements
- **Fonts**: Inter (via `@fontsource/inter`)

## Build & Deploy

1. `npm run build` — Vite builds to `dist/`
2. `npm run cap:copy:ios` — copies `dist/` into iOS project + runs `scripts/patch-ios-config.cjs`
3. Open `ios/App/App.xcworkspace` in Xcode
4. Build/archive from Xcode for TestFlight/App Store

## Important Patterns

- **Backward compatibility aliases**: The app was renamed from animals/pets/biomes to robots/bots/zones. Many deprecated aliases exist (e.g., `AnimalData = RobotData`, `BiomeData = ZoneData`, `ANIMAL_DATABASE = ROBOT_DATABASE`). Use the new names.
- **Legacy storage migration**: Stores check for old localStorage keys (e.g., `petIsland_*`, `botblock_*`) and migrate to new `nomo_*` keys on rehydration.
- **Validated persistence**: All Zustand stores use `createValidatedStorage()` with Zod schemas — invalid persisted data falls back to defaults instead of crashing.
- **Lazy loading**: All tab content and heavy components are lazy-loaded with `React.lazy()` and context-aware skeleton fallbacks.
- **Error boundaries**: Every feature area has its own `FeatureErrorBoundary` wrapper — errors are isolated, not app-crashing.
- **Server-authoritative coins**: Coin balance changes are cached locally but validated via the `validate-coins` edge function. Server state is authoritative.
- **Event-based achievements**: `useAchievementTracking` uses a custom event dispatch system (`dispatchAchievementEvent`) for cross-component achievement progress.

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
