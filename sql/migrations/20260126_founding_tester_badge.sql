-- ============================================================
-- MIGRATION: Add is_founding_tester to profiles
-- Date: 2026-01-26
-- Description: Permanent badge for founding beta testers
-- ============================================================

-- Add column for founding tester badge
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_founding_tester BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN profiles.is_founding_tester IS
  'Permanent badge: true if user was a founding beta tester. Set when beta tester is approved.';

-- Create index for potential queries
CREATE INDEX IF NOT EXISTS idx_profiles_founding_tester
ON profiles (is_founding_tester)
WHERE is_founding_tester = TRUE;
