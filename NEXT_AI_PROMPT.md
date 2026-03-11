# PhoNo — Remaining Tasks Prompt

> Read `CLAUDE.md` first for full architecture context.

---

## Task 1: Update Onboarding Flow for Pet/Island Theme

The onboarding (`src/components/onboarding/OnboardingFlow.tsx`) still references the old "Star Wizard" character from a previous robot-themed version. It uses a walking sprite animation (`/assets/sprites/humanoid/star-wizard-walk.png`) and wizard-themed text. The app is now pet/island-themed.

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

**Important**: The `WalkingPetSprite` component uses spritesheet animation. If replacing with static pet images, you can use a simple `<img>` tag with the pet PNG instead. The component is defined in the same file. Pet sprites are at `public/assets/pets/` (e.g., `bunny.png`, `capybara.png`, `fox.png`) — 48×48 pixel art PNGs.

---

## Task 2: Verify Debug Buttons Removed

There was a debug "Award Pet" button in `PetLand.tsx` for testing. Verify it's gone — search for any remaining debug/test buttons, console.logs that expose game state, or dev-only UI across:
- `src/components/PetLand.tsx`
- `src/components/GameUI.tsx`
- `src/components/TopStatusBar.tsx`

If any debug UI remains, remove it. If already clean, mark as done.

---

## Task 3: Connect Waitlist Form to Supabase Backend

The marketing website (`website/`) is fully built but the waitlist form is fake — it simulates signups with `setTimeout` and stores everything in localStorage.

**File**: `website/src/components/WaitlistForm.tsx`

**Current fake behavior** (all need replacing with real backend):
- Line ~53: `// Simulate API call (replace with Supabase edge function later)` — uses `setTimeout(r, 1200)`
- Line ~29: `// Simulate referral count for demo` — reads from localStorage only
- Line ~37: Waitlist counter = `847 + random(0-200)` on every page load (cosmetic)
- Email + referral code stored only in localStorage (`phono_referral_code`, `phono_email`)
- Referral link format is `phono.app/?ref=CODE` but no server processes the `ref` param

**What to build**:

1. **Supabase edge function** (`supabase/functions/waitlist-signup/index.ts`):
   - Accept POST with `{ email, referralCode?, referredBy? }`
   - Insert into a `waitlist` table (create migration if needed)
   - Generate a unique referral code for new signups
   - Track referral relationships (who referred whom)
   - Return `{ success, referralCode, referralCount, waitlistPosition }`
   - Rate limit / deduplicate by email

2. **Supabase table** — `waitlist`:
   - `id` (uuid, primary key)
   - `email` (text, unique)
   - `referral_code` (text, unique) — auto-generated on signup
   - `referred_by` (text, nullable) — referral code of the person who referred them
   - `created_at` (timestamptz)

3. **Update `WaitlistForm.tsx`**:
   - Replace the fake `setTimeout` with a real fetch to the edge function
   - On page load, check URL for `?ref=CODE` param and store it
   - After signup, show real referral count from the server response
   - Keep the existing UI/UX — just swap the data layer

4. **Waitlist counter**: Either query a real count from the edge function, or remove the fake counter entirely.

**Supabase context**: The main app already uses Supabase. The client is set up in `src/integrations/supabase/`. The website is a separate project so it needs its own lightweight Supabase client (just `@supabase/supabase-js` — the URL and anon key can be shared). Existing edge functions live in `supabase/functions/` with a shared CORS config at `supabase/functions/_shared/cors.ts`.

---

## Task 4: Deploy Website to Vercel

The website at `website/` is ready to deploy. `website/vercel.json` already has the SPA rewrite config.

**Steps**:
1. Verify `cd website && npm run build` succeeds
2. Make sure environment variables are documented (Supabase URL + anon key needed for the waitlist form)
3. Add a `website/.env.example` with the required vars
4. Document the deployment steps in a comment or README

**Note**: Actual Vercel deployment requires CLI access (`vercel` command) or manual dashboard setup — if CLI isn't available, just ensure everything is ready and document the steps.

---

## Execution Order

1. **Task 2** first (quick verification, likely already done)
2. **Task 1** (onboarding update)
3. **Task 3** (waitlist backend — creates the edge function + updates the form)
4. **Task 4** (deployment prep)

## After completing:
- Run `npm run typecheck` on the main app after Task 1
- Run `npm run test:run` on the main app
- Run `cd website && npm run build` after Task 3 to verify the website still builds
