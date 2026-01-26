-- ============================================================
-- MIGRATION: Fix beta_testers table - add approved_at and fix status constraint
-- Date: 2026-01-26
-- Description: Critical fixes for beta approval cron
-- ============================================================

-- 1. Add approved_at column (used by cron approval)
ALTER TABLE beta_testers
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN beta_testers.approved_at IS
  'Timestamp when beta tester was approved by cron job';

-- 2. Create index for approved_at
CREATE INDEX IF NOT EXISTS idx_beta_testers_approved_at
ON beta_testers(approved_at);

-- 3. Drop old status constraint and add new one with pending_approval
ALTER TABLE beta_testers
DROP CONSTRAINT IF EXISTS beta_testers_status_check;

ALTER TABLE beta_testers
ADD CONSTRAINT beta_testers_status_check
CHECK (status IN ('pending', 'pending_approval', 'approved', 'rejected', 'active', 'completed'));
