-- =====================================================
-- MIGRAZIONE: Completa tabella exercise_feedback
-- Data: 7 Gennaio 2026
-- Scopo: Aggiunge colonne mancanti e trigger updated_at
-- =====================================================

-- Aggiungi updated_at se mancante
ALTER TABLE exercise_feedback
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_exercise_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_exercise_feedback_updated ON exercise_feedback;
CREATE TRIGGER trigger_exercise_feedback_updated
  BEFORE UPDATE ON exercise_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_feedback_timestamp();

-- Indici aggiuntivi per performance
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_exercise ON exercise_feedback(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_user ON exercise_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_rating ON exercise_feedback(helpful_rating) WHERE helpful_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exercise_feedback_completed ON exercise_feedback(completed_at) WHERE completed_at IS NOT NULL;

-- RLS (se non già attivo)
ALTER TABLE exercise_feedback ENABLE ROW LEVEL SECURITY;

-- Policy utenti (ricrea per sicurezza)
DROP POLICY IF EXISTS "Users can view own feedback" ON exercise_feedback;
CREATE POLICY "Users can view own feedback" ON exercise_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback" ON exercise_feedback;
CREATE POLICY "Users can insert own feedback" ON exercise_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feedback" ON exercise_feedback;
CREATE POLICY "Users can update own feedback" ON exercise_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Verifica
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'exercise_feedback'
ORDER BY ordinal_position;
