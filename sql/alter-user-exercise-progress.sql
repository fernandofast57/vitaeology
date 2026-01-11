-- ============================================================================
-- MIGRAZIONE: Aggiungi colonne ai_feedback e radar_change a user_exercise_progress
-- Descrizione: Colonne per tracciare feedback AI e variazioni radar post-esercizio
-- Data: 11/01/2026
-- Framework: Evangelista Vitaeology - Tracking Evoluzione Utente
-- ============================================================================

-- ============================================================================
-- COLONNA: ai_feedback
-- Traccia il feedback generato dall'AI Coach dopo il completamento
-- ============================================================================

ALTER TABLE public.user_exercise_progress
ADD COLUMN IF NOT EXISTS ai_feedback JSONB DEFAULT NULL;

COMMENT ON COLUMN public.user_exercise_progress.ai_feedback IS 'Feedback AI Coach post-completamento: { summary, strengths, improvements, next_steps }';

-- ============================================================================
-- COLONNA: radar_change
-- Traccia la variazione del radar dopo questo esercizio
-- ============================================================================

ALTER TABLE public.user_exercise_progress
ADD COLUMN IF NOT EXISTS radar_change JSONB DEFAULT NULL;

COMMENT ON COLUMN public.user_exercise_progress.radar_change IS 'Variazione radar post-esercizio: { before: {...}, after: {...}, delta: {...}, significant_changes: [...] }';

-- ============================================================================
-- COLONNA: recommendation_id
-- Link alla raccomandazione che ha suggerito questo esercizio
-- ============================================================================

ALTER TABLE public.user_exercise_progress
ADD COLUMN IF NOT EXISTS recommendation_id UUID DEFAULT NULL;

-- Nota: Non aggiungiamo FK perché la tabella ai_exercise_recommendations potrebbe non esistere ancora
-- ALTER TABLE public.user_exercise_progress
-- ADD CONSTRAINT fk_recommendation
-- FOREIGN KEY (recommendation_id)
-- REFERENCES public.ai_exercise_recommendations(id)
-- ON DELETE SET NULL;

COMMENT ON COLUMN public.user_exercise_progress.recommendation_id IS 'ID della raccomandazione AI che ha suggerito questo esercizio';

-- ============================================================================
-- COLONNA: path_type
-- Tipo di percorso (utile per query)
-- ============================================================================

ALTER TABLE public.user_exercise_progress
ADD COLUMN IF NOT EXISTS path_type TEXT DEFAULT NULL
CHECK (path_type IS NULL OR path_type IN ('leadership', 'ostacoli', 'microfelicita'));

COMMENT ON COLUMN public.user_exercise_progress.path_type IS 'Tipo percorso: leadership, ostacoli, microfelicita';

-- ============================================================================
-- INDEX per nuove colonne
-- ============================================================================

-- Index per query su raccomandazioni accettate
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_recommendation
  ON public.user_exercise_progress(recommendation_id)
  WHERE recommendation_id IS NOT NULL;

-- Index per query su path_type
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_path
  ON public.user_exercise_progress(user_id, path_type);

-- Index per esercizi con radar_change (per analytics)
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_radar_change
  ON public.user_exercise_progress(user_id, completed_at)
  WHERE radar_change IS NOT NULL;

-- ============================================================================
-- FUNZIONE: Salva feedback AI
-- ============================================================================

CREATE OR REPLACE FUNCTION save_ai_feedback(
  p_user_id UUID,
  p_exercise_id UUID,
  p_feedback JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.user_exercise_progress
  SET ai_feedback = p_feedback
  WHERE user_id = p_user_id
    AND exercise_id = p_exercise_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNZIONE: Salva radar change
-- ============================================================================

CREATE OR REPLACE FUNCTION save_radar_change(
  p_user_id UUID,
  p_exercise_id UUID,
  p_radar_change JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.user_exercise_progress
  SET radar_change = p_radar_change
  WHERE user_id = p_user_id
    AND exercise_id = p_exercise_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICA
-- ============================================================================

DO $$
BEGIN
  -- Verifica che le colonne esistano
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_exercise_progress'
    AND column_name = 'ai_feedback'
  ) THEN
    RAISE NOTICE '✅ Colonna ai_feedback aggiunta correttamente';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_exercise_progress'
    AND column_name = 'radar_change'
  ) THEN
    RAISE NOTICE '✅ Colonna radar_change aggiunta correttamente';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_exercise_progress'
    AND column_name = 'recommendation_id'
  ) THEN
    RAISE NOTICE '✅ Colonna recommendation_id aggiunta correttamente';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_exercise_progress'
    AND column_name = 'path_type'
  ) THEN
    RAISE NOTICE '✅ Colonna path_type aggiunta correttamente';
  END IF;
END $$;
