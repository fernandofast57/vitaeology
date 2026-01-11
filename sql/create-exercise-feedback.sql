-- Tabella feedback esercizi
-- Traccia rating, completamento e engagement utenti

CREATE TABLE IF NOT EXISTS exercise_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rating e feedback
  helpful_rating INTEGER CHECK (helpful_rating BETWEEN 1 AND 5),
  difficulty_perceived INTEGER CHECK (difficulty_perceived BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  feedback_text TEXT,

  -- Metriche completamento
  time_spent_minutes INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  revisit_count INTEGER DEFAULT 0,
  notes_saved BOOLEAN DEFAULT false,
  notes_length INTEGER DEFAULT 0,
  shared_externally BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(exercise_id, user_id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_exercise ON exercise_feedback(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_user ON exercise_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_rating ON exercise_feedback(helpful_rating);

-- Abilita RLS
ALTER TABLE exercise_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON exercise_feedback;
CREATE POLICY "Users can view own feedback" ON exercise_feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: utenti possono inserire propri feedback
DROP POLICY IF EXISTS "Users can insert own feedback" ON exercise_feedback;
CREATE POLICY "Users can insert own feedback" ON exercise_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: utenti possono aggiornare propri feedback
DROP POLICY IF EXISTS "Users can update own feedback" ON exercise_feedback;
CREATE POLICY "Users can update own feedback" ON exercise_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Verifica creazione
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'exercise_feedback') as column_count
FROM information_schema.tables
WHERE table_name = 'exercise_feedback';
