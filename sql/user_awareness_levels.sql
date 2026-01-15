-- =====================================================
-- SISTEMA LIVELLI DI CONSAPEVOLEZZA
--
-- Scala da -34 (Inesistenza) a +21 (Sorgente)
-- Per analytics e segmentazione contenuti (invisibile utente)
-- =====================================================

-- 1. Estensione tabella ai_coach_user_memory
-- Aggiunge campi per tracking awareness
-- Default -7 = Rovina (entry point: percezione di rovina nella propria efficacia)
ALTER TABLE ai_coach_user_memory
ADD COLUMN IF NOT EXISTS awareness_level INT DEFAULT -7,
ADD COLUMN IF NOT EXISTS awareness_score DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS awareness_calculated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS awareness_history JSONB DEFAULT '[]';

-- Commento sui campi
COMMENT ON COLUMN ai_coach_user_memory.awareness_level IS 'Livello consapevolezza (-34 a +21). Default -7 = Rovina (entry point Challenge)';
COMMENT ON COLUMN ai_coach_user_memory.awareness_score IS 'Score 0-100 nel livello corrente';
COMMENT ON COLUMN ai_coach_user_memory.awareness_calculated_at IS 'Ultimo calcolo awareness';
COMMENT ON COLUMN ai_coach_user_memory.awareness_history IS 'Storico progressione livelli';

