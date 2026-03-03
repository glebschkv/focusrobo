# BotBlock — Architecture Reference

> Focus timer iOS app with pet collection gamification. Users run focus sessions to earn XP and coins. Each completed session places a random pet on a 10×10 land grid. Longer sessions = bigger pets (baby/adolescent/adult). Fill a land (100 pets), start a new one. Built with React + Capacitor, deployed as a native iOS app.

## Core Gameplay Loop

```
Focus session completes → random pet generated (weighted by rarity)
→ pet size based on session length (baby/adolescent/adult)
→ pet placed on next empty cell of 10×10 land grid
→ fill all 100 cells = land complete → archive → new land
```

## Art & Theme Direction

**Pixel art aesthetic** — cute collectible animals on a meadow:

- **Visual style**: Pixel art pets (128×128 SVG), front-facing, transparent background
- **Home screen**: `PetLand` component — 10×10 CSS grid on a sky+grass background
- **Pets**: Bunny, Chick, Frog, Fox, Deer (5 MVP species, expanding to 25)
- **Pet sizes**: Baby (25-45 min), Adolescent (60-90 min), Adult (120+ min) — CSS `scale()` within cells
- **Rarity**: common, uncommon, rare, epic, legendary — with CSS glow effects
- **Land themes**: Meadow (default), Beach, Snow, Desert, Night Garden, Sakura (purchasable)

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
│   ├── Index.tsx              # Main page: auth gate → onboarding → GameUI
│   ├── Auth.tsx               # Login/signup
│   ├── PrivacyPolicy.tsx
│   ├── TermsOfService.tsx
│   └── NotFound.tsx
├── components/
│   ├── PetLand.tsx            # Home screen — 10×10 pet collection grid
│   ├── PetLandCell.tsx        # Single grid cell — renders pet at scale
│   ├── GameUI.tsx             # Tab navigation + status bar + reward modals overlay
│   ├── TabContent.tsx         # Lazy-loaded tab renderer with skeleton fallbacks
│   ├── IOSTabBar.tsx          # Bottom tab bar (iOS-native style)
│   ├── TopStatusBar.tsx       # XP bar, coins, level, streak at top
│   ├── UnifiedFocusTimer.tsx  # Focus timer tab
│   ├── BotCollectionGrid.tsx  # Collection tab (legacy, being replaced by PetCollectionBook)
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
│   ├── collection/            # Collection sub-components (legacy robot cards)
│   ├── settings/              # Settings sub-components
│   └── ui/                    # shadcn/ui component library (button, card, dialog, etc.)
├── stores/                    # Zustand state management (see Stores section)
│   └── landStore.ts           # Pet land grid state (current land, completed lands, species catalog)
├── hooks/                     # Custom React hooks (see Hooks section)
├── data/
│   ├── PetDatabase.ts         # Pet species definitions, rarity weights, growth sizes, random roll
│   ├── RobotDatabase.ts       # Legacy robot data (still used by collection/shop tabs, being phased out)
│   ├── ShopData.ts            # Shop items, backgrounds, bundles
│   ├── GamificationData.ts    # Milestone definitions
│   └── AmbientSoundsData.ts   # Sound library
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
├── plugins/                   # Capacitor native plugins
│   ├── device-activity/       # iOS Screen Time / DeviceActivity framework
│   ├── store-kit/             # StoreKit 2 IAP
│   ├── app-review/            # App Store review prompt
│   └── widget-data/           # iOS widget data bridge
├── styles/                    # Modular CSS
│   ├── pet-land.css           # Pet land grid styles (sky, grid, cells, tooltips)
│   └── ...                    # Other style modules
└── integrations/
    └── supabase/              # Supabase client + generated types
