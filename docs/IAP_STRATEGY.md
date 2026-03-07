# PhoNo — IAP & Monetization Strategy

> Comprehensive in-app purchase strategy for PhoNo, a gamified focus timer with pet collection. This document covers competitor analysis, pricing rationale, product catalog design, subscription tiers, consumables, bundles, and revenue maximization tactics.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Competitive Landscape Analysis](#competitive-landscape-analysis)
3. [Current State Audit](#current-state-audit)
4. [Recommended IAP Architecture](#recommended-iap-architecture)
5. [Subscription Tiers — Redesigned](#subscription-tiers--redesigned)
6. [Coin Pack Pricing](#coin-pack-pricing)
7. [Starter & Limited Bundles](#starter--limited-bundles)
8. [Seasonal & Event Economy](#seasonal--event-economy)
9. [Gifting System](#gifting-system)
10. [Paywall & Conversion Strategy](#paywall--conversion-strategy)
11. [Anti-Churn & Retention Mechanics](#anti-churn--retention-mechanics)
12. [Revenue Projections & Modeling](#revenue-projections--modeling)
13. [Implementation Priority](#implementation-priority)
14. [App Store Compliance Notes](#app-store-compliance-notes)

---

## 1. Executive Summary

PhoNo's monetization should follow a **hybrid model**: a generous free tier that hooks users into the pet-collection loop, a premium subscription that amplifies the experience (not gates it), and consumable coin packs for impulse spenders. The egg/gacha system is PhoNo's strongest differentiator in the focus-timer market — no competitor has it — and should be the primary coin sink driving consumable revenue.

**Key recommendations:**
- Simplify from 4 subscription tiers to 3 (Free / Premium / Lifetime)
- Reprice subscriptions to $5.99/mo and $39.99/yr (competitive sweet spot)
- Add a weekly plan at $2.49/week for low-commitment users
- Restructure coin packs with better anchoring (5 tiers, $0.99–$49.99)
- Introduce time-limited Welcome Pack ($2.99, 24-hour window)
- Add seasonal egg events and limited-edition pets as the primary engagement/spending driver
- Implement a gifting system for viral growth
- Remove the Premium Plus tier (overcomplicates the offering, splits the subscriber base)

**Revenue target mix:** 60% subscriptions, 30% coin packs/consumables, 10% bundles/seasonal.

---

## 2. Competitive Landscape Analysis

### Market Positioning Map

```
                    HIGH PRICE
                        |
              Tide ($11.99/mo)
                        |
           Finch ($9.99/mo)
                        |
    -------- PhoNo TARGET ($5.99/mo) --------
                        |
     Forest ($5.99/mo)  |  Habitica ($4.99/mo)
                        |
         Focus Plant ($4.99/mo)
                        |
                    LOW PRICE
                        |
  SIMPLE ————————————————————————————— GAMIFIED
  (Tide, Forest)                (Habitica, PhoNo, Finch)
```

### Competitor Pricing Summary

| App | Monthly | Yearly | Lifetime | Consumables | Model |
|-----|---------|--------|----------|-------------|-------|
| Finch | $9.99 | $69.99 | — | None | Sub only |
| Tide | $11.99 | $59.99 | Yes (TBD) | None | Sub only |
| Forest | ~$5.99 | ~$35.99 | — | Crystals $0.99–$21.99 | Paid app + sub + consumables |
| Habitica | $4.99 | $47.99 | — | Gems from $0.99 | Sub + consumables |
| Focus Plant | $4.99 | — | — | None | Sub only |
| Study Bunny | — | — | — | Currency $0.99–$69.99 | Consumables + ads |
| Focus To-Do | $1.99 | — | $11.99 | None | Sub + lifetime |
| Flora | — | $1.99–$19.99 | — | Failure penalties | Charity model |
| BFT Bear | — | — | $1.99 | None | Paid upfront |
| Plantie | — | — | $1.99 | None | Ad removal |

### Key Competitive Insights

1. **Finch is the closest comparable** — pet collection + gamification + self-care. Generates ~$2M/month revenue. Validates that users pay $9.99/mo for this model. But Finch has broader wellness positioning (journaling, exercises, mood tracking) that justifies the premium.

2. **No competitor has egg/gacha mechanics** — PhoNo's randomized pet acquisition with rarity tiers is genuinely unique in the focus-timer space. This is the #1 differentiator and should be the core monetization hook.

3. **$4.99–$5.99/mo is the sweet spot** for gamified focus apps. Finch and Tide command premiums ($9.99+) because they offer broader wellness features. PhoNo's tighter focus on timer + pets warrants the mid-range.

4. **Dual revenue streams win** — Forest (sub + crystals) and Habitica (sub + gems) generate more than pure-subscription apps. PhoNo's sub + coin model is the right structure.

5. **Lifetime purchases are risky** — Focus To-Do ($11.99 lifetime) and BFT ($1.99) are among the lowest-revenue apps. Price lifetime high ($49.99+) to serve as a premium anchor, not an escape hatch.

6. **Ad-free is table stakes** for the premium tier of this market. Forest, Finch, Habitica, Tide = all ad-free. PhoNo should never introduce ads.

---

## 3. Current State Audit

### What Exists Today

**Subscriptions (4 tiers):**
- Premium: €4.99/mo, €39.99/yr
- Premium+: €8.99/mo, €64.99/yr
- Lifetime: €179.99

**Coin Packs (5 tiers):**
- €2.99 (1,800 coins) → €99.99 (150,000 coins)

**Bundles (4 one-time purchases):**
- €2.99 → €29.99

### Problems Identified

| Issue | Impact |
|-------|--------|
| **Premium vs Premium+ confusion** | Two subscription tiers that are hard to differentiate. Users face choice paralysis. The benefits delta (1.5x→2x multiplier, 2→5 streak freezes) is too subtle to justify nearly double the price. |
| **Premium+ is overpriced** | €8.99/mo for a focus timer is Finch/Tide territory without the breadth of features to justify it. |
| **Lifetime at €179.99 is too high** | At 3x yearly it's standard ratio, but for a focus timer app without the brand recognition of Calm/Headspace, this is a hard sell. Few users will spend €180 on a timer. |
| **Coin packs top out at €99.99** | The €99.99 King's Vault (150K coins) is excessive for this economy. No one needs 150K coins when legendary eggs cost 3K. That's 50 legendary eggs. The pack structure doesn't match actual spending patterns. |
| **Bundles feel generic** | "Traveler's Gift," "Explorer's Kit" — these are template RPG names that don't connect to the pet/island theme. |
| **Battle Pass defined but not implemented** | Product IDs exist in code but aren't in the product fetch list. Dead code. |
| **Multiplier divergence** | `premiumStore.ts` says 2x/3x/4x, `usePremiumStatus.ts` says 1.5x/2x/2.5x. Inconsistent and confusing. |
| **Legacy storage keys** | `petIsland_premium` instead of `nomo_` convention. Technical debt. |
| **No weekly subscription option** | Missing the 47% of iOS revenue that comes from weekly plans. |
| **No time-limited offers** | No welcome pack, no seasonal deals, no FOMO mechanics driving purchases. |
| **No gifting** | Missing viral growth loop. |

---

## 4. Recommended IAP Architecture

### Overview

```
┌─────────────────────────────────────────────────┐
│                  IAP CATALOG                      │
├─────────────────────────────────────────────────┤
│                                                   │
│  SUBSCRIPTIONS (recurring revenue core)           │
│  ├── PhoNo Premium Weekly    — $2.49/week     │
│  ├── PhoNo Premium Monthly   — $5.99/month    │
│  ├── PhoNo Premium Yearly    — $39.99/year    │
│  └── PhoNo Lifetime          — $49.99 once    │
│                                                   │
│  COIN PACKS (impulse + whale capture)            │
│  ├── Handful of Coins    — $0.99  →    500       │
│  ├── Pouch of Coins      — $2.99  →  2,000      │
│  ├── Chest of Coins      — $6.99  →  5,500      │
│  ├── Treasure Trove      — $14.99 → 14,000      │
│  └── Dragon's Hoard      — $29.99 → 35,000      │
│                                                   │
│  BUNDLES (one-time, themed)                      │
│  ├── Welcome Pack         — $2.99 (24hr window)  │
│  ├── Egg Hunter Pack      — $4.99                │
│  └── Island Master Pack   — $14.99               │
│                                                   │
│  SEASONAL (limited-time)                         │
│  ├── Seasonal Egg Bundle  — $3.99–$9.99          │
│  ├── Holiday Pet Pack     — varies               │
│  └── Anniversary Bundle   — varies               │
│                                                   │
│  GIFTS (viral growth)                            │
│  ├── Gift a Subscription  — same as sub prices   │
│  └── Gift Coins           — same as pack prices  │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Why Simplify to One Premium Tier

The current Premium / Premium+ split fails for several reasons:

1. **Choice paralysis** — Two similar tiers with marginal differences confuse users at the paywall. Research shows 2-3 options on a paywall converts 44-61% better than more, but the options need to be clearly distinct (e.g., monthly vs yearly), not "slightly better version of the same thing."

2. **Perceived value gap** — Premium+ costs 80% more than Premium but only offers incrementally more multipliers and streak freezes. Users can't easily articulate why they'd pay €8.99 vs €4.99.

3. **Market comparison** — At €8.99/mo, Premium+ competes with Finch ($9.99/mo) which has a much broader feature set. Users will compare.

4. **Simplicity sells** — The most successful apps in this space (Forest, Habitica, Focus Plant) offer ONE premium tier. Finch also has ONE tier. The "good/better/best" approach only works when tiers map to clearly different user needs (e.g., personal vs team vs enterprise).

**Recommendation:** Merge the best of both tiers into a single "PhoNo Premium" at the lower price point. This feels generous and removes friction.

---

## 5. Subscription Tiers — Redesigned

### Free Tier (unchanged core, generous)

Everything that makes the app fun stays free. This is critical — the free tier IS the marketing funnel.

| Feature | Free |
|---------|------|
| Focus timer (all durations) | Yes |
| Pet collection from sessions | Yes |
| Island building & archiving | Yes |
| Basic eggs (Common Egg) | Yes (coin-purchased) |
| 1 ambient sound layer | Yes |
| Basic analytics | Yes |
| Daily login rewards | Yes |
| Daily/weekly quests | Yes |
| Achievements | Yes |
| Coin earning (base rate) | 1x |
| XP earning (base rate) | 1x |
| Streak tracking | Yes |
| Streak freezes | 0 included |

**Rationale:** The free user must experience the full dopamine loop — timer → pet reward → island placement → collection growth. If this loop is gated, users never get hooked enough to convert.

### PhoNo Premium — $5.99/mo | $39.99/yr | $2.49/week

| Feature | Free | Premium |
|---------|------|---------|
| Coin multiplier | 1x | **2x** |
| XP multiplier | 1x | **2x** |
| Streak freezes per month | 0 | **3** |
| Ambient sound layers | 1 | **3** |
| Focus presets (saved) | 1 | **5** |
| Daily login coin multiplier | 1x | **2x** |
| Analytics | Basic | **Full** (heatmaps, trends, insights, records) |
| Egg discount | 0% | **15% off all eggs** |
| Exclusive monthly pet | No | **Yes** (1 exclusive species/skin per month) |
| Priority placement animation | No | **Yes** (special sparkle/glow on pet placement) |
| Custom island themes | Buy with coins | **All unlocked** |
| Weekly lucky spin | 1 spin | **3 spins** |
| Ad-free | Yes (always) | Yes (always) |
| Subscriber badge | No | **Yes** (profile flair) |

**Pricing Rationale:**

| Plan | Price | $/month | vs Monthly | Why This Price |
|------|-------|---------|------------|---------------|
| Weekly | $2.49 | $10.79/mo equiv | +80% premium | Low commitment entry. 47% of iOS revenue is weekly. 3-day trial converts at highest rate. Users who wouldn't commit monthly will try weekly. |
| Monthly | $5.99 | $5.99 | Baseline | Sits between Habitica ($4.99) and Forest ($5.99). Below Finch ($9.99). Feels fair for the feature set. |
| Yearly | $39.99 | $3.33 | **44% savings** | Aggressive discount to push annual adoption. Annual subscribers retain at 36% vs 22% for monthly. $39.99 < Habitica yearly ($47.99). |

**Why $5.99/mo and not $4.99 or $9.99:**
- $4.99 leaves money on the table — Habitica charges this with fewer engagement features than PhoNo
- $9.99 requires Finch-level breadth (journaling, exercises, reflections) — PhoNo doesn't have this yet
- $5.99 is the exact median IAP price on iOS in 2025 and matches Forest's subscription
- The extra $1/mo over $4.99 = ~$12/yr additional revenue per subscriber with minimal conversion impact at this price point

### PhoNo Lifetime — $49.99

| Feature | Lifetime |
|---------|----------|
| All Premium features | Forever |
| Coin multiplier | **2.5x** (slight bonus over Premium's 2x) |
| XP multiplier | **2.5x** |
| Streak freezes per month | **5** |
| Exclusive Founder badge | Yes |
| Exclusive Founder pet skin | Yes (one-time legendary variant) |
| Bonus coins on purchase | **5,000** |

**Pricing Rationale:**
- $49.99 = 1.25x yearly ($39.99). This is intentionally LOW relative to typical 2.5-3x ratios.
- **Why price it relatively low?** PhoNo is a new app without established brand trust. A $179.99 lifetime (current) is Calm/Headspace territory — users won't pay that for an unknown timer app. $49.99 feels like "a year and a bit" — achievable and fair.
- The Founder badge + exclusive pet skin create urgency ("available to early adopters only") and FOMO.
- Once the subscriber base matures (6-12 months post-launch), raise lifetime to $79.99, then $99.99.
- Lifetime users become brand advocates — they've invested enough to feel ownership.

**When to show Lifetime:** Only surface the lifetime option after a user has been a subscriber for 3+ months, OR during special promotions. Don't show it on the initial paywall — it cannibalizes the yearly plan for new users.

---

## 6. Coin Pack Pricing

### Redesigned Coin Packs

The coin economy should be rebalanced so that packs map to real spending patterns:

| Pack | Price | Coins | Bonus | Total | Coins/$ | Role |
|------|-------|-------|-------|-------|---------|------|
| Handful | $0.99 | 400 | 100 (+25%) | **500** | 505 | First purchase breaker. Removes "$0 spent" barrier. |
| Pouch | $2.99 | 1,400 | 600 (+43%) | **2,000** | 669 | Casual top-up. Buys 5 Rare Eggs or 1 Epic Egg + change. |
| Chest | $6.99 | 3,500 | 2,000 (+57%) | **5,500** | 787 | **"Most Popular"** — anchor pack. Buys 4-5 Epic Eggs. |
| Treasure Trove | $14.99 | 8,000 | 6,000 (+75%) | **14,000** | 934 | Core spender sweet spot. Buys 4 Legendary Eggs + extras. |
| Dragon's Hoard | $29.99 | 17,000 | 18,000 (+106%) | **35,000** | 1,167 | **"Best Value"** badge. Whale capture. Full egg shopping spree. |

**Why these amounts?**

The coin values are calibrated against in-game prices:
- Common Egg = 100 coins (~$0.20 at Chest rate)
- Rare Egg = 400 coins (~$0.51)
- Epic Egg = 1,200 coins (~$1.52)
- Legendary Egg = 3,000 coins (~$3.81)
- Species Selector = 2,000 coins (~$2.54)
- Background = 800–2,500 coins (~$1.02–$3.18)

This means:
- **$0.99 pack** = enough for 1 Rare Egg + 1 Common Egg (taste of the gacha)
- **$2.99 pack** = enough for 1 Epic Egg + change, or 5 Rare Eggs
- **$6.99 pack** = enough for 1 Legendary Egg + 1 Epic Egg + extras
- **$14.99 pack** = enough for 4 Legendary Eggs + accessories
- **$29.99 pack** = enough for 11 Legendary Eggs or a massive hatching session

**Removed: $49.99 and $99.99 packs.** The current economy doesn't have enough coin sinks to justify 60K-150K coin packs. At 35K coins, the Dragon's Hoard already buys everything in the shop several times over. Once more coin sinks are added (see Seasonal section), reintroduce higher tiers.

### Price Anchoring Strategy

Display order on the shop screen:
1. Dragon's Hoard ($29.99) — **"Best Value"** badge — shown first to anchor high
2. Treasure Trove ($14.99)
3. Chest ($6.99) — **"Most Popular"** badge — the target purchase
4. Pouch ($2.99)
5. Handful ($0.99)

Show coins-per-dollar ratio as a subtle bar or percentage on each pack to make the value escalation visible.

---

## 7. Starter & Limited Bundles

### Welcome Pack — $2.99 (24-hour window after first session)

| Contents | Value |
|----------|-------|
| 1,500 coins | ~$2.99 standalone |
| 1 Rare Egg | 400 coins |
| 1 Streak Freeze | 150 coins |
| Exclusive "Early Bird" pet skin | Priceless |
| **Total perceived value** | **~$5.50+** |
| **Discount shown** | **"70% OFF"** |

**Trigger:** Shown as a modal after the user completes their first focus session and receives their first pet. The emotional high of "I just got a pet!" is the peak conversion moment.

**Expiry:** 24-hour countdown timer displayed. After expiry, the pack disappears forever. Real scarcity, not fake.

**Why $2.99:** The $0.99–$4.99 range has the highest conversion rate for first purchases (5-15% of active users). $2.99 is the sweet spot — low enough to be impulse, high enough to generate meaningful revenue and establish the user as a "buyer" (breaking the $0 barrier is the hardest conversion).

### Egg Hunter Pack — $4.99 (always available)

| Contents | Value |
|----------|-------|
| 2 Rare Eggs | 800 coins |
| 1 Epic Egg | 1,200 coins |
| 1,000 coins | ~$1.50 |
| Focus Boost (2x coins, 1 day) | 400 coins |
| **Total perceived value** | **~$6.50+** |
| **Discount shown** | **"50% OFF"** |

**Rationale:** Targets the user who wants to try the egg system with real-money IAP but isn't ready for a subscription. The egg contents create immediate excitement (hatching animation) and demonstrate the gacha loop's appeal.

### Island Master Pack — $14.99 (always available)

| Contents | Value |
|----------|-------|
| 5,000 coins | ~$6.99 |
| 2 Epic Eggs | 2,400 coins |
| 1 Legendary Egg | 3,000 coins |
| Super Boost (3x coins, 3 days) | 1,000 coins |
| 3 Streak Freezes | 450 coins |
| Exclusive "Island Master" badge | Priceless |
| **Total perceived value** | **~$25+** |
| **Discount shown** | **"60% OFF"** |

**Rationale:** The "completionist" pack. For users who are deep in the pet collection grind and want a big push toward filling their island. The Legendary Egg is the headliner — most free users will never afford 3,000 coins organically, so this is many users' first shot at a legendary pet.

---

## 8. Seasonal & Event Economy

This is where PhoNo can generate excitement, FOMO, and significant revenue spikes. The egg/gacha system is uniquely suited to seasonal events.

### Seasonal Pet Events (Quarterly)

Run 4 events per year, each lasting 2-3 weeks:

| Season | Theme | Limited Pets | Seasonal Egg |
|--------|-------|-------------|-------------|
| Spring (Mar-Apr) | Cherry Blossom Festival | Sakura Bunny, Blossom Deer, Petal Fox | Blossom Egg |
| Summer (Jun-Jul) | Ocean Adventure | Beach Penguin, Surf Corgi, Coral Axolotl | Ocean Egg |
| Fall (Oct-Nov) | Spooky Harvest | Ghost Cat, Pumpkin Owl, Witch Raccoon | Spooky Egg |
| Winter (Dec-Jan) | Frost Festival | Snow Dragon, Ice Phoenix, Gingerbread Hamster | Frost Egg |

**Seasonal Egg mechanics:**
- Seasonal Eggs cost 1,500 coins (between Rare and Epic egg pricing)
- They have a chance to drop **limited-edition seasonal pets** that are NOT available from regular eggs
- Seasonal pets have unique skins/variants of existing species (Sakura Bunny = Bunny with cherry blossom colors)
- After the event ends, seasonal pets cannot be obtained again until next year
- Seasonal pets get a special **seasonal badge** in the collection book

**Seasonal IAP Bundle — $3.99–$9.99:**

| Tier | Price | Contents |
|------|-------|----------|
| Small | $3.99 | 3 Seasonal Eggs + 500 coins |
| Large | $9.99 | 8 Seasonal Eggs + 2,000 coins + exclusive seasonal background |

**Revenue impact:** Seasonal events create 4 annual purchase spikes. The limited-edition FOMO drives both coin pack purchases (to buy seasonal eggs with coins) and direct seasonal bundle purchases. Based on mobile gaming benchmarks, seasonal events typically generate 30-50% revenue lift during event windows.

### Monthly Exclusive Pet

Premium subscribers get 1 exclusive pet variant per month. This pet has a unique color palette / accessory but is based on an existing species (e.g., "Golden Hamster" in January, "Valentine Fox" in February).

- Free users can see these pets in others' collections but can't obtain them
- Creates ongoing "collector's regret" motivation to subscribe
- Low development cost (recolor existing sprites)
- Archive of all monthly exclusives visible in collection book with "Premium" badge

### Weekly Rotating Deals

Every Monday, rotate a featured deal in the shop:

- **Egg Flash Sale:** One egg type at 30% off for 48 hours
- **Double Coins Weekend:** Buy any coin pack, get double coins (Friday–Sunday)
- **Mystery Bundle:** Randomized bundle contents at a discount

These create weekly engagement touchpoints and purchase opportunities without requiring new content.

---

## 9. Gifting System

Gifting drives viral acquisition. When a user gifts PhoNo Premium to a friend, that's a new user acquired at zero CAC.

### Gift Options

| Gift | Price | What Recipient Gets |
|------|-------|-------------------|
| Gift 1 Month Premium | $5.99 | 1 month of Premium |
| Gift 1 Year Premium | $39.99 | 1 year of Premium |
| Gift Coin Pack (any) | Pack price | Coins deposited to their account |
| Gift an Egg | $1.99 | 1 Rare Egg + hatching animation |
| Gift a Legendary Egg | $4.99 | 1 Legendary Egg + premium hatching animation |

### How Gifting Works

1. Buyer selects gift from the Shop → Gift tab
2. Buyer enters recipient's PhoNo username or generates a gift link
3. Recipient receives a push notification / in-app banner: "You received a gift!"
4. Recipient opens a gift-unwrapping animation → reveals contents
5. If recipient doesn't have the app, the gift link leads to App Store download

### Gift-Specific IAP Considerations

- Gift eggs are the most compelling gift because they create shared excitement ("What pet did you hatch?!")
- The $1.99 Rare Egg gift is deliberately cheap to maximize gifting frequency
- Gift subscriptions are Apple-supported via StoreKit 2's subscription gift APIs
- Holiday pushes: "Gift Focus This Holiday Season" — promote egg gifting during December

---

## 10. Paywall & Conversion Strategy

### When to Show the Paywall

The paywall should appear at moments of peak perceived value, never during frustration:

| Trigger | Timing | Paywall Type |
|---------|--------|-------------|
| First session complete | After first pet earned | Soft — "Unlock 2x rewards" banner (not blocking) |
| 3rd session complete | After 3rd pet placed on island | Medium — Full-screen modal with trial offer |
| Streak milestone (3 days) | After streak reward animation | Soft — "Premium members earn 2x streak rewards" |
| Island half-full | When ~50% of current tier is filled | Medium — "Expand faster with Premium" |
| Rare+ pet hatched | After the hatch reveal animation | Soft — "Premium members get 15% off eggs" |
| 7th day of use | On 7th daily login | Hard — Full paywall with 7-day trial offer |
| Attempt to use locked feature | When tapping premium analytics etc. | Contextual — Feature-specific upgrade prompt |

### Paywall Design — "Rule of Three"

Show exactly 3 options on the paywall:

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│          Unlock PhoNo Premium                       │
│                                                        │
│   ┌──────────┐  ┌──────────────┐  ┌──────────┐       │
│   │  Weekly   │  │   Yearly     │  │ Monthly  │       │
│   │           │  │  BEST VALUE  │  │          │       │
│   │  $2.49    │  │   $39.99     │  │  $5.99   │       │
│   │  /week    │  │   /year      │  │  /month  │       │
│   │           │  │  $3.33/mo    │  │          │       │
│   │           │  │  Save 44%    │  │          │       │
│   └──────────┘  └──────────────┘  └──────────┘       │
│                                                        │
│        [ Start 7-Day Free Trial ]                      │
│                                                        │
│   ✓ 2x coins & XP  ✓ 3 sound layers  ✓ Full stats   │
│   ✓ Egg discounts   ✓ Monthly exclusive pet            │
│   ✓ All island themes  ✓ 3 streak freezes/month       │
│                                                        │
│           50,000+ users focused 2M+ hours              │
│                                                        │
│                    Restore Purchases                    │
│                                                        │
└──────────────────────────────────────────────────────┘
```

**The yearly plan is centered and highlighted** — this is the target conversion. Research shows 60-70% of purchases go to the middle option.

### Free Trial Strategy

| Plan | Trial Length | Trial Type |
|------|-------------|-----------|
| Weekly | 3 days | Opt-out (card required) |
| Monthly | 7 days | Opt-out (card required) |
| Yearly | 7 days | Opt-out (card required) |

- Opt-out trials (card upfront) convert at 49-60% vs 18-25% for opt-in
- 7-day trial is optimal for monthly/yearly — enough time to experience 2-3 focus sessions and see the Premium difference
- 80-90% of trials start on Day 0 — the onboarding-to-trial flow must be seamless

### Progressive Discount Strategy (Finch-inspired)

Offer escalating discounts based on app usage to convert long-term free users:

| Milestone | Discount Offered | How |
|-----------|-----------------|-----|
| Day 7 | 7-day free trial | Standard paywall |
| Day 25 | 20% off first year ($31.99) | Push notification + in-app banner |
| Day 50 | 30% off first year ($27.99) | Push notification + modal |
| Day 75 | 40% off first year ($23.99) | Push notification + modal |
| Day 100 | 50% off first year ($19.99) | Push notification + modal + "Thank you for 100 days" celebration |

**Why this works:** Users who've used the app for 100 days are highly engaged but resistant to paying. The escalating discount rewards their loyalty and makes the conversion feel earned. Finch uses this exact pattern successfully.

---

## 11. Anti-Churn & Retention Mechanics

### Subscriber Retention Features

These features specifically prevent subscriber cancellation:

| Mechanic | How It Retains |
|----------|---------------|
| **Monthly exclusive pet** | Cancelling means missing next month's exclusive. Collection completionists won't cancel. |
| **Streak freeze safety net** | 3 free monthly freezes. Cancelling means risking streak loss. Streaks have strong loss aversion. |
| **Premium analytics history** | Cancel = lose access to historical focus data. Data lock-in. |
| **Egg discount accumulator** | The 15% egg discount means every egg purchase reinforces the sub's value. |
| **Subscriber badge/flair** | Social identity — cancelling removes visible status. |
| **Island theme access** | If a user has a premium theme equipped on their island, cancelling reverts to default. Visual loss. |

### Churn Prevention Triggers

| Signal | Action |
|--------|--------|
| No sessions in 5 days | Push: "Your [pet name] misses you! Come focus for 25 min" |
| Subscription renewal in 3 days | In-app: Show "Here's what you earned this month with Premium" summary |
| User visits cancellation page | Offer 30% off next billing period |
| User actually cancels | Grace period: "Your Premium benefits continue for X days. Resubscribe anytime." |
| Lapsed subscriber opens app | Welcome-back modal: "We saved your island! Resubscribe and get 500 bonus coins" |

### Involuntary Churn Prevention

Payment failures = 20-40% of all churn. Implement:
- Apple's billing grace period (enabled via App Store Connect)
- Billing retry logic (Apple handles automatically for StoreKit 2)
- Push notification: "Update your payment method to keep Premium"
- 16-day billing retry window before access revocation

---

## 12. Revenue Projections & Modeling

### Assumptions

| Metric | Conservative | Moderate | Optimistic |
|--------|-------------|----------|-----------|
| Monthly active users (Month 6) | 10,000 | 30,000 | 100,000 |
| Free-to-trial conversion | 6% | 10% | 14% |
| Trial-to-paid conversion | 40% | 50% | 60% |
| Overall free-to-paid | 2.4% | 5% | 8.4% |
| Avg. subscription price (blended) | $4.50/mo | $4.50/mo | $4.50/mo |
| % users buying coins (monthly) | 2% | 4% | 6% |
| Avg. coin purchase | $4.99 | $6.99 | $9.99 |
| % users buying bundles (one-time) | 3% | 5% | 8% |

### Monthly Revenue Estimates (Month 6)

| Stream | Conservative | Moderate | Optimistic |
|--------|-------------|----------|-----------|
| Subscriptions | $1,080 | $6,750 | $37,800 |
| Coin packs | $999 | $8,386 | $59,940 |
| Bundles | $1,499 | $7,495 | $39,960 |
| **Total MRR** | **$3,578** | **$22,631** | **$137,700** |
| **ARR** | **$42,936** | **$271,572** | **$1,652,400** |

*Note: After Apple's 15-30% commission, net revenue = 70-85% of gross.*

### Revenue Mix Target

| Stream | Target % | Why |
|--------|---------|-----|
| Subscriptions | 55-65% | Predictable, recurring, high LTV |
| Coin packs | 25-30% | Impulse revenue, whale capture, seasonal spikes |
| Bundles/seasonal | 10-15% | Spiky but high-margin, new user conversion |

---

## 13. Implementation Priority

### Phase 1 — Foundation (Weeks 1-3)

1. **Consolidate to single Premium tier** — Remove Premium+ from code and UI. Merge best benefits into Premium at $5.99/mo.
2. **Add weekly subscription** — $2.49/week with 3-day trial.
3. **Reprice yearly** — $39.99/yr (was €39.99, align to USD).
4. **Reprice lifetime** — $49.99 (down from €179.99). Add Founder badge + pet.
5. **Fix multiplier divergence** — Align premiumStore.ts and usePremiumStatus.ts to unified 2x/2.5x values.
6. **Fix legacy storage keys** — Migrate `petIsland_premium` to `nomo_` convention.
7. **Update product IDs** — Ensure all product IDs in code match App Store Connect configuration.

### Phase 2 — Coin Economy (Weeks 3-5)

8. **Restructure coin packs** — 5 tiers ($0.99–$29.99) with new bonus structure.
9. **Add egg discount for Premium** — 15% off all egg purchases.
10. **Implement Welcome Pack** — $2.99, 24-hour post-first-session window.
11. **Redesign shop bundles** — Replace generic RPG bundles with Egg Hunter Pack and Island Master Pack.

### Phase 3 — Conversion Optimization (Weeks 5-7)

12. **Implement paywall triggers** — Contextual paywalls at 7 strategic moments.
13. **Design paywall screen** — Rule of Three layout with yearly highlighted.
14. **Add free trial flow** — 7-day opt-out trial for monthly/yearly, 3-day for weekly.
15. **Progressive discount system** — Day 25/50/75/100 escalating offers.

### Phase 4 — Engagement & Retention (Weeks 7-10)

16. **Monthly exclusive pet system** — 1 new pet variant per month for subscribers.
17. **Seasonal egg events** — First seasonal event (align with next calendar season).
18. **Weekly rotating deals** — Flash sales, double coins, mystery bundles.
19. **Anti-churn triggers** — Renewal reminders, cancellation offers, lapse win-back.

### Phase 5 — Growth (Weeks 10-14)

20. **Gifting system** — Gift subscriptions, coin packs, and eggs.
21. **Remove Battle Pass dead code** — Clean up unused product IDs and definitions.
22. **A/B test paywall variants** — Test price points, layouts, and trial lengths.
23. **Web checkout for U.S. users** — Explore external payment to save on Apple commission.

---

## 14. App Store Compliance Notes

### Loot Box / Gacha Regulations

PhoNo's egg system is a gacha mechanic. Compliance requirements:

- **Apple App Store Review Guideline 3.1.1**: Apps offering loot boxes or gacha must disclose the odds of receiving each type of item before purchase. PhoNo already defines odds in `EggData.ts` — these MUST be displayed in the egg purchase UI.
- **Belgium & Netherlands**: Paid loot boxes are banned. If launching in these markets, eggs must be purchasable ONLY with earned coins (not coins bought with real money). Consider geo-fencing IAP coin packs or adding a "coins from IAP cannot buy eggs" restriction for these regions.
- **Japan**: Gacha odds must be disclosed. "Complete gacha" (requiring collecting a full set for a reward) is banned. PhoNo's system doesn't require complete sets, so this is fine.
- **China**: Gacha odds must be published. Unlikely to launch there, but noted.

**Recommendation:** Display odds prominently on every egg purchase screen. Example: "Common 40% | Uncommon 35% | Rare 20% | Epic 5%" shown directly below the egg card. This is both a legal requirement and builds user trust.

### Subscription Guidelines

- Auto-renewable subscription terms must be displayed clearly before purchase
- Free trial terms must specify duration and post-trial price
- "Restore Purchases" button must be accessible (already implemented)
- Subscription management must link to Apple's subscription settings

### Age Rating

The gacha/egg system may affect the app's age rating. Apps with simulated gambling mechanics may receive a higher age rating. Since PhoNo eggs use in-game currency (not direct real-money gambling), this typically stays at 12+ but should be verified with Apple during review.

---

## Appendix A: Complete Product ID Catalog (Proposed)

```
# Subscriptions (auto-renewable)
co.phonoinc.app.premium.weekly
co.phonoinc.app.premium.monthly
co.phonoinc.app.premium.yearly

# Lifetime (non-consumable)
co.phonoinc.app.lifetime

# Coin Packs (consumable)
co.phonoinc.app.coins.handful       # $0.99
co.phonoinc.app.coins.pouch         # $2.99
co.phonoinc.app.coins.chest         # $6.99
co.phonoinc.app.coins.trove         # $14.99
co.phonoinc.app.coins.hoard         # $29.99

# Bundles (non-consumable, one-time)
co.phonoinc.app.bundle.welcome      # $2.99 (24hr)
co.phonoinc.app.bundle.egghunter    # $4.99
co.phonoinc.app.bundle.islandmaster # $14.99

# Seasonal (non-consumable, limited-time)
co.phonoinc.app.seasonal.spring2026  # varies
co.phonoinc.app.seasonal.summer2026  # varies
co.phonoinc.app.seasonal.fall2026    # varies
co.phonoinc.app.seasonal.winter2026  # varies

# Gifts (consumable)
co.phonoinc.app.gift.egg.rare       # $1.99
co.phonoinc.app.gift.egg.legendary  # $4.99
```

### Products to Remove

```
# Remove (Premium+ tier eliminated)
co.phonoinc.app.premiumplus.monthly
co.phonoinc.app.premiumplus.yearly

# Remove (replaced with new packs)
co.phonoinc.app.coins.value
co.phonoinc.app.coins.premium
co.phonoinc.app.coins.mega
co.phonoinc.app.coins.ultra
co.phonoinc.app.coins.legendary

# Remove (replaced with themed bundles)
co.phonoinc.app.bundle.starter
co.phonoinc.app.bundle.collector
co.phonoinc.app.bundle.ultimate

# Remove (dead code, never implemented)
co.phonoinc.app.battlepass.premium
co.phonoinc.app.battlepass.premium.plus
```

---

## Appendix B: Coin Economy Balance Check

Verifying that the coin economy stays balanced with the new pricing:

**Coin earning rate (free user, base):**
- 2 coins/min × 25 min session = 50 coins + 15 bonus = 65 coins/session
- Assuming 1.5 sessions/day average = ~98 coins/day = ~2,940 coins/month

**Coin earning rate (Premium user, 2x):**
- 4 coins/min × 25 min session = 100 coins + 15 bonus = 115 coins/session
- Assuming 2 sessions/day (more engaged) = ~230 coins/day = ~6,900 coins/month

**Monthly spending capacity (free user earning only):**
- 2,940 coins/month = ~7 Rare Eggs OR ~2 Epic Eggs OR ~29 Common Eggs
- This feels right: free users can engage with eggs at a meaningful pace but want more

**Monthly spending capacity (Premium user earning only):**
- 6,900 coins/month = ~17 Rare Eggs OR ~5 Epic Eggs OR 2 Legendary Eggs
- Premium users feel rewarded but still have reason to buy coin packs for Legendary Eggs

**Coin pack value relative to earning:**
- $0.99 pack (500 coins) = ~5 days of free user earning
- $6.99 pack (5,500 coins) = ~56 days of free user earning (nearly 2 months)
- $29.99 pack (35,000 coins) = ~357 days of free user earning (nearly a year!)

This creates the right tension: patient free users can grind, but IAP buyers get massive time acceleration. The value proposition is clear without making the free experience feel punishing.

---

## Appendix C: Seasonal Event Template

Reusable template for quarterly seasonal events:

```
Event: [Season Name] Festival
Duration: 14-21 days
Start: [Date]

NEW CONTENT:
- 3 seasonal pet variants (recolors of existing species)
- 1 seasonal background
- 1 seasonal egg type (1,500 coins)

IAP BUNDLES:
- Small Seasonal Bundle: $3.99
  - 3 seasonal eggs + 500 coins
- Large Seasonal Bundle: $9.99
  - 8 seasonal eggs + 2,000 coins + seasonal background

IN-GAME EVENTS:
- Daily seasonal quest (earn 1 free seasonal egg per day by focusing 45+ min)
- Seasonal achievement: "Hatch 5 seasonal pets" → exclusive badge
- Seasonal leaderboard: Most seasonal pets collected

POST-EVENT:
- Seasonal pets remain in user collections
- Seasonal eggs and bundles removed from shop
- Seasonal pets marked as "[Year] [Season] Limited" in collection
- Stats: revenue, eggs sold, unique buyers, engagement lift
```

---

*Document version: 1.0 | Created: 2026-03-06 | Author: IAP Strategy Analysis*
