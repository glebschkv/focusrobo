# BotBlock: Mechanical + Glass Polish Redesign Plan

## Executive Summary

Transform BotBlock from its current "retro pixel arcade" aesthetic into a **premium mechanical-industrial + iOS glass** design language. The robots are the star of the show — every design decision pushes them to the foreground. Think: a precision-engineered workshop behind frosted glass panels, where your robots charge and evolve.

---

## Current State Analysis

| Aspect | Current | Target |
|--------|---------|--------|
| **Visual Identity** | Retro pixel art, 8-bit borders, arcade badges | Precision mechanical + frosted glass |
| **Color System** | Pixel purples, warm beiges, retro greens | Dark titanium, cyan energy, warm amber accents |
| **Typography** | Mixed fonts with pixel shadows | SF Pro Display + SF Mono (native iOS) |
| **Characters** | Pixel-art SVG sprites with `imageRendering: pixelated` | AI-generated hi-fi robot illustrations (PixelLab) |
| **Backgrounds** | Flat gradients + scanlines | Layered depth with blur, light, texture |
| **Cards/Surfaces** | `pixel-border`, `retro-card`, hard edges | Frosted glass panels, soft radius, inner glow |
| **Navigation** | Custom dock bar with dark/light context switching | Unified floating glass dock, always translucent |
| **Shop** | Warm amber "marketplace" feel, light mode | Dark industrial storefront, premium feel |
| **Animations** | Float-up particles, sparkle rings | Mechanical: hydraulic lifts, gear rotations, pressure gauges |

---

## Design Concept A: "FORGE" (Recommended)

### Philosophy
*Your pocket robot workshop.* Dark, industrial, with glowing energy conduits visible through frosted glass panels. Every surface feels like brushed titanium behind a transparent overlay. Robots sit in illuminated charging bays — the brightest elements on screen.

### Color Palette

```
Primary Background:    #0B0F1A (Deep void blue-black)
Surface Level 1:       #111827 (Titanium dark)
Surface Level 2:       #1E293B (Steel panel)
Surface Level 3:       #334155 (Lighter steel, raised elements)

Glass Surface:         rgba(255, 255, 255, 0.06)  (Frosted panels)
Glass Border:          rgba(255, 255, 255, 0.08)  (Subtle edge)
Glass Highlight:       rgba(255, 255, 255, 0.12)  (Top edge shine)

Primary Accent:        #06B6D4 (Cyan energy — charging, active states)
Secondary Accent:      #F59E0B (Amber — coins, XP, warmth)
Tertiary Accent:       #8B5CF6 (Violet — premium, rare items)
Success:               #10B981 (Emerald — owned, completed)
Danger:                #EF4444 (Red — alerts, expensive)

Text Primary:          rgba(255, 255, 255, 0.92)
Text Secondary:        rgba(255, 255, 255, 0.55)
Text Tertiary:         rgba(255, 255, 255, 0.30)
```

