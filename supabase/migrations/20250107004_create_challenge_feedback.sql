-- =====================================================
-- MIGRAZIONE: Crea tabella challenge_feedback
-- Data: 7 Gennaio 2026
-- Scopo: Raccogliere preferenze utenti post-challenge
-- =====================================================

CREATE TABLE IF NOT EXISTS challenge_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,

  -- Feedback strutturato
  next_action TEXT CHECK (next_action IN ('assessment', 'exercises', 'coach', 'time', 'book')),
  missing_feedback TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per analytics
CREATE INDEX IF NOT EXISTS idx_challenge_feedback_type ON challenge_feedback(challenge_type);
CREATE INDEX IF NOT EXISTS idx_challenge_feedback_action ON challenge_feedback(next_action);
CREATE INDEX IF NOT EXISTS idx_challenge_feedback_user ON challenge_feedback(user_id);

-- RLS
ALTER TABLE challenge_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own feedback" ON challenge_feedback;
CREATE POLICY "Users can insert own feedback" ON challenge_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own feedback" ON challenge_feedback;
CREATE POLICY "Users can view own feedback" ON challenge_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all feedback" ON challenge_feedback;
CREATE POLICY "Admins can view all feedback" ON challenge_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

COMMENT ON TABLE challenge_feedback IS 'Feedback utenti post-completamento challenge per analytics e personalizzazione';

-- Verifica creazione
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'challenge_feedback';
