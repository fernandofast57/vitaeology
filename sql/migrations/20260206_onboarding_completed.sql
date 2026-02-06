-- ============================================================
-- MIGRATION: Add founding_tester_onboarding_shown to profiles
-- Date: 2026-02-06
-- Description: Track if Founding Tester has seen the welcome modal
-- ============================================================

-- Aggiungi colonna per tracciare se il modal di onboarding è stato mostrato
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS founding_tester_onboarding_shown BOOLEAN DEFAULT FALSE;

-- Commento esplicativo
COMMENT ON COLUMN profiles.founding_tester_onboarding_shown IS
  'True if the Founding Tester has seen the welcome onboarding modal. Used to show modal only once.';