### Glass Panel System
Every card/container uses a unified "glass panel" pattern:
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  box-shadow:
    0 0 0 0.5px rgba(255, 255, 255, 0.08),      /* Inner fine edge */
    inset 0 1px 0 rgba(255, 255, 255, 0.06),     /* Top highlight */
    0 8px 32px rgba(0, 0, 0, 0.3),                /* Depth shadow */
    0 2px 8px rgba(0, 0, 0, 0.15);                /* Close shadow */
}
```

### Screen-by-Screen Design

#### HOME SCREEN — "The Hangar"
- **Background**: Deep dark gradient with subtle radial glow from center (where the robot sits)
- **Main Robot Display**: Large (60% of screen height), centered, sitting on a glowing circular platform
  - Platform has concentric rings that pulse when charging (focus session active)
  - Subtle holographic scan effect sweeps across the robot periodically
  - Robot casts a soft colored shadow matching its glow color
- **Secondary Bots**: 3 small glass pods floating above, tappable to swap
- **Charge Bar**: Horizontal, rounded, with a glowing fill that breathes. Below the robot.
  - Use a mechanical gauge metaphor: tick marks at 25/50/75/100%
  - When charging: bar fills smoothly with cyan glow + shimmer
- **Stats**: Bottom glass strip showing streak/level/bot count as minimal readouts
- **Top Bar**: Transparent, glass-style. Level badge (circular), coin counter (pill), streak flame

#### FOCUS TIMER — "The Engine Room"
- Full-screen immersive dark environment
- Timer displayed as a large **circular gauge/dial** (think precision instrument)
  - Outer ring: tick marks (minutes), mechanical feel
  - Fill: glowing arc that sweeps clockwise
  - Center: time remaining in SF Mono, large
  - When active: subtle pulsing glow on the dial edge
- Timer presets: horizontal scroll of glass pills
- Background themes: subtle, don't compete with the gauge. Atmospheric gradients.
- "Start/Stop" button: large, circular, glass with inner glow. Haptic feedback on press.

#### COLLECTION — "The Display Cases"
- Dark background with subtle grid lines (workshop floor feel)
- Robot cards: glass panels with robot image centered, name below
  - Rarity indicated by a thin glowing top border (common=steel, rare=blue, epic=violet, legendary=amber)
  - Locked robots shown as silhouettes behind frosted glass
- Zone sections: collapsible, each with a subtle zone-colored accent
- Filter bar: horizontal scroll of glass pills with zone icons

#### SHOP — "The Marketplace"
- **DARK MODE** (currently light — this is the biggest change)
- Same glass panel system as the rest of the app
- Premium card: gradient border (violet->cyan), glass panel, subtle shimmer
- Bot cards: same as collection but with price tags
- Coin packs: glass panels with amber glow accents
- Bundle cards: wider, with image carousel + glass info bar below
- Section headers: thin uppercase, letter-spaced, with a thin line divider

#### CHALLENGES — "Mission Control"
- Dark background with subtle topographic/circuit-board pattern
- Quest cards: glass panels with progress bars
- Active challenge: highlighted with a thin cyan border glow
- Completion celebration: mechanical "stamp" animation (think factory QC pass stamp)

#### SETTINGS — "System Config"
- Clean, minimal, dark
- Grouped sections in glass panels
- Toggle switches with iOS-native feel (but in theme colors)
- Section headers: uppercase, spaced, dim

#### ONBOARDING — "First Boot Sequence"
- Dark background with a slow "power-up" reveal
- Replace pixel wizard with the new hero robot (AI-generated)
- Steps use glass cards with numbered indicators
- "Begin Adventure" → "Initialize" or "Activate"
- Focus Shield step: use a shield icon with a holographic scan effect

### Tab Bar (Dock) Redesign
- Floating glass bar, always dark, always translucent
- `backdrop-filter: blur(40px) saturate(180%)`
- Icons: SF Symbols or Lucide, thin stroke when inactive, filled when active
- Active tab: icon + label glow in cyan, small dot indicator below
- Center button (Timer): larger, circular, glass with inner gradient. Raised slightly.
- No more light/dark context switching — always unified dark glass

---

## Design Concept B: "NEXUS"

### Philosophy
*A living laboratory.* Brighter than Forge, with more contrast. White/light glass panels float over a deep dark background. Robots are displayed in bright "specimen" pods. More clinical and modern, less gritty industrial.

### Key Differences from Forge
- Surfaces use **white glass** (`rgba(255, 255, 255, 0.12)`) — more visible panels
- Background is slightly lighter (#0F172A)
- Accent color shifts from cyan to **electric blue** (#3B82F6)
- Cards have stronger borders and more pronounced backdrop blur
- More whitespace between elements
- Timer: digital LED-style readout instead of gauge dial
- Bot display: clean white circular pod, no platform glow — clinical "specimen showcase"
- Shop: alternating dark/slightly-lighter panel stripes for hierarchy

### Color Palette
```
Primary Background:    #0F172A (Navy blue-black)
Surface Level 1:       #1E293B (Blue-grey steel)
Glass Surface:         rgba(255, 255, 255, 0.10)
Primary Accent:        #3B82F6 (Electric blue)
Secondary Accent:      #F59E0B (Amber)
```

---

## Design Concept C: "ALLOY"

### Philosophy
*Premium minimalism meets mechanical precision.* The most refined of the three. Nearly monochrome with a single accent color. Emphasis on negative space, sharp typography, and letting the robot illustrations be the ONLY colorful elements.

### Key Differences
- Background: pure near-black (#09090B)
- Only ONE accent color: cyan (#06B6D4) — used sparingly for active states only
- Robot images provide ALL the color in the app
- Cards: extremely subtle glass (nearly invisible borders)
- Typography: heavier weight, more tracked-out uppercase labels
- Timer: minimalist arc — just a thin glowing circle, nothing else
- Tab bar: ultra-minimal, just 5 icons, no labels, dot indicator only
- Shop: full dark, list-based layout (no grid), each item is a single row

### Color Palette
```
Primary Background:    #09090B (Near-black)
Surface:               #18181B (Zinc-900)
Glass Surface:         rgba(255, 255, 255, 0.03)
Accent:                #06B6D4 (Cyan, used sparingly)
```

---

## Robot Character Pipeline (PixelLab Integration)

### Generating the Robots

PixelLab's API (`@pixellab-code/pixellab` npm package) can generate pixel art characters. For the new mechanical aesthetic:

**Recommended Approach:**
1. Create 1-2 hero reference robots manually (in Figma or commission them) in the exact style you want
2. Use PixelLab's **Style Reference** feature to generate all other robots matching that style
3. Use text prompts like: *"cute mechanical robot, titanium body, glowing cyan eyes, rounded design, clean metallic surface"*
4. Generate at **128x128** or **256x256** for crisp display on retina screens
5. Use PixelLab's **rotation** feature for different poses/angles per robot

**Style Prompt Templates:**
```
Common:    "simple small robot, grey metal body, basic design, single glowing eye, compact"
Rare:      "medium robot, blue metallic armor plates, dual glowing eyes, articulated limbs, polished surface"
Epic:      "advanced robot, purple crystal core visible, floating parts, energy field, detailed mechanical joints"
Legendary: "elite mech, golden accents, multiple glowing elements, complex machinery, holographic projections, premium"
```

**Output Specifications:**
- Format: PNG with transparency
- Size: 256x256 (2x for retina) or 512x512 for hero display
- Style: Consistent pixel-art, but at higher resolution than current 64x64
- Background: transparent
- Naming: `{zone}-{robot-name}.png` → `assembly-line/bolt-bot.png`

**PixelLab API Usage:**
```typescript
import { PixelLab } from '@pixellab-code/pixellab';

