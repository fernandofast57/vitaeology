-- ============================================================================
-- BETA TESTING SYSTEM TABLES
-- Creato: Gennaio 2026
-- ============================================================================

-- 1. Tabella beta_testers - Candidature beta tester
CREATE TABLE IF NOT EXISTS beta_testers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT,
  years_experience TEXT NOT NULL CHECK (years_experience IN ('0-2', '3-5', '6-10', '10+')),
  device TEXT NOT NULL CHECK (device IN ('desktop', 'mobile', 'both')),
  motivation TEXT NOT NULL,
  hours_available TEXT NOT NULL CHECK (hours_available IN ('1-2', '3-5', '5+')),
  source TEXT CHECK (source IN ('linkedin', 'facebook', 'referral', 'google', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed')),
  cohort TEXT CHECK (cohort IN ('A', 'B', 'C', 'open')),
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indici per beta_testers
CREATE INDEX IF NOT EXISTS idx_beta_testers_status ON beta_testers(status);
CREATE INDEX IF NOT EXISTS idx_beta_testers_email ON beta_testers(email);
CREATE INDEX IF NOT EXISTS idx_beta_testers_created_at ON beta_testers(created_at DESC);

-- 2. Tabella beta_feedback - Feedback dai tester
CREATE TABLE IF NOT EXISTS beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tester_id UUID REFERENCES beta_testers(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'question', 'praise')),
  description TEXT NOT NULL,
  page_url TEXT,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'wont_fix')),
  resolution_notes TEXT
);

-- Indici per beta_feedback
CREATE INDEX IF NOT EXISTS idx_beta_feedback_type ON beta_feedback(type);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_status ON beta_feedback(status);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_severity ON beta_feedback(severity);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_created_at ON beta_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_beta_feedback_user_id ON beta_feedback(user_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Abilita RLS
ALTER TABLE beta_testers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_feedback ENABLE ROW LEVEL SECURITY;

-- Policies per beta_testers

-- Chiunque può inserire una candidatura (form pubblico)
CREATE POLICY "Anyone can apply as beta tester" ON beta_testers
  FOR INSERT WITH CHECK (true);

-- Gli utenti possono vedere la propria candidatura
CREATE POLICY "Users can view own application" ON beta_testers
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR user_id = auth.uid()
  );

-- Solo admin può vedere tutte le candidature
CREATE POLICY "Admin can view all testers" ON beta_testers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Solo admin può aggiornare le candidature
CREATE POLICY "Admin can update testers" ON beta_testers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Policies per beta_feedback

-- Utenti loggati possono inserire feedback
CREATE POLICY "Logged users can submit feedback" ON beta_feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Gli utenti possono vedere i propri feedback
CREATE POLICY "Users can view own feedback" ON beta_feedback
  FOR SELECT USING (user_id = auth.uid());

-- Admin può vedere tutti i feedback
CREATE POLICY "Admin can view all feedback" ON beta_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Admin può aggiornare i feedback
CREATE POLICY "Admin can update feedback" ON beta_feedback
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- ============================================================================
-- GRANTS (per service role)
-- ============================================================================

GRANT ALL ON beta_testers TO service_role;
GRANT ALL ON beta_feedback TO service_role;
