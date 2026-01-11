-- ============================================================================
-- MIGRAZIONE: user_radar_snapshots
-- Descrizione: Snapshot periodici del radar per confronto prima/dopo
-- Data: 11/01/2026
-- Framework: Evangelista Vitaeology - Sistema Radar Evolutivo
-- ============================================================================

-- Tabella snapshot radar
CREATE TABLE IF NOT EXISTS public.user_radar_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relazione con utente
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Data snapshot
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Tipo assessment (3 porte)
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('leadership', 'ostacoli', 'microfelicita')),

  -- Punteggi radar in formato JSON
  -- Leadership: { "pilastri": {...}, "caratteristiche": {...} }
  -- Ostacoli: { "filtri": {...}, "traditori": {...} }
  -- Microfelicita: { "radar": {...}, "sabotatori": {...} }
  scores_json JSONB NOT NULL,

  -- Cosa ha generato lo snapshot
  triggered_by TEXT NOT NULL CHECK (triggered_by IN ('assessment_complete', 'exercise_complete', 'manual', 'periodic')),

  -- Timestamp creazione
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index composito per query frequenti (radar utente per tipo)
CREATE INDEX IF NOT EXISTS idx_radar_snapshots_user_type
  ON public.user_radar_snapshots(user_id, assessment_type);

-- Index per ordinamento cronologico (confronto prima/dopo)
CREATE INDEX IF NOT EXISTS idx_radar_snapshots_date_desc
  ON public.user_radar_snapshots(snapshot_date DESC);

-- Index per query su trigger type
CREATE INDEX IF NOT EXISTS idx_radar_snapshots_triggered
  ON public.user_radar_snapshots(triggered_by);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Abilita RLS
ALTER TABLE public.user_radar_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Utenti possono vedere i propri snapshot
CREATE POLICY "Users can view own snapshots"
  ON public.user_radar_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Utenti possono inserire i propri snapshot
CREATE POLICY "Users can insert own snapshots"
  ON public.user_radar_snapshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role full access (per cron/admin)
CREATE POLICY "Service role full access snapshots"
  ON public.user_radar_snapshots
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- FUNZIONI HELPER
-- ============================================================================

-- Funzione per ottenere l'ultimo snapshot di un utente per tipo
CREATE OR REPLACE FUNCTION get_latest_radar_snapshot(
  p_user_id UUID,
  p_assessment_type TEXT
)
RETURNS TABLE (
  snapshot_id UUID,
  snapshot_date TIMESTAMPTZ,
  scores JSONB,
  triggered_by TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    user_radar_snapshots.snapshot_date,
    scores_json,
    user_radar_snapshots.triggered_by
  FROM public.user_radar_snapshots
  WHERE user_id = p_user_id
    AND assessment_type = p_assessment_type
  ORDER BY user_radar_snapshots.snapshot_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per calcolare delta tra due snapshot
CREATE OR REPLACE FUNCTION calculate_radar_delta(
  p_user_id UUID,
  p_assessment_type TEXT,
  p_from_date TIMESTAMPTZ DEFAULT NULL,
  p_to_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_from_scores JSONB;
  v_to_scores JSONB;
  v_delta JSONB;
BEGIN
  -- Ottieni snapshot "from" (primo o da data specificata)
  IF p_from_date IS NULL THEN
    SELECT scores_json INTO v_from_scores
    FROM public.user_radar_snapshots
    WHERE user_id = p_user_id AND assessment_type = p_assessment_type
    ORDER BY snapshot_date ASC
    LIMIT 1;
  ELSE
    SELECT scores_json INTO v_from_scores
    FROM public.user_radar_snapshots
    WHERE user_id = p_user_id
      AND assessment_type = p_assessment_type
      AND snapshot_date >= p_from_date
    ORDER BY snapshot_date ASC
    LIMIT 1;
  END IF;

  -- Ottieni snapshot "to" (ultimo o da data specificata)
  IF p_to_date IS NULL THEN
    SELECT scores_json INTO v_to_scores
    FROM public.user_radar_snapshots
    WHERE user_id = p_user_id AND assessment_type = p_assessment_type
    ORDER BY snapshot_date DESC
    LIMIT 1;
  ELSE
    SELECT scores_json INTO v_to_scores
    FROM public.user_radar_snapshots
    WHERE user_id = p_user_id
      AND assessment_type = p_assessment_type
      AND snapshot_date <= p_to_date
    ORDER BY snapshot_date DESC
    LIMIT 1;
  END IF;

  -- Ritorna entrambi gli snapshot per calcolo delta lato client
  RETURN jsonb_build_object(
    'from', v_from_scores,
    'to', v_to_scores,
    'has_change', v_from_scores IS DISTINCT FROM v_to_scores
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTI DOCUMENTAZIONE
-- ============================================================================

COMMENT ON TABLE public.user_radar_snapshots IS 'Snapshot periodici radar per confronto prima/dopo - Framework Evangelista';
COMMENT ON COLUMN public.user_radar_snapshots.assessment_type IS 'Tipo porta: leadership, ostacoli, microfelicita';
COMMENT ON COLUMN public.user_radar_snapshots.scores_json IS 'Punteggi radar in formato JSON specifico per ogni porta';
COMMENT ON COLUMN public.user_radar_snapshots.triggered_by IS 'Evento che ha generato lo snapshot';
COMMENT ON FUNCTION get_latest_radar_snapshot IS 'Ottiene ultimo snapshot radar per utente e tipo';
COMMENT ON FUNCTION calculate_radar_delta IS 'Calcola differenza tra snapshot per visualizzare progresso';
