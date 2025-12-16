-- =============================================
-- VITAEOLOGY v2 - SEZIONE 5/8
-- Tabella USER_EXERCISE_PROGRESS_V2
-- Eseguire DOPO sezione 4
-- =============================================

DROP TABLE IF EXISTS user_exercise_progress_v2 CASCADE;

CREATE TABLE user_exercise_progress_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Riferimenti
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises_v2(id) ON DELETE CASCADE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Risposte alle 3 fasi
  phase_1_response JSONB,
  phase_2_response JSONB,
  phase_3_response JSONB,
  
  -- Deliverable
  deliverable_content TEXT,
  deliverable_file_url TEXT,
  
  -- Riflessioni
  reflection_responses JSONB,
  
  -- Interazioni AI Coach
  ai_coach_conversations JSONB DEFAULT '[]'::jsonb,
  
  -- Valutazione utente
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  usefulness_rating INTEGER CHECK (usefulness_rating BETWEEN 1 AND 5),
  feedback TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, exercise_id)
);

-- Indici
CREATE INDEX idx_user_exercise_progress_user ON user_exercise_progress_v2(user_id);
CREATE INDEX idx_user_exercise_progress_exercise ON user_exercise_progress_v2(exercise_id);
CREATE INDEX idx_user_exercise_progress_status ON user_exercise_progress_v2(status);

-- Trigger
CREATE TRIGGER update_user_exercise_progress_v2_updated_at
    BEFORE UPDATE ON user_exercise_progress_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verifica
DO $$ BEGIN RAISE NOTICE '✅ Sezione 5/8 completata: Tabella user_exercise_progress_v2 creata'; END $$;
