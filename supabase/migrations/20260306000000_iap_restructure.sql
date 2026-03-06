-- IAP Restructuring: Simplify tiers to free/premium only
-- Migrate premium_plus and lifetime users to premium

-- 1. Migrate existing premium_plus and lifetime subscriptions to premium
UPDATE user_subscriptions
SET tier = 'premium'
WHERE tier IN ('premium_plus', 'lifetime');

-- 2. Add eggs_granted column to user_purchases for bundle egg tracking
ALTER TABLE user_purchases
ADD COLUMN IF NOT EXISTS eggs_granted JSONB DEFAULT NULL;
