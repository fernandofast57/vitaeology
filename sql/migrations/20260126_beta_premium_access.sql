-- ============================================================
-- MIGRATION: Add beta_premium_until to profiles
-- Date: 2026-01-26
-- Description: Track when beta tester's free premium access expires
-- ============================================================

-- Add column to track beta premium expiration
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS beta_premium_until TIMESTAMPTZ DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN profiles.beta_premium_until IS
  'When beta tester free premium access expires. If set and not expired, user has leader tier access regardless of subscription_status.';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_beta_premium
ON profiles (beta_premium_until)
WHERE beta_premium_until IS NOT NULL;
