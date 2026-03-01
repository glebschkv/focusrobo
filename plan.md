# BotBlock Design Overhaul Plan

## Problem Assessment

The app has a solid architecture and good design concept ("Atelier" white surrealist gallery), but the execution falls flat in critical areas:

1. **Robot assets are placeholder SVGs** — Every robot is the same rectangle-body template with only color swaps. This kills the entire collectible loop (why collect if every bot looks identical?)
2. **Home screen feels empty/cheap** — Nice gallery concept but with generic assets, it looks like a wireframe
3. **No visual differentiation between bots** — The core monetization driver (collect robots) has zero visual appeal
4. **Status bar and navigation need polish** — Functional but doesn't feel premium

## Design Overhaul Strategy

### Phase 1: Generate Premium Robot Pixel Art (PixelLab API)
Generate 2 hero robot assets using PixelLab's `generateImagePixflux` endpoint:

**Robot 1 — "Bolt Bot" (Assembly Line starter, common)**
- Prompt: Cute chibi-style industrial robot, small and friendly, metallic blue body, round head with big glowing blue eyes, small antenna, stubby arms with wrench hands, conveyor-belt feet, warm personality
- 128x128, transparent background, single-color black outline, basic shading, high detail

**Robot 2 — "Omega Prime" (Cyber District endgame, legendary)**
- Prompt: Epic powerful cyberpunk mech robot, glowing cyan visor, sleek dark chrome armor with neon cyan accents, energy sword on back, imposing stance, holographic particles, futuristic
- 128x128, transparent background, single-color black outline, detailed shading, high detail

These two cover the "start" and "aspirational end" of the collection journey — essential for monetization.

### Phase 2: Home Screen (MechHangar) Polish
**File: `src/components/hangar/ChargingBay.tsx`**
- Remove `imageRendering: pixelated` (PixelLab assets will be proper pixel art PNGs, not upscaled SVGs)
- Enhance the aura/glow effect — make it more dramatic with animated pulsing
- Add subtle particle effects around the robot (floating dots/sparkles)
- Improve the reflection to be more glass-like
- Scale up the robot display for more visual impact

**File: `src/components/hangar/HangarBackground.tsx`**
- Add a subtle gradient mesh/noise texture for depth
- Enhance the architectural perspective lines with gentle animation
- Add a soft vignette effect around edges

**File: `src/components/hangar/DisplayBay.tsx`**
- Add rarity-colored border glow for mini bot cards
- Improve the card styling with glassmorphic background
- Add micro-interaction on tap (scale bounce + haptic)

**File: `src/components/hangar/ChargeBar.tsx`**
- Redesign as a sleeker, more premium progress bar
- Add animated gradient fill (shimmer effect while charging)
- Better typography and spacing

**File: `src/components/hangar/HangarStats.tsx`**
- Redesign from plain text to pill-style stat badges
- Add icons for each stat
- Subtle glassmorphic background

### Phase 3: Top Status Bar Polish
**File: `src/components/TopStatusBar.tsx`**
- Refine the level badge — crisper gradients, better contrast
- Improve coin chip — add shimmer animation, better gold tones
- Polish streak chip — better fire glow when active
- Improve overall spacing and visual weight balance
- Ensure it doesn't compete with robot display

### Phase 4: Tab Bar Polish
**File: `src/components/IOSTabBar.tsx` + `src/index.css`**
- Refine the center Focus button — stronger gradient, better shadow
- Add subtle active state animation for tab switches
- Improve icon weight consistency
- Polish compact mode transition

### Phase 5: CSS Design Token Refinements
**File: `src/index.css`**
- Slightly warmer, richer shadows (more depth)
- Add premium micro-animation keyframes (shimmer, pulse-glow)
- Refine the glass morphism effects for more depth
- Add a premium color accent for legendary items (gold shimmer)

## Implementation Order
1. Generate robot assets via PixelLab API → save as PNGs to `public/assets/robots/`
2. Update ChargingBay.tsx — remove pixelated rendering, enhance display
3. Update HangarBackground.tsx — add depth and atmosphere
4. Update DisplayBay.tsx — glassmorphic cards with rarity glow
5. Update ChargeBar.tsx — premium progress bar
6. Update HangarStats.tsx — pill badges with icons
7. Polish TopStatusBar.tsx — refine chips and badges
8. Polish IOSTabBar.tsx — center button and transitions
9. Refine CSS tokens in index.css — shadows, animations, glass effects

## Profitability Impact
- **Premium assets drive collection desire** → users want to unlock the next cool-looking robot
- **Aspirational endgame bot (Omega Prime)** visible in shop → motivates premium subscription
- **Polished UI builds trust** → users more willing to pay for subscriptions
- **Every screen should feel worth paying for** → premium-tier presentation
