# Plan: Fix Island — Proper 3D Block, Thicker Cliff, No Pet Clipping

## Issues to Fix (from user feedback)
1. **Looks like 2 squares on top of each other** — The current edge is just an offset diamond behind the grass. The corners don't line up seamlessly. Need proper isometric slab where the grass top and dirt walls form ONE continuous shape with seamless corner joins.
2. **Dirt is just flat brown/green** — Needs texture, strata lines, subtle rock details to look like actual earth/cliff
3. **Cliff too thin** — Need to make it significantly thicker so the island looks like a chunky floating block of land
4. **Pets cut off at top** — The pets-layer `clip-path` clips too aggressively at the top (4% inset). Need to relax it so pets near the top of the diamond aren't clipped.

## Implementation

### Step 1: `pet-land.css` — Rebuild island as proper isometric block

**Container**: `aspect-ratio: 2 / 1.3` (was `2/1`) — gives substantial space below the grass for thick cliff walls.

**Grass surface** — occupies top ~77% of container:
- `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`
- Height: 77% of container
- Same warm grass gradients

**Left cliff wall** — seamless with grass bottom-left edge:
- Clip-path forms a parallelogram from the left point of the grass diamond down to the bottom point
- `polygon(0% 38.5%, 50% 77%, 50% 100%, 0% 61.5%)` — these numbers match exactly: grass left point is at `(0%, 38.5%)` and grass bottom is at `(50%, 77%)`
- Lighter brown (lit side): `#8B7355` → `#6B4D2F` → `#5C3D22`
- Subtle horizontal strata lines via pseudo-element

**Right cliff wall** — seamless with grass bottom-right edge:
- `polygon(100% 38.5%, 50% 77%, 50% 100%, 100% 61.5%)` — mirrors left wall
- Darker brown (shadow side): `#7A5C3B` → `#5C3D22` → `#3A2510`
- Slightly different strata for variety

**Key math**: If grass is 77% tall with diamond clip `polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)`:
- In container coords: top=0%, left-right=38.5% (77%×50%), bottom=77%
- Wall height = 100% - 77% = 23% of container = thick cliff

**Delete**: `.pet-land__island-edge` entirely (replaced by two walls)

**Fix pets layer clip**: Relax top inset from 4% to 1% so pets at the top of the diamond aren't cut. Change `clip-path: polygon(50% 1%, 97% 50%, 50% 99%, 3% 50%)` and match to grass-area height.

**Shadow**: Adjust position for taller container — move to `bottom: -4%`

### Step 2: `PetLand.tsx` — Update DOM

Replace:
```tsx
<div className="pet-land__island-edge" />
```
With:
```tsx
<div className="pet-land__island-left-wall" />
<div className="pet-land__island-right-wall" />
```

### Step 3: `islandPositions.ts` — No changes needed
Tile spacing (4.9/4.9) and positions are already correct. The pets-layer dimensions will match the grass area so positions stay valid.

### Step 4: Typecheck + build + commit + push

## Files Changed
| File | Changes |
|------|---------|
| `src/styles/pet-land.css` | Rebuild as 3D block: grass top 77%, left+right cliff walls 23%, strata texture, delete old edge, relax pet clip-path |
| `src/components/PetLand.tsx` | Replace edge div with left-wall + right-wall divs |
