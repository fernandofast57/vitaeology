-- =============================================
-- VITAEOLOGY v2 - SEZIONE 6/8
-- ROW LEVEL SECURITY (RLS) Policies
-- Eseguire DOPO sezione 5
-- =============================================

-- Abilita RLS sulle tabelle
ALTER TABLE characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_progress_v2 ENABLE ROW LEVEL SECURITY;

-- CHARACTERISTICS: Lettura pubblica
CREATE POLICY "characteristics_read_all" 
  ON characteristics FOR SELECT 
  USING (true);

-- EXERCISES_V2: Lettura pubblica per esercizi attivi
CREATE POLICY "exercises_read_active" 
  ON exercises_v2 FOR SELECT 
  USING (is_active = true);

-- USER_EXERCISE_PROGRESS_V2: Solo il proprio utente
CREATE POLICY "user_exercise_progress_select_own" 
  ON user_exercise_progress_v2 FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "user_exercise_progress_insert_own" 
  ON user_exercise_progress_v2 FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_exercise_progress_update_own" 
  ON user_exercise_progress_v2 FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "user_exercise_progress_delete_own" 
  ON user_exercise_progress_v2 FOR DELETE 
  USING (auth.uid() = user_id);

-- Verifica
DO $$ BEGIN RAISE NOTICE '✅ Sezione 6/8 completata: RLS policies configurate'; END $$;
