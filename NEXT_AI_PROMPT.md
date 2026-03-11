# PhoNo — Remaining Tasks Prompt

> Use this prompt to guide the next AI session through all remaining work items. Read `CLAUDE.md` first for full architecture context.

---

## Task 1: Update Onboarding Flow for Pet/Island Theme

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

## Task 2: Verify Debug Buttons Removed

**Context**: There was a debug button in `PetLand.tsx` for testing pet placement. It may have already been removed (grep shows no matches currently). **Verify it's gone** — search for any remaining debug/test buttons, console.logs that expose game state, or dev-only UI across these files:
- `src/components/PetLand.tsx`
- `src/components/GameUI.tsx`
- `src/components/TopStatusBar.tsx`

If any debug UI remains, remove it. If already clean, mark this as done.

---

## Execution Order

1. **Task 2** first (quick verification, likely already done)
2. **Task 1** (onboarding update)

## Notes

- Run `npm run typecheck` after code changes to verify no TypeScript errors
- Run `npm run test:run` to make sure nothing breaks
- The app uses Capacitor — no need to worry about native iOS code for these tasks
- The `website/` directory is a separate Vite project (not the main app)
