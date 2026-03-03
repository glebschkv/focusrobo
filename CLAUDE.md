# BotBlock — Architecture Reference

> Focus timer iOS app with creature-collection gamification. Users run focus sessions to earn XP, coins, and discover pixel art creatures that populate their personal habitat. Built with React + Capacitor, deployed as a native iOS app.

## Art & Theme Direction

**The app uses a cozy pixel art aesthetic with a creature collection theme.**

- **Visual style**: Clean, colorful pixel art — cute creatures, natural biome backgrounds
- **Home screen concept**: "Focus Habitat" — a living diorama/terrarium that fills with creatures you discover through focus sessions
- **Creatures**: Static pixel art sprites (not animated walking — just idle/breathing micro-animations). Generated via PixelLab API
- **Habitats/Biomes**: Forest, Ocean, Sky, Cave, etc. — each with unique creature sets and themed backgrounds
- **Progression**: Empty habitat → full collection over time. The home screen IS the reward
- **Note**: Legacy code references robots/bots/villages from old themes. The current home screen uses `src/components/pixel-world/` (village system) which is being replaced with the habitat system

## Home Screen Redesign: Focus Habitat

> **STATUS: PLANNED — not yet implemented. This section is the design spec.**

### Concept

The home screen is a **single habitat scene** (terrarium/diorama style). Pixel art creatures populate it as you earn them through focus sessions. Creatures are static sprites — sitting, perching, sleeping in fixed positions. No fake AI walking. Clean and honest.

The focus timer is **integrated directly into the home screen** — no separate tab for the core action. The home screen IS the game.

### Core Loop

```
Focus session → Creature discovery roll → Reveal animation → Creature placed in habitat
                                                                      ↓
                                              Habitat fills up → New biome unlocks → More creatures to find
```

1. User taps "Start Focus" on the home screen
2. Timer runs (optionally showing the habitat in the background)
3. Session completes → rarity roll based on duration:
   - 25min: 80% common, 15% rare, 4% epic, 1% legendary
   - 45min: 60% common, 25% rare, 12% epic, 3% legendary
   - 90min: 40% common, 30% rare, 22% epic, 8% legendary
   - 120min+: 30% common, 30% rare, 25% epic, 15% legendary
4. "New creature discovered!" reveal animation (egg crack / sparkle / fade-in)
5. Creature appears in the habitat at a designated slot
6. Duplicate discoveries → bonus coins + "bond level" increase for that creature

### Visual Layout

```
┌─────────────────────────────┐
│  [Lv.12]  [🪙 340]  [🔥 7] │  ← TopStatusBar (existing, keep as-is)
│                             │
│  ╭─── Habitat Scene ──────╮ │
│  │  🌳    🦊  🐸          │ │
│  │ 🍄  🦉      🐛  🌺    │ │  ← Scrollable habitat with placed creatures
│  │   🐿️    🦋    🌿      │ │     Tap creature → info card (name, rarity, discovery date)
│  │ 🪨  🐞  🍃  ???  ???   │ │     ??? = silhouette slots for undiscovered creatures
│  ╰─────────────────────────╯ │
│                             │
│    ╭───────────────────╮    │
│    │   Start Focus 🎯   │    │  ← Big CTA button, always visible
│    ╰───────────────────╯    │
│                             │
│  [🏠] [📦] [⏱] [🏆] [🛒]  │  ← IOSTabBar (existing)
└─────────────────────────────┘
```

### Creature System

**Rarity tiers:**
| Rarity | Drop glow | Frequency | Example types |
|--------|-----------|-----------|---------------|
| Common | None | ~50% | Ladybug, Frog, Sparrow, Bunny, Squirrel |
| Rare | Blue shimmer | ~25% | Fox, Owl, Deer, Hedgehog, Turtle |
| Epic | Purple glow | ~18% | Phoenix chick, Crystal butterfly, Moon rabbit |
| Legendary | Gold sparkle | ~7% | Dragon, Unicorn, Celestial whale, etc. |

**Creature data model:**
```typescript
interface Creature {
  id: string;
  name: string;
  biome: BiomeId;            // 'forest' | 'ocean' | 'sky' | 'cave' | ...
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  spritePath: string;        // path to static pixel art PNG
  spriteWidth: number;
  spriteHeight: number;
  description: string;       // fun one-liner
  discoveredAt?: string;     // ISO date when user first found it
  bondLevel?: number;        // increases with duplicate discoveries
}
```

**Biomes** (unlock by level):
| Biome | Unlock Level | Creatures | Theme |
|-------|-------------|-----------|-------|
| Forest | 0 | ~8-10 | Woodland animals, mushrooms, insects |
| Meadow | 5 | ~8-10 | Farm animals, butterflies, flowers |
| Ocean | 10 | ~8-10 | Sea creatures, shells, coral critters |
| Sky | 15 | ~6-8 | Birds, cloud creatures, wind spirits |
| Cave | 20 | ~6-8 | Crystal creatures, bats, glow worms |
| Mythic | 30 | ~4-6 | Dragons, unicorns, phoenixes |

