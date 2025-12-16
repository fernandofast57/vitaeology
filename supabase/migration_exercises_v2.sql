-- =====================================================
-- VITAEOLOGY - Migration: Exercises System v2
-- =====================================================
-- Esegui questo script su: Supabase Dashboard → SQL Editor
-- Aggiorna la tabella exercises e user_exercise_progress
-- =====================================================

-- =====================================================
-- 1. AGGIORNA TABELLA EXERCISES
-- =====================================================
-- Aggiungi colonne mancanti alla tabella exercises
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS characteristic_slug TEXT,
ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'riflessione' CHECK (exercise_type IN ('riflessione', 'azione', 'sfida', 'analisi', 'feedback', 'pianificazione')),
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'intermedio' CHECK (difficulty_level IN ('base', 'intermedio', 'avanzato')),
ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS month_name TEXT,
ADD COLUMN IF NOT EXISTS deliverable TEXT,
ADD COLUMN IF NOT EXISTS reflection_prompts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sort_order INTEGER,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Rinomina duration_minutes se esiste
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercises' AND column_name = 'duration_minutes') THEN
    ALTER TABLE public.exercises RENAME COLUMN duration_minutes TO estimated_time_minutes_old;
    UPDATE public.exercises SET estimated_time_minutes = COALESCE(estimated_time_minutes_old, 30);
    ALTER TABLE public.exercises DROP COLUMN estimated_time_minutes_old;
  END IF;
END $$;

-- Rimuovi vecchia colonna difficulty se esiste e migra
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercises' AND column_name = 'difficulty') THEN
    UPDATE public.exercises SET difficulty_level =
      CASE difficulty
        WHEN 'facile' THEN 'base'
        WHEN 'medio' THEN 'intermedio'
        WHEN 'difficile' THEN 'avanzato'
        ELSE 'intermedio'
      END;
    ALTER TABLE public.exercises DROP COLUMN difficulty;
  END IF;
END $$;

-- =====================================================
-- 2. AGGIORNA TABELLA USER_EXERCISE_PROGRESS
-- =====================================================
-- Aggiungi colonne mancanti per supportare il nuovo schema
ALTER TABLE public.user_exercise_progress
ADD COLUMN IF NOT EXISTS reflection_answers JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS action_checklist JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS rating_difficulty INTEGER CHECK (rating_difficulty >= 1 AND rating_difficulty <= 5),
ADD COLUMN IF NOT EXISTS rating_usefulness INTEGER CHECK (rating_usefulness >= 1 AND rating_usefulness <= 5),
ADD COLUMN IF NOT EXISTS feedback TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migra vecchia colonna rating se esiste
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_exercise_progress' AND column_name = 'rating') THEN
    UPDATE public.user_exercise_progress
    SET rating_difficulty = rating, rating_usefulness = rating
    WHERE rating IS NOT NULL;
    ALTER TABLE public.user_exercise_progress DROP COLUMN rating;
  END IF;
END $$;

-- =====================================================
-- 3. CREA TRIGGER PER updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_exercises_updated_at ON public.exercises;
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_exercise_progress_updated_at ON public.user_exercise_progress;
CREATE TRIGGER update_user_exercise_progress_updated_at
  BEFORE UPDATE ON public.user_exercise_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 4. INDEXES per performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_exercises_week_number ON public.exercises(week_number);
CREATE INDEX IF NOT EXISTS idx_exercises_is_active ON public.exercises(is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_characteristic_slug ON public.exercises(characteristic_slug);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_exercise_id ON public.user_exercise_progress(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_status ON public.user_exercise_progress(status);

-- =====================================================
-- DONE!
-- =====================================================
