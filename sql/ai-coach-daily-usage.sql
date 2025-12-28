-- =============================================
-- TABELLA AI_COACH_DAILY_USAGE
-- Tracking messaggi giornalieri AI Coach per tier
-- =============================================

-- Crea tabella
CREATE TABLE IF NOT EXISTS ai_coach_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_ai_coach_usage_user ON ai_coach_daily_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_usage_date ON ai_coach_daily_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_ai_coach_usage_user_date ON ai_coach_daily_usage(user_id, usage_date);

-- RLS
ALTER TABLE ai_coach_daily_usage ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri dati
CREATE POLICY "Users can view own usage"
  ON ai_coach_daily_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: utenti possono inserire/aggiornare i propri dati
CREATE POLICY "Users can manage own usage"
  ON ai_coach_daily_usage FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNZIONE: get_or_create_daily_usage
-- Ottiene o crea il record di utilizzo giornaliero
-- =============================================
CREATE OR REPLACE FUNCTION get_or_create_daily_usage(p_user_id UUID)
RETURNS TABLE (message_count INTEGER, usage_date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prova a inserire nuovo record per oggi
  INSERT INTO ai_coach_daily_usage (user_id, usage_date, message_count)
  VALUES (p_user_id, CURRENT_DATE, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  -- Restituisci il record corrente
  RETURN QUERY
  SELECT acdu.message_count, acdu.usage_date
  FROM ai_coach_daily_usage acdu
  WHERE acdu.user_id = p_user_id AND acdu.usage_date = CURRENT_DATE;
END;
$$;

-- =============================================
-- FUNZIONE: increment_daily_usage
-- Incrementa il contatore e restituisce il nuovo valore
-- =============================================
CREATE OR REPLACE FUNCTION increment_daily_usage(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_count INTEGER;
BEGIN
  -- Inserisci o aggiorna il contatore
  INSERT INTO ai_coach_daily_usage (user_id, usage_date, message_count, updated_at)
  VALUES (p_user_id, CURRENT_DATE, 1, NOW())
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    message_count = ai_coach_daily_usage.message_count + 1,
    updated_at = NOW()
  RETURNING message_count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- =============================================
-- FUNZIONE: check_daily_limit
-- Verifica se l'utente può inviare un messaggio
-- Restituisce: can_send, current_count, daily_limit
-- =============================================
CREATE OR REPLACE FUNCTION check_ai_coach_limit(
  p_user_id UUID,
  p_daily_limit INTEGER
)
RETURNS TABLE (
  can_send BOOLEAN,
  current_count INTEGER,
  daily_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_count INTEGER;
BEGIN
  -- Ottieni conteggio corrente (crea record se non esiste)
  SELECT COALESCE(acdu.message_count, 0) INTO v_current_count
  FROM ai_coach_daily_usage acdu
  WHERE acdu.user_id = p_user_id AND acdu.usage_date = CURRENT_DATE;

  IF v_current_count IS NULL THEN
    v_current_count := 0;
  END IF;

  -- Restituisci risultato
  RETURN QUERY SELECT
    (v_current_count < p_daily_limit) AS can_send,
    v_current_count AS current_count,
    p_daily_limit AS daily_limit;
END;
$$;
