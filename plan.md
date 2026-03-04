# Plan: Make Island Look Like Forest App — Pixel Perfect

## What's Wrong Right Now (from screenshot analysis)

Looking at the current island vs the Forest app reference:

1. **The diamond is paper-thin** — it's a flat 2D diamond with no visible thickness/depth. Forest has a **chunky 3D slab** — you can see the dirt/earth side walls clearly, about 15-20% of the total island height. It looks like a thick piece of land floating in the air, not a flat piece of paper.

2. **The aspect ratio is wrong** — current is `2:1` (too wide and flat). Forest's island is closer to `2:1.2` or `5:3` — still wider than tall, but the visible earth thickness makes it feel substantial. The grass top is a diamond but the overall container needs extra height at the bottom for the earth walls.

3. **No visible earth/dirt side walls** — Forest has two clearly visible side faces of the island (the front-left face and front-right face), rendered as brown/earth colored parallelograms. This is the classic isometric cube side effect. Currently the `.pet-land__island-edge` is just a slightly offset diamond behind the grass — it doesn't create visible 3D side walls.

4. **The grass is too flat green** — Forest's grass has more warmth and texture. It's a richer, warmer green with subtle tonal variation, not the bright lime green we have. Forest uses something like `#6BAF3D` to `#4E8C2A` range — more natural.

5. **Grid lines are visible and ugly** — The diagonal grid overlay at 0.08 opacity creates an unnatural checkerboard look. Forest has NO visible grid lines. The surface is clean grass.

6. **Pets are not properly spread** — In your screenshot, all the pets are bunched toward the center. The current TILE_W=7.8 and TILE_H=3.9 push positions WAY outside the 0-100% range (max offset is ±9*7.8 = ±70%, meaning x ranges from -20 to 120). The clip-path cuts most off, leaving only center pets visible. Need to fix to ~4.9 each.

7. **Empty slot markers are visible** — Those tiny green rotated squares are visual noise. Forest shows NO empty slot indicators — the empty grass is just clean.

8. **The shadow is barely visible** — Forest has a more prominent, wider shadow beneath the island that really sells the floating effect.

9. **Sky gradient ends too cold** — The bottom of the sky is `#F0F4E8` which is a cold grey-green. Forest uses warmer tones at the horizon.

10. **No distinct left/right island faces** — In true isometric, a raised block has 3 visible faces: top (grass), front-left wall, front-right wall. Each wall should be a different shade of brown to simulate lighting (left slightly lighter, right slightly darker).

---

## The Fix: Build a Proper Isometric 3D Slab

### Core Concept

The island is NOT just a flat diamond clip-path. It's a **3D isometric block** with:
- **Top face**: Diamond-shaped grass surface (the play area)
- **Left face**: Parallelogram — left dirt/earth wall (lighter brown)
- **Right face**: Parallelogram — right dirt/earth wall (darker brown)

All three faces are separate CSS elements, precisely positioned to form a seamless isometric cube/slab.

```
        ◇  ← top point of diamond (grass)
       / \
      /   \
     / GRASS\
    /   TOP   \
   ◇───────────◇  ← left and right points
    \  LEFT  /  \
     \ FACE /    \
      \    / RIGHT\
       \  /  FACE  \
        ◇───────────◇  ← bottom edges of side walls
```

In CSS terms (percentage-based clip-paths within the full container):
- **Top face (grass)**: `clip-path: polygon(50% 0%, 100% 40%, 50% 80%, 0% 40%)` — diamond in top ~80%
- **Left face**: `clip-path: polygon(0% 40%, 50% 80%, 50% 100%, 0% 60%)` — parallelogram from left
- **Right face**: `clip-path: polygon(100% 40%, 50% 80%, 50% 100%, 100% 60%)` — parallelogram from right

Container `aspect-ratio` changes from `2/1` to `2/1.25` to fit the earth walls below the grass.

---

## Detailed Changes by File

### 1. `src/data/islandPositions.ts`

#### A. Fix pet spread — correct tile spacing

The pets are bunching because TILE_W=7.8 pushes positions to ±70% offset from center — way outside the diamond. Only center pets are visible.

