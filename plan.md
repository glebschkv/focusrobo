# BotBlock — Flawless App Design Plan

## Design Philosophy: "Premium Gallery, Not Empty Canvas"

The Atelier theme is NOT "plain white background." It's a **curated exhibition space** — like Apple's product pages or a high-end museum. Every screen should have:

- **Rich visual hierarchy** — gradient headers, accent sections, layered cards
- **Subtle texture** — noise grain, soft gradients, glass depth
- **Zone-colored accents** — each screen uses contextual color to feel alive
- **Micro-motion** — shimmer, pulse, float. The UI should feel like it breathes
- **Depth through shadows** — every card has layered box-shadow with inner highlights

The principle: white is the *canvas*, but the content on it should be **rich, warm, and detailed**.

---

## Status: ALL PHASES COMPLETE

- [x] Home (MechHangar) — premium gallery with aura, particles, glass reflection
- [x] Top status bar — glass morphism, gradient badges
- [x] Dock/tab bar — layered glow, gradient center button
- [x] CSS split — 4,783 lines → 11 modules
- [x] Charge bar — real analytics data, shimmer animation
- [x] Robot SVGs — unique character designs (Bolt Bot, Omega Prime)
- [x] Gamification tab — full rewrite to Atelier (amber achievements, clean info panel)
- [x] Settings tab — Atelier header, sky-500 pill tabs, warm canvas
- [x] Shop tab — CSS overhaul (white cards, sky buttons, removed 3D borders)
- [x] Collection tab — fixed dark dropdown, frosted lock overlay, clean badges
- [x] Auth page — warm gradient bg, stone text, sky-500 buttons
- [x] Timer tab — sky selected preset, cleaned break mode
- [x] Retro CSS cleanup — all retro-* classes now render as Atelier

---

## Phase 6: Settings Tab
**Files:** `src/components/Settings.tsx`

### Current: Dark purple arcade container, neon text, pixel borders
### Target: Warm Atelier with rich cards and clear hierarchy

**Header redesign:**
- Remove: `retro-arcade-container`, `retro-pixel-text`, `retro-neon-text`, dark purple gradient, `border-b-4`
- Add: Clean white bg, app icon with subtle shadow, "Settings" in stone-900 font-bold, subtitle in stone-400
- Keep: App icon image

**Tab pills redesign:**
- Remove: `retro-arcade-btn-yellow`, `retro-game-card` classes
- Add: Glassmorphic pill tabs — inactive: `bg-stone-100 text-stone-500 border border-stone-200/50`, active: `bg-sky-500 text-white shadow-md` with smooth transition
- Add: Active pill indicator animation (width transition)

**Loading state:**
- Remove: `retro-game-card` with cyan spinner
- Add: Warm card with stone-100 bg, sky-500 spinner, stone-600 text

**Content wrapper:**
- Remove: `retro-arcade-container` background
- Add: `bg-[#FAFAF9]` warm canvas, no scanlines

---

## Phase 7: Gamification/Challenges Tab
**Files:** `src/components/gamification/GamificationHub.tsx`

### Current: FULL dark arcade theme — the most jarring screen in the app
### Target: Rich Atelier with warm amber accents and satisfying progress visualization

**Header redesign:**
- Remove: Dark purple gradient, `retro-icon-badge`, `retro-neon-text`, `retro-pixel-text`, `border-b-4 border-purple-600/50`
- Add: Clean header with Trophy icon in amber-500 tinted circle, "Challenges" in stone-900 font-bold, "Achievements & Rewards" in stone-400

**Achievement card redesign:**
- Remove: `retro-game-card`, dark purple progress bar, neon text, heavy amber border glow
- Add: White card with rounded-2xl, subtle shadow (--shadow-md), thin border
  - Top: slim progress bar with amber-400 → yellow-500 gradient, rounded-full, bg-stone-100 track
  - Trophy icon: amber-500 bg circle with white icon (no neon glow — use clean shadow instead)
  - "Achievements" label: stone-900 font-semibold (not uppercase pixel text)
  - Points: amber-600 font-bold
  - Unlock count: stone-400
  - Completion %: large amber-500 number with circular progress ring around it
  - ChevronRight: stone-300, shows this is tappable

**Info panel redesign:**
- Remove: `retro-game-card`, cyan `retro-pixel-text`, colored Unicode arrows
- Add: Light stone-50 card with rounded-xl, thin stone-200 border
  - Zap icon in sky-500
  - "How It Works" in stone-700 font-semibold (normal case)
  - Bullet items with small colored dots (sky-500, amber-500, violet-500) — not arrows
  - Text: stone-500

**Content wrapper:**
- Remove: `retro-arcade-container`
- Add: `bg-[#FAFAF9]`

---

