-- ============================================================================
-- MIGRAZIONE: ai_exercise_recommendations
-- Descrizione: Raccomandazioni esercizi personalizzate generate dall'AI
-- Data: 11/01/2026
-- Framework: Evangelista Vitaeology - Sistema Raccomandazioni Adattive
-- ============================================================================

-- Tabella raccomandazioni esercizi
CREATE TABLE IF NOT EXISTS public.ai_exercise_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relazione con utente
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Relazione con esercizio
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,

  -- Motivazione della raccomandazione
  reasoning TEXT NOT NULL,

  -- Priorità (1 = più alta)
  priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 100),

  -- Status della raccomandazione
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'skipped', 'expired')),

  -- Tipo assessment su cui è basata
  based_on_assessment_type TEXT NOT NULL CHECK (based_on_assessment_type IN ('leadership', 'ostacoli', 'microfelicita')),

  -- ID dell'assessment di riferimento (opzionale)
  assessment_id UUID,

  -- Punteggio di confidenza (0-100)
  confidence_score INTEGER DEFAULT 80 CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Caratteristica/area target
  target_characteristic TEXT,

  -- Pilastro target (per leadership)
  target_pillar TEXT,

  -- Metadata aggiuntivi
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Constraint: evita duplicati attivi per stesso esercizio
  CONSTRAINT unique_active_recommendation UNIQUE (user_id, exercise_id, status)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index per query frequenti (raccomandazioni utente per tipo)
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_type
  ON public.ai_exercise_recommendations(user_id, based_on_assessment_type);

-- Index per status (pending = da mostrare)
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_status
  ON public.ai_exercise_recommendations(status) WHERE status = 'pending';

-- Index per priorità (ordinamento)
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_priority
  ON public.ai_exercise_recommendations(user_id, priority);

-- Index per scadenza
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_expires
  ON public.ai_exercise_recommendations(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Abilita RLS
ALTER TABLE public.ai_exercise_recommendations ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti possono vedere le proprie raccomandazioni
CREATE POLICY "Users can view own recommendations"
  ON public.ai_exercise_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Utenti possono aggiornare status delle proprie raccomandazioni
CREATE POLICY "Users can update own recommendations status"
  ON public.ai_exercise_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role full access (per AI e cron)
CREATE POLICY "Service role full access recommendations"
  ON public.ai_exercise_recommendations
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- FUNZIONI HELPER
-- ============================================================================

-- Funzione per ottenere la prossima raccomandazione per un utente
CREATE OR REPLACE FUNCTION get_next_recommendation(
  p_user_id UUID,
  p_assessment_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  recommendation_id UUID,
  exercise_id UUID,
  reasoning TEXT,
  priority INTEGER,
  confidence_score INTEGER,
  target_characteristic TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.exercise_id,
    r.reasoning,
    r.priority,
    r.confidence_score,
    r.target_characteristic
  FROM public.ai_exercise_recommendations r
  WHERE r.user_id = p_user_id
    AND r.status = 'pending'
    AND (p_assessment_type IS NULL OR r.based_on_assessment_type = p_assessment_type)
    AND (r.expires_at IS NULL OR r.expires_at > NOW())
  ORDER BY r.priority ASC, r.confidence_score DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per accettare una raccomandazione
CREATE OR REPLACE FUNCTION accept_recommendation(
  p_recommendation_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.ai_exercise_recommendations
  SET status = 'accepted', accepted_at = NOW()
  WHERE id = p_recommendation_id
    AND user_id = p_user_id
    AND status = 'pending';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per completare una raccomandazione
CREATE OR REPLACE FUNCTION complete_recommendation(
  p_user_id UUID,
  p_exercise_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE public.ai_exercise_recommendations
  SET status = 'completed', completed_at = NOW()
  WHERE user_id = p_user_id
    AND exercise_id = p_exercise_id
    AND status IN ('pending', 'accepted');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per generare raccomandazioni (chiamata dal backend)
CREATE OR REPLACE FUNCTION generate_recommendations_for_user(
  p_user_id UUID,
  p_assessment_type TEXT,
  p_assessment_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_weak_characteristics TEXT[];
  v_char TEXT;
  v_exercise RECORD;
  v_priority INTEGER := 1;
BEGIN
  -- Questa funzione è un placeholder
  -- La logica vera è implementata nel backend TypeScript
  -- per accedere all'AI e calcolare raccomandazioni intelligenti

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Pulizia raccomandazioni scadute
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS TRIGGER AS $$
BEGIN
  -- Marca come expired le raccomandazioni scadute
  UPDATE public.ai_exercise_recommendations
  SET status = 'expired'
  WHERE expires_at < NOW()
    AND status = 'pending';

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Nota: Questo trigger andrebbe schedulato via cron, non su ogni insert
-- CREATE TRIGGER trigger_cleanup_expired_recommendations
--   AFTER INSERT ON public.ai_exercise_recommendations
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION cleanup_expired_recommendations();

-- ============================================================================
-- COMMENTI DOCUMENTAZIONE
-- ============================================================================

COMMENT ON TABLE public.ai_exercise_recommendations IS 'Raccomandazioni esercizi personalizzate generate dall AI - Framework Evangelista';
COMMENT ON COLUMN public.ai_exercise_recommendations.reasoning IS 'Spiegazione del perché questo esercizio è raccomandato';
COMMENT ON COLUMN public.ai_exercise_recommendations.priority IS 'Priorità della raccomandazione (1 = più alta)';
COMMENT ON COLUMN public.ai_exercise_recommendations.confidence_score IS 'Livello di confidenza dell AI (0-100)';
COMMENT ON COLUMN public.ai_exercise_recommendations.based_on_assessment_type IS 'Tipo assessment: leadership, ostacoli, microfelicita';
COMMENT ON FUNCTION get_next_recommendation IS 'Ottiene la prossima raccomandazione pending per un utente';
COMMENT ON FUNCTION accept_recommendation IS 'Marca una raccomandazione come accettata';
COMMENT ON FUNCTION complete_recommendation IS 'Marca una raccomandazione come completata';
