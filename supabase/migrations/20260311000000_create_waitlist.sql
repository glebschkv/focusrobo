-- Waitlist table for marketing website signup + referral tracking
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_by text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_waitlist_referral_code ON waitlist(referral_code);
CREATE INDEX idx_waitlist_referred_by ON waitlist(referred_by);
