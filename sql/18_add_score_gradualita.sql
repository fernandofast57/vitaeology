-- =====================================================
-- Aggiungi score_gradualita alla tabella ai_coach_quality_audits
--
-- Questo score misura l'aderenza al principio di Gradualità:
-- - Sequenza logica di apprendimento
-- - Spiegazione termini prima dell'uso
-- - Costruzione passo dopo passo
-- =====================================================

-- Aggiungi colonna score_gradualita
ALTER TABLE ai_coach_quality_audits
ADD COLUMN IF NOT EXISTS score_gradualita DECIMAL(3,2) CHECK (score_gradualita >= 1 AND score_gradualita <= 5);

-- Commento sulla colonna
COMMENT ON COLUMN ai_coach_quality_audits.score_gradualita IS
'Score 1-5 per il principio di Gradualità: sequenza logica, spiegazioni prima dell''uso, costruzione passo dopo passo';

-- Aggiorna funzione di calcolo score_medio (se esiste trigger)
-- La funzione dovrebbe ora includere 5 score invece di 4

CREATE OR REPLACE FUNCTION calculate_quality_audit_score()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER := 0;
  score_sum DECIMAL := 0;
BEGIN
  -- Conta e somma gli score non null
  IF NEW.score_validante IS NOT NULL THEN
    score_count := score_count + 1;
    score_sum := score_sum + NEW.score_validante;
  END IF;

  IF NEW.score_user_agency IS NOT NULL THEN
    score_count := score_count + 1;
    score_sum := score_sum + NEW.score_user_agency;
  END IF;

  IF NEW.score_comprensione IS NOT NULL THEN
    score_count := score_count + 1;
    score_sum := score_sum + NEW.score_comprensione;
  END IF;

  IF NEW.score_conoscenza_operativa IS NOT NULL THEN
    score_count := score_count + 1;
    score_sum := score_sum + NEW.score_conoscenza_operativa;
  END IF;

  IF NEW.score_gradualita IS NOT NULL THEN
    score_count := score_count + 1;
    score_sum := score_sum + NEW.score_gradualita;
  END IF;

  -- Calcola media se ci sono score
  IF score_count > 0 THEN
    NEW.score_medio := score_sum / score_count;
  ELSE
    NEW.score_medio := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ricrea il trigger
DROP TRIGGER IF EXISTS trigger_calculate_quality_score ON ai_coach_quality_audits;
CREATE TRIGGER trigger_calculate_quality_score
  BEFORE INSERT OR UPDATE ON ai_coach_quality_audits
  FOR EACH ROW EXECUTE FUNCTION calculate_quality_audit_score();

-- Indice per query su gradualita
CREATE INDEX IF NOT EXISTS idx_quality_audits_gradualita
ON ai_coach_quality_audits(score_gradualita)
WHERE score_gradualita IS NOT NULL;

-- =====================================================
-- Aggiungi graduality_score anche a ai_coach_conversations
-- per tracking automatico della gradualità risposte
-- =====================================================

ALTER TABLE ai_coach_conversations
ADD COLUMN IF NOT EXISTS graduality_score INTEGER CHECK (graduality_score >= 0 AND graduality_score <= 100);

COMMENT ON COLUMN ai_coach_conversations.graduality_score IS
'Score automatico 0-100 della gradualità della risposta AI (calcolato dal servizio graduality-check)';

-- Indice per analisi gradualità
CREATE INDEX IF NOT EXISTS idx_conversations_graduality
ON ai_coach_conversations(graduality_score)
WHERE graduality_score IS NOT NULL;