**Math**: For a 10x10 grid with centered rows/cols, the max isometric coordinate deviation is ±9 steps (from corner `(-4.5,-4.5)` to `(4.5,4.5)`). For positions to span ~6% to ~94% of the pets-layer:
- `9 * TILE_W = 44` → `TILE_W ≈ 4.9`
- `9 * TILE_H = 44` → `TILE_H ≈ 4.9`

```ts
const TILE_W = 4.9;  // was 7.8
const TILE_H = 4.9;  // was 3.9
```

#### B. Reduce jitter slightly
```ts
const jx = (seededRandom(i * 7 + 1) - 0.5) * 1.0;  // was 1.6
const jy = (seededRandom(i * 13 + 2) - 0.5) * 0.6;  // was 1.0
```

---

### 2. `src/styles/pet-land.css`

#### A. Island container — new proportions
```css
.pet-land__island-container {
  aspect-ratio: 2 / 1.25;  /* was 2/1 — taller to fit earth walls */
  transform-origin: center 40%;  /* pivot at grass center, not container center */
}
```

#### B. Grass surface — repositioned to top 80%
```css
.pet-land__island-surface {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 80%;  /* Only top portion — bottom 20% is for earth walls */
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  background: /* warmer grass colors */
    linear-gradient(165deg, #7ABF3E 0%, #6BAF35 25%, #5EA02C 50%, #519024 75%, #468020 100%);
}
```

#### C. Left earth wall — new element
```css
.pet-land__island-left-wall {
  position: absolute;
  top: 0; left: 0; right: 0; height: 100%;
  clip-path: polygon(0% 40%, 50% 80%, 50% 100%, 0% 60%);
  background: linear-gradient(180deg, #8B6D4A 0%, #7A5C3B 20%, #6B4D2F 50%, #5C3D22 80%, #4A3118 100%);
  z-index: 1;
}
```

#### D. Right earth wall — new element (slightly darker = shadow side)
```css
.pet-land__island-right-wall {
  position: absolute;
  top: 0; left: 0; right: 0; height: 100%;
  clip-path: polygon(100% 40%, 50% 80%, 50% 100%, 100% 60%);
  background: linear-gradient(180deg, #7A5C3B 0%, #6B4D2F 20%, #5C3D22 50%, #4A3118 80%, #3A2510 100%);
  z-index: 1;
}
```

#### E. Delete grid overlay (`.pet-land__island-grid`)
#### F. Delete old edge (`.pet-land__island-edge`)
#### G. Delete slot markers (`.island-slot-marker`)

#### H. Pets layer — match new grass area
```css
.pet-land__pets-layer {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 80%;  /* Match grass area */
  clip-path: polygon(50% 3%, 97% 50%, 50% 97%, 3% 50%);
}
```

#### I. Bigger, warmer shadow
```css
.pet-land__island-shadow {
  bottom: -6%;
  left: 12%; right: 12%;
  height: 28px;
  filter: blur(10px);
}
```

#### J. Warmer sky gradient
Bottom stops change from `#F0F4E8` → `#F2ECDA` / `#EDE4CC`

#### K. Both earth walls get subtle strata lines via `::after` pseudo-elements

---

### 3. `src/components/PetLand.tsx`

#### A. Update DOM structure
Replace:
```tsx
<div className="pet-land__island-grid" />
<div className="pet-land__island-edge" />
```
With:
```tsx
<div className="pet-land__island-left-wall" />
<div className="pet-land__island-right-wall" />
```

#### B. Remove empty slot marker rendering
In `slotElements`, when `cell` is null, return `null` instead of rendering `<div className="island-slot-marker" ...>`.

---

### 4. `src/components/IslandPet.tsx`

No changes needed. The component is already clean.

---

## Files Changed Summary

| File | What changes |
|------|-------------|
| `src/data/islandPositions.ts` | Fix TILE_W/TILE_H from 7.8/3.9 → 4.9/4.9, reduce jitter |
| `src/styles/pet-land.css` | 3D slab with left+right earth walls, grass in top 80%, warmer colors, no grid, no slot markers, bigger shadow, warmer sky |
| `src/components/PetLand.tsx` | Add wall divs, remove grid/edge/marker divs, stop rendering slot markers |

## Implementation Order

1. `islandPositions.ts` — Fix spacing math (fixes pet clustering)
2. `pet-land.css` — Full island shape rewrite (3D slab)
3. `PetLand.tsx` — Update DOM structure
4. Typecheck → commit → push
