-- Tabella feedback completamento challenge
-- Traccia le preferenze utente dopo il completamento

CREATE TABLE IF NOT EXISTS challenge_completion_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('leadership', 'ostacoli', 'microfelicita')),
  next_action TEXT NOT NULL CHECK (next_action IN ('assessment', 'exercises', 'coach', 'time')),
  missing_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_completion_feedback_user ON challenge_completion_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_completion_feedback_challenge ON challenge_completion_feedback(challenge_type);
CREATE INDEX IF NOT EXISTS idx_completion_feedback_action ON challenge_completion_feedback(next_action);

-- RLS
ALTER TABLE challenge_completion_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: utenti possono inserire il proprio feedback
DROP POLICY IF EXISTS "Users can insert own feedback" ON challenge_completion_feedback;
CREATE POLICY "Users can insert own feedback" ON challenge_completion_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: utenti possono vedere il proprio feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON challenge_completion_feedback;
CREATE POLICY "Users can view own feedback" ON challenge_completion_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: admin può vedere tutto
DROP POLICY IF EXISTS "Admin can view all feedback" ON challenge_completion_feedback;
CREATE POLICY "Admin can view all feedback" ON challenge_completion_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role_id IS NOT NULL)
    )
  );

-- Verifica
SELECT 'challenge_completion_feedback created' as status;