### Habitat Scene Component

**Replaces**: `src/components/pixel-world/PixelVillage.tsx`, `VillageMap.tsx`, `VillageCharacter.tsx`, `villageConfig.ts`

**New components to build:**
```
src/components/habitat/
├── FocusHabitat.tsx          # Main home screen component (replaces PixelVillage)
├── HabitatScene.tsx          # Biome background + creature placement grid
├── CreatureSprite.tsx         # Individual creature display (static sprite + idle micro-anim)
├── CreatureInfoCard.tsx       # Tap-to-view card (name, rarity, bio, discovery date)
├── CreatureReveal.tsx         # Discovery animation (egg crack / sparkle reveal)
├── BiomeSelector.tsx          # Swipe/tab between unlocked biomes
├── SilhouetteSlot.tsx         # "???" placeholder for undiscovered creatures
├── StartFocusButton.tsx       # Integrated focus timer CTA on home screen
└── habitatConfig.ts           # Biome definitions, creature slots, positions
```

**New store:**
```
src/stores/habitatStore.ts     # Zustand store for discovered creatures, active biome, slot positions
  - key: nomo_habitat
  - state: discoveredCreatures[], activeBiome, slotPositions, lastDiscovery
```

**New data file:**
```
src/data/CreatureDatabase.ts   # All creature definitions (id, name, rarity, biome, sprite path, description)
```

### Asset Generation (PixelLab)

All creature sprites generated via PixelLab `create_map_object` API:
- **Size**: 32x32 to 48x48px per creature (varies by creature type)
- **Style**: `high top-down` view, `single color outline`, `medium shading`
- **Background**: Transparent
- **Storage**: `public/assets/habitat/creatures/{biome}/{creature-id}.png`
- **Biome backgrounds**: `public/assets/habitat/biomes/{biome-id}-bg.png`

Generate ~40-50 unique creatures total across all biomes. Each needs:
1. A PixelLab `create_map_object` call with a descriptive prompt
2. Download the PNG to the assets folder
3. Entry in `CreatureDatabase.ts`

### Integration Points

**Focus session completion** (in `useXPSystem` or reward handler):
- After XP/coin rewards, trigger creature discovery roll
- Roll uses session duration to determine rarity odds
- Check for duplicates → bonus coins if duplicate, else add to collection
- Dispatch `creatureDiscovered` event for the reveal animation

**Existing systems to keep:**
- TopStatusBar (level, coins, streak) — unchanged
- IOSTabBar — unchanged, home tab now shows habitat instead of village
- XP/coin/streak systems — unchanged
- Shop — can sell creature-themed items, habitat decorations
- Collection tab — could merge with or complement the habitat view
- Achievements — add creature-collection milestones

**Existing systems to remove/replace:**
- `src/components/pixel-world/` — entire village system replaced by habitat
- `src/hooks/useVillageMovement.ts` — no longer needed (creatures are static)
- `src/styles/pixel-world.css` — replace with habitat animations
- Village-related assets in `public/assets/pixel-world/` — keep tiles/decorations that can be reused for biome backgrounds

### Key Design Principles

1. **The home screen reflects your behavior.** Active focuser = rich, full habitat. Inactive = sparse, empty. Visual progress is undeniable.
2. **Every creature = something you earned.** No freebies, no decorative NPCs. Each sprite on screen cost focus time.
3. **"What will I discover next?" drives engagement.** Silhouette slots create curiosity. Rarity system creates surprise.
4. **The core action lives on the home screen.** "Start Focus" button is always visible. No tab-switching for the primary action.
5. **Static sprites are intentional.** No fake wandering AI. Creatures sit/perch/rest. Honest, clean, scales well with 30+ creatures on screen.
6. **Idle micro-animations only.** 2-3 frame breathing/blinking CSS loops. Alive but not busy.

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
3. `Index.tsx` — checks auth → shows onboarding if new → renders **home screen** + **GameUI** (overlay)
4. **GameUI** manages tab state and renders:
   - `TopStatusBar` — XP bar, level, coins (home tab only)
   - `TabContent` — lazy-loads the active tab component
   - `IOSTabBar` — bottom navigation
   - `RewardModals` — XP/coin/milestone/creature-discovery reward popups
5. **Tabs**: home (FocusHabitat — creature collection + integrated timer), timer (detailed timer), collection, challenges, shop, settings
6. **Home tab** (planned): FocusHabitat replaces PixelVillage. Shows habitat scene with collected creatures, "Start Focus" CTA, biome selector. Focus timer can be started directly from home screen.

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

### Village & Characters (LEGACY — being replaced)
- **Status**: Being replaced by Focus Habitat system (see "Home Screen Redesign" section above)
- **Current code**: `src/components/pixel-world/` — PixelVillage with wandering NPCs, buildings, decorations
- **Buildings**: Cottage (0), Bakery (3), Forge (5), Fishing Dock (7), Wizard Tower (10), Town Square (20)
- **Village characters**: Farmer, Baker, Blacksmith, Fisher, Wizard — sprite sheet animated NPCs
- **Assets**: `/public/assets/pixel-world/buildings/` and `/public/assets/pixel-world/sprites/`
- **Why replacing**: Village was a diorama with no meaningful interactivity. Buildings did nothing when unlocked. NPCs had no purpose beyond random quotes. No connection between focus sessions and what happened on screen.