const client = new PixelLab({ apiKey: process.env.PIXELLAB_API_KEY });

// Generate with text prompt
const result = await client.generateImage({
  description: "cute mechanical robot, titanium body, glowing cyan eyes",
  width: 128,
  height: 128,
});

// Generate with style reference
const result = await client.generateImageWithStyle({
  description: "small gear-shaped robot companion",
  styleReference: referenceImageBuffer,
  width: 128,
  height: 128,
});
```

**Batch Generation Plan:**
- Assembly Line (4 bots): simple, grey/blue steel
- Workshop (4 bots): tinkered look, visible gears, copper accents
- Power Plant (4 bots): glowing cores, energy conduits
- Quantum Lab (4 bots): floating parts, holographic, translucent elements
- Command Deck (4 bots): military-grade, angular, command insignia
- Deep Core (4 bots): heavy armor, magma glow, massive

---

## CSS Architecture Changes

### What Gets Removed
- All `.retro-*` classes (retro-card, retro-level-badge, retro-stat-pill, retro-xp-bar, etc.)
- All `.pixel-*` classes (pixel-border, pixel-cloud)
- `imageRendering: pixelated` on robot images
- Light mode shop colors (amber/warm theme)
- Retro gradient variables (--gradient-hero, --gradient-sky, --gradient-platform)
- Arcade-style shadows (pixel-drop-shadow, 2px hard borders)
- Scanline overlays
- Retro shop card styles (.retro-shop-card, .retro-scanlines)

### What Gets Added
- `.glass-panel` base class (see above)
- `.glass-panel-raised` (for elevated elements like modals)
- `.glass-panel-inset` (for recessed areas like input fields)
- `.glow-ring` (for robot display platforms)
- `.gauge-arc` (for timer dial)
- `.energy-bar` (new charge/progress bar)
- `.mech-stat-readout` (for stats display)
- `.mech-section-header` (for section titles)
- New CSS custom properties for the entire glass/mechanical system
- Dark-only color scheme (remove light mode variable overrides for app chrome)

### New CSS Variables
```css
:root {
  /* Forge Color System */
  --forge-bg: #0B0F1A;
  --forge-surface-1: #111827;
  --forge-surface-2: #1E293B;
  --forge-surface-3: #334155;

  --forge-glass-bg: rgba(255, 255, 255, 0.04);
  --forge-glass-border: rgba(255, 255, 255, 0.06);
  --forge-glass-highlight: rgba(255, 255, 255, 0.12);

  --forge-cyan: #06B6D4;
  --forge-amber: #F59E0B;
  --forge-violet: #8B5CF6;
  --forge-emerald: #10B981;
  --forge-red: #EF4444;

  --forge-text-primary: rgba(255, 255, 255, 0.92);
  --forge-text-secondary: rgba(255, 255, 255, 0.55);
  --forge-text-tertiary: rgba(255, 255, 255, 0.30);

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;
}
```

---

## Component-Level Changes

### 1. HangarBackground.tsx
- Remove grid lines and scanlines
- Add layered radial glow centered on robot position
- Add subtle floating dust particles (CSS-only, GPU-accelerated)
- Bottom: subtle "workshop floor" gradient fade

### 2. ChargingBay.tsx
- Replace rectangular bay with circular platform
- Add concentric ring animations (CSS `@keyframes`)
- Robot image: remove pixelated rendering, add drop-shadow glow
- Add holographic scan line effect (thin line sweeping top-to-bottom)

### 3. ChargeBar.tsx
- Redesign as a mechanical gauge:
  - Rounded track with tick marks
  - Glowing cyan fill
  - Percentage readout in SF Mono
  - Shimmer effect on fill edge

### 4. DisplayBay.tsx
- Circular glass pods instead of rectangular
- Active state: cyan border glow
- Robot images slightly smaller but crisper

### 5. IOSTabBar.tsx (Dock)
- Unified glass background (always dark, always blurred)
- Remove dark-context/light-context switching
- Center button: glass circle with gradient fill
- Active state: icon glow + label fade-in + dot

### 6. TopStatusBar.tsx
- Transparent glass background
- Level badge: circular, minimal, with thin ring progress indicator
- Coin display: glass pill with amber icon
- Streak: glass pill with flame glow when active

### 7. Shop (all tabs)
- Complete dark mode conversion
- All cards → glass panels
- Rarity colors remain but applied as thin border glows
- Premium card: animated gradient border
- IAP buttons: glass pills with price, iOS-native feel

### 8. OnboardingFlow.tsx
- Dark "boot sequence" theme
- Replace wizard sprite with new hero robot
- Glass cards for step explanations
- CTA button: glass with inner cyan glow
- Replace "Begin Adventure" → "Activate" or "Power On"

### 9. TimerDisplay.tsx / UnifiedFocusTimer.tsx
- Large circular gauge (SVG arc)
- Tick marks around perimeter
- Time in center, large SF Mono
- Glowing arc fill that sweeps clockwise
- Pulsing edge glow when active

### 10. Collection tabs
- Dark grid layout
- Glass robot cards
- Locked: frosted/dimmed silhouette
- Filter pills: horizontal glass bar

---

## New Features to Consider

### 1. Robot Evolution Visualization
When a robot "evolves" (through focus milestones), show a mechanical transformation animation — parts assembling, panels sliding, glow intensifying.

### 2. Hangar Customization
Let users choose hangar themes: Standard, Neon Forge, Deep Space Dock, Crystal Cavern. Each changes the background glow colors and ambient particles.

### 3. Focus Streak Machine
Visual streak counter as a mechanical counter (flip-digit display). Each day adds a satisfying "click" animation.

### 4. Daily Forge Reward
Instead of a generic reward modal, show a mechanical arm assembling a reward package with gears and hydraulics.

### 5. Robot Workshop (New Tab/Section)
A dedicated area where users can view their robot in detail: rotate it, see stats, see abilities, customize its display colors. Pure showcase screen.

### 6. Ambient Sound Integration
Match sounds to the mechanical theme: distant machinery hum, subtle hydraulic hisses on button presses, electric crackle when starting a focus session.

---

## iOS HIG Compliance Checklist

- [ ] All tap targets minimum 44x44pt
- [ ] Safe area insets respected on all screens
- [ ] Dynamic Type support for text scaling
- [ ] Dark mode as primary (with potential light mode fallback)
- [ ] Native haptic feedback on all interactive elements
- [ ] SF Pro Display / SF Pro Text for body copy (via system font stack)
- [ ] SF Mono for numerical readouts (timer, stats)
- [ ] Reduce Motion support (prefers-reduced-motion)
- [ ] VoiceOver accessible labels on all interactive elements
- [ ] Swipe-to-go-back respected (no edge gesture conflicts)
- [ ] Status bar content visibility (light content on dark backgrounds)
- [ ] Scroll inertia and rubber-banding preserved
- [ ] No custom alert dialogs — use native iOS patterns
- [ ] Increase Contrast accessibility mode support

---

## Implementation Priority

### Phase 1: Foundation (Core Design System)
1. New CSS variables and glass panel system
2. Remove all retro/pixel CSS classes
3. New color scheme across all CSS custom properties
4. Update Tailwind config for new color tokens
5. Tab bar redesign
6. Top status bar redesign

### Phase 2: Home Screen
1. HangarBackground → new layered gradient system
2. ChargingBay → circular platform with glow
3. ChargeBar → mechanical gauge
4. DisplayBay → glass pods
5. HangarStats → minimal readouts

### Phase 3: Timer
1. Circular gauge timer display
2. Timer presets → glass pills
3. Timer controls → glass buttons
4. Background themes update

### Phase 4: Shop (Dark Mode Conversion)
1. Shop container → dark glass
2. All shop cards → glass panels
3. Premium card → gradient border
4. Tab pills → glass style
5. Purchase dialogs → glass modals

### Phase 5: Collection + Challenges
1. Collection grid → glass cards
2. Bot detail views → glass panels
3. Challenge cards → glass panels
4. Progress indicators → energy bars

### Phase 6: Settings + Onboarding
1. Settings → clean dark glass groups
2. Onboarding → boot sequence theme
3. Reward modals → mechanical animation

### Phase 7: Robot Assets
1. Set up PixelLab pipeline
2. Generate hero reference robot
3. Batch generate all robot assets using style reference
4. Replace SVG paths with new PNG assets
5. Update RobotDatabase.ts image configs

---

## Typography System

```css
/* System font stack — SF Pro on iOS, system default elsewhere */
--font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
--font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
--font-mono: "SF Mono", ui-monospace, "Cascadia Mono", "Segoe UI Mono", Menlo, monospace;