```

## App Flow

1. `App.tsx` — wraps everything in ErrorBoundary, QueryClient, NativePluginProvider, OfflineProvider
2. Routes: `/` (Index), `/auth`, `/privacy`, `/terms`
3. `Index.tsx` — checks auth → shows onboarding if new → renders **GameUI** (full overlay)
4. **GameUI** manages tab state and renders:
   - `TopStatusBar` — XP bar, level, coins, streak (home tab only)
   - `TabContent` — renders active tab (PetLand for home, lazy-loads others)
   - `IOSTabBar` — bottom navigation
   - `RewardModals` — XP/coin/milestone reward popups
5. **Tabs**: home (PetLand), timer, collection (Pets), challenges, shop, settings

## Stores (Zustand)

All stores use `zustand/persist` with validated localStorage via `createValidatedStorage()` and Zod schemas. Storage keys are prefixed with `nomo_`.

| Store | Key | Purpose |
|-------|-----|---------|
| `landStore` | `nomo_land_data` | **Current land grid (100 cells), completed lands, species catalog, pending pet** |
| `xpStore` | `nomo_xp_system` | XP, level (max 50), unlocked entities |
| `coinStore` | `nomo_coin_system` | Coin balance, totalEarned, totalSpent, server sync state |
| `premiumStore` | `nomo_premium` | Subscription tier (free/premium/premium_plus/lifetime) |
| `streakStore` | `nomo_streak_data` | Current streak, longest streak, streak freezes (max 3), total sessions |
| `focusStore` | `nomo_focus_mode` | Focus mode settings, blocked apps, strict mode |
| `navigationStore` | (not persisted) | Active tab, modal state, navigation history |
| `shopStore` | (persisted) | Owned characters, backgrounds, equipped background |
| `collectionStore` | (persisted) | Legacy: active home bots, favorites |
| `soundStore` | (persisted) | Sound mixer layers, ambient sounds, volume |
| `questStore` | (persisted) | Daily/weekly quests |
| `onboardingStore` | (persisted) | Onboarding completion state |
| `authStore` | (persisted) | Guest ID, guest mode flag |
| `themeStore` | (persisted) | Home background theme |

## Pet Collection System

### Pet Species
- **5 species** (MVP): Bunny, Chick, Frog, Fox, Deer
- **Expanding to 25**: 8 common, 6 uncommon, 5 rare, 4 epic, 2 legendary
- **Data**: `src/data/PetDatabase.ts`
- **Assets**: `public/assets/pets/*.svg` (128×128 pixel art SVGs)

### Growth Sizes (3 tiers)
| Size | Session Duration | CSS Scale | Cell Fill |
|------|-----------------|-----------|-----------|
| Baby | 25-45 min | `scale(0.4)` | ~40% |
| Adolescent | 60-90 min | `scale(0.7)` | ~70% |
| Adult | 120+ min | `scale(1.0)` | 100% |

### Rarity & Drop Weights
| Rarity | Drop Weight | Glow Effect |
|--------|------------|-------------|
| Common | 45% | None |
| Uncommon | 28% | White |
| Rare | 17% | Blue |
| Epic | 8% | Purple |
| Legendary | 2% | Gold + shimmer |

### Land Grid
- **10×10 grid** = 100 cells per land
- Fill order: left-to-right, top-to-bottom
- Pets placed via `landStore.placePendingPet()`
- When land is full → archive to `completedLands[]` → start new land
- Land themes purchasable in shop (cosmetic background swap)

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
| `useSoundMixer` | Ambient sound layering |
| `useHaptics` | iOS haptic feedback |
| `useWidgetSync` | iOS widget data synchronization |
| `useTimerExpiryGuard` | Ensures timer fires even if app backgrounded |
| `useBackendAppState` | Fetches user state from Supabase on load |
| `useBackendStreaks` | Server-side streak sync |
| `useBackendQuests` | Server-side quest sync |
| `useCollection` | Collection management (legacy, uses RobotDatabase) |
| `useShop` | Shop purchase logic |

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

## Design System

The current design uses the **Atelier white theme** with **pixel art**:

- **Background**: `#FAFAF9` (warm white/stone) for non-home tabs
- **Home screen**: CSS gradient sky + grass background
- **Theme color**: `#FAFAF9` for iOS status bar
- **CSS Variables**: HSL-based design tokens in `src/index.css`, consumed via Tailwind
- **Component library**: shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion for page transitions, reward celebrations
- **Fonts**: Inter (via `@fontsource/inter`)

## Build & Deploy

1. `npm run build` — Vite builds to `dist/`
2. `npm run cap:copy:ios` — copies `dist/` into iOS project + runs `scripts/patch-ios-config.cjs`
3. Open `ios/App/App.xcworkspace` in Xcode
4. Build/archive from Xcode for TestFlight/App Store

## Important Patterns

- **Validated persistence**: All Zustand stores use `createValidatedStorage()` with Zod schemas — invalid persisted data falls back to defaults instead of crashing.
- **Lazy loading**: All tab content and heavy components are lazy-loaded with `React.lazy()` and context-aware skeleton fallbacks.
- **Error boundaries**: Every feature area has its own `FeatureErrorBoundary` wrapper — errors are isolated, not app-crashing.
- **Server-authoritative coins**: Coin balance changes are cached locally but validated via the `validate-coins` edge function.
- **Event-based achievements**: `useAchievementTracking` uses a custom event dispatch system for cross-component achievement progress.
- **Legacy robot system**: `RobotDatabase.ts` and `useCollection` still exist for the collection/shop tabs but are being phased out in favor of the pet system.
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

- [ ] PetRevealModal — post-session pet reveal screen (replaces XPRewardModal)
- [ ] LandCompleteModal — celebration when 100th cell filled
- [ ] PetCollectionBook — species catalog + land history (replaces BotCollectionGrid)
- [ ] Wire pet generation into timer completion flow (`useTimerRewards`)
- [ ] Update XP system to use PetDatabase for level-up unlocks (remove robot unlock logic)
- [ ] Update shop for land themes, rarity boosts, species picks
- [ ] Generate real pet pixel art via PixelLab API (25 species)
- [ ] Update onboarding flow for pet theme
- [ ] Remove remaining RobotDatabase dependencies from collection/shop