### Legacy Collectibles & Zones (robot-themed, in collection tab)
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

## Design System — Atelier + Pixel Art

The current design uses the **Atelier white theme** with **pixel art creature collection**:

- **Background**: `#FAFAF9` (warm white/stone)
- **Theme color**: `#FAFAF9` for iOS status bar
- **CSS Variables**: HSL-based design tokens in `src/index.css`, consumed via Tailwind (`hsl(var(--primary))`)
- **Component library**: shadcn/ui with Radix UI primitives
- **Animations**: Framer Motion for page transitions, reward celebrations
- **Pixel art**: PixelLab API for generating creature sprites and biome assets (32-48px, transparent BG)
- **3D**: React Three Fiber for hangar scene elements (legacy, may be removed)
- **Fonts**: Inter (via `@fontsource/inter`)

## Build & Deploy

1. `npm run build` — Vite builds to `dist/`
2. `npm run cap:copy:ios` — copies `dist/` into iOS project + runs `scripts/patch-ios-config.cjs`
3. Open `ios/App/App.xcworkspace` in Xcode
4. Build/archive from Xcode for TestFlight/App Store

## Important Patterns

- **Backward compatibility aliases**: The app was renamed from animals/pets/biomes to robots/bots/zones, and the home screen is being redesigned from village to habitat. Many deprecated aliases exist (e.g., `AnimalData = RobotData`, `BiomeData = ZoneData`, `ANIMAL_DATABASE = ROBOT_DATABASE`). Use the new names.
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

## Market Research & Competitive Insights

> Research conducted March 2026. These insights inform the Focus Habitat redesign.

### Why the Village Concept Failed

The old Stardew Valley village home screen was a **diorama, not a game**:
- No agency: nothing to do on the home screen except look at it
- No feedback: focus sessions had zero visible effect on the village
- No stakes: nothing bad happened from inactivity
- No ownership: NPCs weren't "yours" — they were just decoration
- Two competing themes: village farmers on home screen, robots in collection tab
- Core action (focus timer) lived on a separate tab — disconnected from the "game"

### What Works in Competing Apps

| App | Core Mechanic | Why It Retains | Key Takeaway |
|-----|--------------|----------------|--------------|
| **Forest** | Plant tree → grows during focus → dies if you leave | Loss aversion + visible history (dead stumps stay) | Stakes matter. Show failures too, not just successes |
| **Finch** | Care for ONE pet bird → it grows over weeks | Emotional bond to single character, no punishment for missing days | Single focal point > collection of generic items |
| **Duolingo** | Linear path → daily lesson → streak → weekly league | 37% DAU/MAU ratio. Streaks + leagues + variable rewards | One clear "next action." Streak as identity |
| **Pokemon Sleep** | Sleep → Pokemon appear → helpers gather resources while idle | Home screen mirrors your behavior. Idle accumulation = reason to check in | The home screen should REFLECT your habits back at you |
| **Habitica** | RPG character → complete real tasks → earn gear → party quests | Social accountability (party damage if you miss dailies) | Deep systems beat pretty graphics |
| **Walkr** | Walk → fuel spaceship → discover planets → manage colonies | Passive progress + active management. 100+ collectible planets | Collection works when each item is visually unique and beautiful |

### Five Principles for the Home Screen

1. **The home screen must be a living mirror of behavior.** Active focuser = rich habitat. Inactive = sparse. The difference should be visible at a glance.
2. **Create reasons to open the app beyond "start a focus session."** Idle mechanics, daily discoveries, check-in rewards. These create touchpoints that lead to focus sessions organically.
3. **One clear next action.** The "Start Focus" button must be obvious within 1 second of opening the app. No hunting through tabs.
4. **Variable rewards beat fixed rewards.** Sometimes a common creature, sometimes a legendary. Unpredictability maintains dopamine. Longer sessions = better odds, not guaranteed outcomes.
5. **Collection + rarity + silhouettes = curiosity loop.** Seeing "???" shadows of undiscovered creatures is a powerful motivator. "What's that one? I need to do another session to find out."

### How Focus Habitat Applies These Insights

| Principle | Forest/Finch/Duolingo | Focus Habitat Implementation |
|-----------|----------------------|------------------------------|
| Mirror behavior | Forest: dead trees visible | Empty vs full habitat. Sparse = haven't focused. Rich = active focuser |
| Reason to open | Pokemon Sleep: idle helpers | Daily discovery slots, biome progression, checking new creatures |
| Clear next action | Duolingo: one "Start" button | "Start Focus" CTA directly on home screen |
| Variable rewards | Duolingo: random XP bonuses | Rarity rolls after sessions. Duration affects odds but doesn't guarantee |
| Curiosity loop | Pokemon Sleep: new Pokemon each morning | Silhouette slots for undiscovered creatures. "What's the shadow?" |
