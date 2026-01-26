-- ============================================================
-- MIGRATION: Add affiliate_invite_sent_at to beta_testers
-- Date: 2026-01-26
-- Description: Track when affiliate invitation was sent to beta testers
-- ============================================================

-- Add column to track affiliate invitation
ALTER TABLE beta_testers
ADD COLUMN IF NOT EXISTS affiliate_invite_sent_at TIMESTAMPTZ DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN beta_testers.affiliate_invite_sent_at IS
  'Timestamp when founding affiliate invitation email was sent';

-- Create index for querying testers who haven't received invite
CREATE INDEX IF NOT EXISTS idx_beta_testers_affiliate_invite
ON beta_testers (status, affiliate_invite_sent_at)
WHERE affiliate_invite_sent_at IS NULL;
