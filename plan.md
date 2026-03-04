# Plan: Generate Polar Bear Pet Sprites via Pixel Lab API (3 Growth Stages)

## Goal

Create a new **polar bear** pet species with 3 separate sprite variants — **baby, adolescent, and adult** — using the Pixel Lab API. This is the first pet with per-growth-stage art (currently all pets use 1 sprite scaled by CSS). The polar bear will be the template for upgrading all 20 species to have distinct growth art.

## Current State

- All 20 pets use a single 48x48 PNG sprite, scaled via CSS (`0.65×` baby, `0.82×` adolescent, `1.0×` adult)
- Existing script `scripts/generate-island-decorations.ts` already calls the Pixel Lab v2 API with bitforge + pixflux fallback — we'll follow the same pattern
- API base: `https://api.pixellab.ai/v2`, key already in use
- Style reference: use existing `bunny.png` for consistent pixel art style

## Steps

### Step 1: Create `scripts/generate-pet-sprites.ts`

A reusable generation script following the pattern in `generate-island-decorations.ts`. It will:

1. Define 3 growth-stage configs for polar bear:
   - **Baby** (48x48): `"tiny cute baby polar bear cub, chibi pixel art, front-facing, sitting, very small round fluffy white body, tiny black eyes and nose, stubby paws, adorable, game collectible pet sprite"`
   - **Adolescent** (48x48): `"cute young polar bear, chibi pixel art, front-facing, standing, medium white fluffy body, curious expression, black eyes and nose, game collectible pet sprite"`
   - **Adult** (48x48): `"majestic polar bear, chibi pixel art, front-facing, standing tall, large white fluffy body, confident expression, black eyes and nose, strong paws, game collectible pet sprite"`

2. Use bitforge with bunny.png as style reference (consistency with existing pets), pixflux as fallback
3. Output to `public/assets/pets/polar-bear-baby.png`, `polar-bear-adolescent.png`, `polar-bear-adult.png`
4. Also generate a default `polar-bear.png` (the adolescent variant, used as the species icon in collection UI)

**Negative prompts**: `"humanoid, human, person, realistic, photorealistic, 3D, side view, background, text, watermark, blurry"`

### Step 2: Run the script and iterate on prompts

Generate sprites and visually verify they:
- Look distinctly different across growth stages (baby is small/sitting, adult is tall/confident)
- Are recognizable as polar bears at 40-58px display size
- Have transparent backgrounds
- Match the cute pixel art style of existing pets
- Have clean outlines that work with rarity glow effects

May need 2-3 iterations adjusting prompts, `style_strength`, and `text_guidance_scale`.

### Step 3: Add polar bear to `PetDatabase.ts`

Add a new entry to `PET_DATABASE`:
```typescript
{ id: 'polar-bear', name: 'Polar Bear', rarity: 'rare', unlockLevel: 28,
  description: 'A mighty polar bear that thrives in long focus sessions.',
  imagePath: '/assets/pets/polar-bear.png' }
```

Rarity: **rare** (fits between wolf at 25 and crane at 32).

### Step 4: Update `IslandPet.tsx` to support per-growth sprite paths

Currently `IslandPet.tsx` loads one image per species via `imagePath`. Update the image resolution logic:

```typescript
// Try growth-specific sprite first, fall back to base sprite
const growthImagePath = `/assets/pets/${petId}-${size}.png`;  // e.g. polar-bear-baby.png
const baseImagePath = pet.imagePath;                           // e.g. /assets/pets/polar-bear.png
```

Use an `<img>` with `onError` fallback — if the growth-specific file doesn't exist (for older pets that still use single sprites), it gracefully falls back to the base sprite. This way:
- Polar bear (new): shows baby/adolescent/adult art
- All other pets (existing): continue using their single sprite with CSS scaling
- Future pets: just add growth PNGs and they auto-upgrade

### Step 5: Update CSS scaling for growth-aware pets

For pets with per-growth sprites, the CSS growth scale (0.65/0.82/1.0) should still apply but can be softened since the art itself conveys size difference. Optionally keep a gentler scale (e.g., 0.8/0.9/1.0) for growth-aware pets so babies still appear slightly smaller on the island.

### Step 6: Typecheck, build, commit, push

Run `npm run typecheck` and `npm run build` to verify no regressions, then commit and push.

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `scripts/generate-pet-sprites.ts` | **Create** | Pixel Lab API script for generating pet growth sprites |
| `public/assets/pets/polar-bear.png` | **Create** | Default polar bear sprite (adolescent, used as icon) |
| `public/assets/pets/polar-bear-baby.png` | **Create** | Baby polar bear sprite |
| `public/assets/pets/polar-bear-adolescent.png` | **Create** | Adolescent polar bear sprite |
| `public/assets/pets/polar-bear-adult.png` | **Create** | Adult polar bear sprite |
| `src/data/PetDatabase.ts` | **Edit** | Add polar bear species entry |
| `src/components/IslandPet.tsx` | **Edit** | Support per-growth sprite paths with fallback |

## Prompt Strategy

The key to cute animal sprites (not humanoid):
- Always include "chibi pixel art" for the kawaii collectible style
- Use animal-specific body descriptors ("fluffy white body", "stubby paws") not human traits
- "front-facing" to match island display
- "game collectible pet sprite" to anchor the style
- Negative prompt excludes humanoid/realistic/3D
- Baby should be "sitting" or "curled up" for distinct silhouette
- Adult should be "standing tall" for clear size progression