-- 2. Tabella storico dettagliato (per analytics avanzate)
CREATE TABLE IF NOT EXISTS user_awareness_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INT NOT NULL,
  score DECIMAL NOT NULL,
  indicators JSONB NOT NULL, -- metriche che hanno determinato il livello
  trigger_event TEXT, -- cosa ha causato il ricalcolo
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice per query performance
CREATE INDEX IF NOT EXISTS idx_awareness_history_user
ON user_awareness_history(user_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_awareness_history_level
ON user_awareness_history(level);

-- RLS per user_awareness_history
ALTER TABLE user_awareness_history ENABLE ROW LEVEL SECURITY;

-- Policy: utente vede solo i propri dati
CREATE POLICY "Users can view own awareness history"
ON user_awareness_history FOR SELECT
USING (auth.uid() = user_id);

-- Policy: sistema può inserire (via service role)
CREATE POLICY "Service role can insert awareness history"
ON user_awareness_history FOR INSERT
WITH CHECK (true);

-- 3. View per analytics (accessibile solo admin)
CREATE OR REPLACE VIEW user_awareness_summary AS
SELECT
  u.id,
  u.email,
  COALESCE(m.awareness_level, -7) as current_level,
  COALESCE(m.awareness_score, 0) as current_score,
  m.awareness_calculated_at,
  cs.status as challenge_status,
  cs.challenge as challenge_type,
  cs.current_day as challenge_day,
  ua.status as assessment_status,
  COUNT(DISTINCT acc.id) as ai_conversations,
  COUNT(DISTINCT uep.id) FILTER (WHERE uep.status = 'completed') as exercises_completed,
  p.subscription_tier
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN ai_coach_user_memory m ON u.id = m.user_id
LEFT JOIN challenge_subscribers cs ON u.email = cs.email
LEFT JOIN user_assessments ua ON u.id = ua.user_id
LEFT JOIN ai_coach_conversations acc ON u.id = acc.user_id
LEFT JOIN user_exercise_progress uep ON u.id = uep.user_id
GROUP BY
  u.id,
  u.email,
  m.awareness_level,
  m.awareness_score,
  m.awareness_calculated_at,
  cs.status,
  cs.challenge,
  cs.current_day,
  ua.status,
  p.subscription_tier;

-- 4. View distribuzione per livello (dashboard admin)
CREATE OR REPLACE VIEW awareness_level_distribution AS
SELECT
  COALESCE(m.awareness_level, -5) as level,
  COUNT(*) as user_count,
  ROUND(AVG(COALESCE(m.awareness_score, 0)), 2) as avg_score
FROM auth.users u
LEFT JOIN ai_coach_user_memory m ON u.id = m.user_id
GROUP BY COALESCE(m.awareness_level, -5)
ORDER BY level DESC;

-- 5. View progressione nel tempo (ultimi 30 giorni)
CREATE OR REPLACE VIEW awareness_progression_30d AS
SELECT
  DATE(calculated_at) as date,
  level,
  COUNT(*) as transitions,
  trigger_event
FROM user_awareness_history
WHERE calculated_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(calculated_at), level, trigger_event
ORDER BY date DESC, level DESC;

-- 6. Funzione per ottenere nome livello
CREATE OR REPLACE FUNCTION get_awareness_level_name(level_num INT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE level_num
    -- Sotto Necessità di Cambiare (-34 a -5)
    WHEN -34 THEN 'Inesistenza'
    WHEN -33 THEN 'Disconnessione'
    WHEN -32 THEN 'Non causatività'
    WHEN -31 THEN 'Criminalità'
    WHEN -30 THEN 'Dissociazione'
    WHEN -29 THEN 'Dispersione'
    WHEN -28 THEN 'Erosione'
    WHEN -27 THEN 'Fissità'
    WHEN -26 THEN 'Glee'
    WHEN -25 THEN 'Esaltazione'
    WHEN -24 THEN 'Masochismo'
    WHEN -23 THEN 'Sadismo'
    WHEN -22 THEN 'Allucinazione'
    WHEN -21 THEN 'Segretezza'
    WHEN -20 THEN 'Dualità'
    WHEN -19 THEN 'Distacco'
    WHEN -18 THEN 'Oblio'
    WHEN -17 THEN 'Catatonia'
    WHEN -16 THEN 'Shock'
    WHEN -15 THEN 'Isteria'
    WHEN -14 THEN 'Illusione Ingannevole'
    WHEN -13 THEN 'Irrealtà'
    WHEN -12 THEN 'Disastro'
    WHEN -11 THEN 'Introversione'
    WHEN -10 THEN 'Intontimento'
    WHEN -9 THEN 'Sofferenza'
    WHEN -8 THEN 'Disperazione'
    WHEN -7 THEN 'Rovina'
    WHEN -6 THEN 'Effetto'
    WHEN -5 THEN 'Paura di Peggiorare'
    -- Transizione (-4 a -1)
    WHEN -4 THEN 'Necessità di Cambiare'
    WHEN -3 THEN 'Richiesta'
    WHEN -2 THEN 'Speranza'
    WHEN -1 THEN 'Aiuto'
    -- Percorso Vitaeology (1 a 21)
    WHEN 1 THEN 'Riconoscimento'
    WHEN 2 THEN 'Comunicazione'
    WHEN 3 THEN 'Percezione'
    WHEN 4 THEN 'Orientamento'
    WHEN 5 THEN 'Comprensioni'
    WHEN 6 THEN 'Illuminazione'
    WHEN 7 THEN 'Energia'
    WHEN 8 THEN 'Aggiustamento'
    WHEN 9 THEN 'Corpo'
    WHEN 10 THEN 'Predizione'
    WHEN 11 THEN 'Attività'
    WHEN 12 THEN 'Produzione'
    WHEN 13 THEN 'Risultato'
    WHEN 14 THEN 'Correzione'
    WHEN 15 THEN 'Capacità'
    WHEN 16 THEN 'Scopi'
    WHEN 17 THEN 'Clearing'
    WHEN 18 THEN 'Realizzazione'
    WHEN 19 THEN 'Condizioni'
    WHEN 20 THEN 'Esistenza'
    WHEN 21 THEN 'Sorgente'
    ELSE 'Unknown'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Funzione per ottenere zona di appartenenza
CREATE OR REPLACE FUNCTION get_awareness_zone(level_num INT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN level_num <= -5 THEN 'Sotto Necessità'
    WHEN level_num BETWEEN -4 AND -1 THEN 'Transizione'
    WHEN level_num BETWEEN 1 AND 6 THEN 'Riconoscimento'
    WHEN level_num BETWEEN 7 AND 14 THEN 'Trasformazione'
    WHEN level_num BETWEEN 15 AND 21 THEN 'Padronanza'
    ELSE 'Unknown'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Grant permissions per service role
GRANT ALL ON user_awareness_history TO service_role;
GRANT SELECT ON user_awareness_summary TO service_role;
GRANT SELECT ON awareness_level_distribution TO service_role;
GRANT SELECT ON awareness_progression_30d TO service_role;
GRANT EXECUTE ON FUNCTION get_awareness_level_name TO service_role;
GRANT EXECUTE ON FUNCTION get_awareness_zone TO service_role;
