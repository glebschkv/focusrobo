# PhoNo — Remaining Tasks Prompt

> Use this prompt to guide the next AI session through all remaining work items. Read `CLAUDE.md` first for full architecture context.

---

## Task 1: Generate Final Pet Pixel Art Assets (HIGHEST PRIORITY)

**Context**: The app has 41 pet species, each with 4 PNG variants (base, baby, adolescent, adult) = 164 files total. Current assets are **48×48 placeholder PNGs** generated with Python Pillow — they look low-quality and need to be replaced with proper pixel art.

**Location**: `public/assets/pets/` (164 files)

**Requirements**:
- Generate pixel art pet sprites for all 41 species
- Each species needs 4 variants:
  - `{id}.png` — base/default sprite (used in collection UI, shop, tooltips)
  - `{id}-baby.png` — smallest growth size
  - `{id}-adolescent.png` — medium growth size
  - `{id}-adult.png` — largest growth size
- **Style**: Cute pixel art, front-facing, transparent background, suitable for a cozy game aesthetic
- **Size**: 48×48 pixels, RGBA PNG
- **Rendering**: Must look crisp with CSS `image-rendering: pixelated`
- Size variants should be visually distinguishable (baby = small/cute, adolescent = medium, adult = full-sized/detailed)
- All 5 rarities should have distinct visual quality levels (common = simple, legendary = detailed/magical)

**Full species list** (grouped by rarity):

**Common (16)**: bunny, chick, frog, hamster, duckling, capybara, hedgehog, turtle, bee, mouse, butterfly, elephant, monkey, sparrow, jellyfish, sloth

**Uncommon (10)**: fox, cat, corgi, penguin, shiba-inu, koala, raccoon, parrot, otter, seal

**Rare (9)**: deer, owl, panda, red-panda, wolf, arctic-fox, polar-bear, flamingo, crane

**Epic (4)**: dragon, tiger, axolotl, phoenix

**Legendary (2)**: unicorn, koi-fish

**File naming convention**: lowercase with hyphens, e.g. `arctic-fox.png`, `arctic-fox-baby.png`, `arctic-fox-adolescent.png`, `arctic-fox-adult.png`

**How they're used**:
- On the floating isometric island (home screen) — displayed at 56-84px responsive sizes with CSS scaling
- In the pet collection book — grid cards showing species
- In tooltips when tapping a pet on the island
- In the pet reveal modal after focus sessions
- On the marketing website (`website/public/pets/` — copy there too)

**PixelLab MCP tool available**: You have access to `create_character` for generating pixel art characters. Use `body_type: "quadruped"` with templates (bear, cat, dog, horse, lion) for 4-legged animals, and `body_type: "humanoid"` for bipedal/fantasy creatures. Generate south-facing views. After generation, download and crop/resize to 48×48.

---

## Task 2: Generate Higher-Fidelity Decoration Sprites

**Context**: 20 island decoration items exist with **48×48 Pillow-generated placeholder PNGs**. Need proper pixel art replacements.

**Location**: `public/assets/decorations/` (20 files)

**Full decoration list** (from `src/data/DecorationData.ts`):

| ID | Name | Category |
|----|------|----------|
| oak-tree | Oak Tree | trees |
| pine-tree | Pine Tree | trees |
| cherry-blossom | Cherry Blossom | trees |
| palm-tree | Palm Tree | trees |
| rose-bush | Rose Bush | flowers |
| sunflower-patch | Sunflower Patch | flowers |
| tulip-bed | Tulip Bed | flowers |
| mushroom-cluster | Mushroom Cluster | flowers |
| boulder | Boulder | rocks |
| mossy-rock | Mossy Rock | rocks |
| crystal | Crystal | rocks |
| small-pond | Small Pond | water |
| well | Well | water |
| fountain | Fountain | water |
| wooden-fence | Wooden Fence | structures |
| mailbox | Mailbox | structures |
| signpost | Signpost | structures |
| lamp-post | Lamp Post | structures |
| bench | Bench | fun |
| treasure-chest | Treasure Chest | fun |

**Requirements**:
- 48×48 pixel art PNGs with transparent backgrounds
- Style should match the pet sprites (cute, cozy pixel art)
- Trees/flowers should look good with the `sways: true` CSS animation
- Must look good on the isometric grass island
- Copy updated files to `website/public/decorations/` too

**PixelLab MCP tool**: Use `create_map_object` for generating these. Use `view: "high top-down"` or `"low top-down"` to match the isometric island perspective. Size 48×48.

---

## Task 3: Update Onboarding Flow for Pet/Island Theme

**Context**: The onboarding (`src/components/onboarding/OnboardingFlow.tsx`) still references the old "Star Wizard" character from a previous robot-themed version. It uses a walking sprite animation (`/assets/sprites/humanoid/star-wizard-walk.png`) and wizard-themed text. The app is now pet/island-themed.

**What needs changing**:
1. Replace the Star Wizard sprite with a pet-themed visual (e.g., show a cute pet sprite like the bunny or capybara, or a small island preview)
2. Update the `PRELOAD_SRCS` array (line 16-22) — remove wizard/sprite references, add pet assets
3. Update the `SparkleRing` context (line 99+) — rename/retheme from "wizard" to pet-appropriate
4. Update Step 1 "Welcome" screen (around line 530):
   - Replace `WalkingPetSprite` wizard animation with a static or animated pet image
   - Keep the text: "Every minute you stay focused earns you cute pets, XP, and coins. Build your own floating island!" (this is already correct)
5. Update Step 4 "Your Companion" (around line 760-825):
   - Currently shows "Star Wizard" with wizard.png icon and description "A young wizard in training who casts spells of concentration"
   - Replace with a pet-themed companion intro (e.g., show the player's first pet, or introduce the island concept)
   - Remove wizard icon and text references
6. Keep Steps 2 (How It Works) and 3 (Focus Shield) as-is — they're already pet/island-themed

**Important**: The `WalkingPetSprite` component uses spritesheet animation. If replacing with static pet images, you can use a simple `<img>` tag with the pet PNG instead. The component is defined in the same file.

---

## Task 4: Remove Debug "Award Pet" Button

**Context**: There was a debug button in `PetLand.tsx` for testing pet placement. It may have already been removed (grep shows no matches currently). **Verify it's gone** — search for any remaining debug/test buttons, console.logs that expose game state, or dev-only UI across these files:
- `src/components/PetLand.tsx`
- `src/components/GameUI.tsx`
- `src/components/TopStatusBar.tsx`

If any debug UI remains, remove it. If already clean, mark this as done.

---

## Task 5: Website Asset Sync

**Context**: The marketing website at `website/` has copies of pet and decoration assets. After generating new assets in Tasks 1-2, copy them to the website:
- `public/assets/pets/*` → `website/public/pets/*`
- `public/assets/decorations/*` → `website/public/decorations/*`

---

## Execution Order

1. **Task 4** first (quick verification, likely already done)
2. **Tasks 1 & 2** in parallel (asset generation — this is the bulk of the work)
3. **Task 3** (onboarding update — can reference new pet assets)
4. **Task 5** last (sync website assets after generation)

## Notes

- Run `npm run typecheck` after code changes to verify no TypeScript errors
- Run `npm run test:run` to make sure nothing breaks
- The app uses Capacitor — no need to worry about native iOS code for these tasks
- All image assets should be committed to git (they're tracked in the repo)
- The `website/` directory is a separate Vite project (not the main app)