## Phase 8: Collection Tab — Fix Dark Elements
**Files:** `src/components/BotCollectionGrid.tsx`, `src/styles/collection.css`

### Current: Mostly clean BUT dropdowns/modals are dark purple
### Target: Fully Atelier with rarity-accented cards

**CSS fixes in collection.css:**
- `.collection-sort-dropdown`: dark purple → white card with shadow-lg, border stone-200
- `.collection-sort-option`: purple text → stone-600 text, hover bg-stone-50
- `.collection-sort-option.active`: cyan neon → sky-500 text with sky-50 bg
- `.collection-search-input`: if dark-themed, switch to white bg, stone-200 border, stone-500 placeholder
- `.inventory-badge`: unify all badge variants to use Atelier tokens

**Bot card enhancements in collection.css:**
- Ensure white bg cards with subtle rarity top-bar accent
- Add: subtle hover shadow lift on unlocked cards
- Locked cards: add frosted glass overlay with lock icon

**Empty state:**
- Replace emoji with lucide Search icon in stone-300
- Text: stone-400

---

## Phase 9: Shop Tab — Warm Premium Commerce
**Files:** `src/components/Shop.tsx`, `src/styles/shop.css`

### Current: Warm beige gradient bg (good base!), but retro 3D borders, thick shadows
### Target: Keep warm tone, refine to premium glass depth

**shop.css overhaul:**
- `.shop-container`: keep warm gradient but soften (lighter, more premium)
- `.shop-booster-pill`: remove 3D border, use glass morphism
- `.shop-coin-badge`: remove retro 3D, use gold gradient with subtle shadow (match TopStatusBar coin chip)
- `.shop-coin-plus`: soften to sky-500 gradient
- `.shop-inventory-btn`: transparent btn with stone-200 border
- `.shop-tab-pill`: Atelier pills (inactive stone-100, active sky-500)

**Section headers:**
- Remove thick colored pseudo-element bars. Use: stone-800 font-bold, small colored dot accent

**Card unification:**
- `.shop-premium-card`: white card with sky-500 gradient border-left accent, shadow-md
- `.shop-list-card`: thin 1px stone-200 border, shadow-sm, rounded-2xl
- All cards: inner highlight, no 3D bottom borders

**Price buttons:**
- Soften gradients, remove aggressive shimmer, keep subtle shine
- Primary: sky-500 gradient, rounded-xl

**Remove:** `.retro-scanlines`, all thick borders

---

## Phase 10: Auth Page — Premium First Impression
**Files:** `src/pages/Auth.tsx`

### Current: Dark purple gradient — first thing users see, mismatches app
### Target: Warm, inviting Atelier introduction

**Background:** warm Atelier gradient with subtle center spotlight
**Logo:** clean shadow, slight scale animation
**Title:** stone-800, subtle letter-spacing
**Inputs:** white bg, stone-200 border, sky-500 focus ring
**Buttons:** sky-500 gradient primary, stone-100 secondary, Apple stays black
**Remove:** `.retro-scanlines`

---

## Phase 11: Timer — Minor Polish
**Files:** `src/styles/timer-controls.css`

Verify preset buttons, control buttons, and lock screen all use Atelier colors.

---

## Phase 12: CSS Cleanup
**Files:** `src/styles/retro-theme.css`, `src/styles/retro-elements.css`

After all phases: grep for remaining `.retro-*` usage, remove dead classes.

---

## Implementation Order

| # | Phase | Screen | Key Change |
|---|-------|--------|------------|
| 1 | 7 | Gamification | Full rewrite — worst visual clash |
| 2 | 6 | Settings | Rewrite header + tabs + wrapper |
| 3 | 9 | Shop | CSS overhaul — cards, buttons, pills |
| 4 | 8 | Collection | CSS fixes — dropdowns, cards, badges |
| 5 | 10 | Auth | Restyle bg, inputs, buttons |
| 6 | 11 | Timer | Verify & minor fixes |
| 7 | 12 | Cleanup | Dead CSS removal |

---

## Visual Rules (Every Screen)

1. **No dark backgrounds** — canvas is always #FAFAF9 or warmer
2. **No thick borders** — max 1px, use shadows for depth instead
3. **No neon text** — stone-900/800/700/500/400 hierarchy
4. **No pixel fonts** — system font everywhere
5. **Glass morphism for overlays** — blur(32px), white/0.85, inner border
6. **Accent colors** — sky-500 primary, amber coins/streaks, violet premium
7. **Every card** — rounded-2xl, shadow-sm+, thin border, inner top highlight
8. **Every tap target** — active:scale-0.97, 150ms transition
9. **Every header** — bold title + muted subtitle, clear hierarchy
10. **Texture on large areas** — subtle noise grain to avoid "empty" feel