/* Type scale */
--text-hero: 34px / 1.1;      /* Main timer, hero stats */
--text-title: 22px / 1.2;     /* Screen titles */
--text-heading: 17px / 1.3;   /* Section headings */
--text-body: 15px / 1.4;      /* Body text */
--text-caption: 13px / 1.4;   /* Captions, labels */
--text-micro: 11px / 1.3;     /* Badges, tiny labels */
--text-mono-lg: 28px / 1.0;   /* Timer display */
--text-mono-sm: 13px / 1.0;   /* Stat readouts */
```

---

## Animation System

All animations follow a "mechanical" feel — deliberate, weighted, with slight overshoots that feel like hydraulic dampening.

```css
/* Mechanical easing curves */
--ease-hydraulic: cubic-bezier(0.16, 1, 0.3, 1);     /* Smooth with weight */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);    /* Overshoot, settle */
--ease-pressure: cubic-bezier(0.65, 0, 0.35, 1);     /* Building pressure */

/* Standard durations */
--duration-instant: 100ms;   /* Tap feedback */
--duration-fast: 200ms;      /* State changes */
--duration-normal: 350ms;    /* Panel transitions */
--duration-slow: 600ms;      /* Screen transitions */
--duration-ambient: 3000ms;  /* Background loops */
```

Key animations:
- **Robot idle**: very subtle float up/down (2px, 3s cycle) — "anti-gravity" feel
- **Charging pulse**: concentric rings expand outward from platform (radar-like)
- **Tab switch**: panels slide with hydraulic easing, slight bounce at end
- **Button press**: scale down to 0.95, spring back with overshoot
- **Gauge fill**: sweeping arc with glowing leading edge
- **Card appear**: fade in + translate up 8px, staggered per card
- **Reward claim**: mechanical "stamp" — quick slam down, bounce, glow burst

---

*This plan covers the complete visual overhaul. The core principle: dark, mechanical, glass, with robots as the only colorful heroes.*
