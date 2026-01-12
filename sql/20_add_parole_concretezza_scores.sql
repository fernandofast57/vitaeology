-- =====================================================
-- Aggiungi score PAROLE e CONCRETEZZA
--
-- Principio di Comprensione - 3 Difficoltà:
-- 1. PAROLE - Termini tecnici spiegati
-- 2. CONCRETEZZA - Esempi concreti presenti
-- 3. GRADUALITÀ - Sequenza logica (già implementato)
-- =====================================================

-- =====================================================
-- 1. Colonne in ai_coach_conversations (tracking automatico)
-- =====================================================

-- Aggiungi colonna parole_score
ALTER TABLE ai_coach_conversations
ADD COLUMN IF NOT EXISTS parole_score INTEGER CHECK (parole_score >= 0 AND parole_score <= 100);

COMMENT ON COLUMN ai_coach_conversations.parole_score IS
'Score automatico 0-100 per PAROLE: termini tecnici spiegati correttamente';

-- Aggiungi colonna concretezza_score
ALTER TABLE ai_coach_conversations
ADD COLUMN IF NOT EXISTS concretezza_score INTEGER CHECK (concretezza_score >= 0 AND concretezza_score <= 100);

COMMENT ON COLUMN ai_coach_conversations.concretezza_score IS
'Score automatico 0-100 per CONCRETEZZA: presenza di esempi concreti';

-- Indici per analisi
CREATE INDEX IF NOT EXISTS idx_conversations_parole
ON ai_coach_conversations(parole_score)
WHERE parole_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_concretezza
ON ai_coach_conversations(concretezza_score)
WHERE concretezza_score IS NOT NULL;

-- =====================================================
-- 2. Colonne in ai_coach_quality_audits (valutazione manuale)
-- =====================================================

-- Aggiungi colonna score_parole
ALTER TABLE ai_coach_quality_audits
ADD COLUMN IF NOT EXISTS score_parole DECIMAL(3,2) CHECK (score_parole >= 1 AND score_parole <= 5);

COMMENT ON COLUMN ai_coach_quality_audits.score_parole IS
'Score manuale 1-5 per PAROLE: termini tecnici spiegati correttamente';

-- Aggiungi colonna score_concretezza
ALTER TABLE ai_coach_quality_audits
ADD COLUMN IF NOT EXISTS score_concretezza DECIMAL(3,2) CHECK (score_concretezza >= 1 AND score_concretezza <= 5);

COMMENT ON COLUMN ai_coach_quality_audits.score_concretezza IS
'Score manuale 1-5 per CONCRETEZZA: presenza di esempi concreti';

-- Indici per query
CREATE INDEX IF NOT EXISTS idx_quality_audits_parole
ON ai_coach_quality_audits(score_parole)
WHERE score_parole IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quality_audits_concretezza
ON ai_coach_quality_audits(score_concretezza)
WHERE score_concretezza IS NOT NULL;

-- =====================================================
-- 3. Aggiorna funzione calcolo score_medio (ora 7 score)
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_quality_audit_score()
RETURNS TRIGGER AS $$
DECLARE
  score_count INTEGER := 0;
  score_sum DECIMAL := 0;
BEGIN
  -- Conta e somma gli score non null

  -- Score originali (4)
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

  -- Score Comprensione dettagliati (3)
  IF NEW.score_parole IS NOT NULL THEN
    score_count := score_count + 1;
    score_sum := score_sum + NEW.score_parole;
  END IF;

  IF NEW.score_concretezza IS NOT NULL THEN
    score_count := score_count + 1;
    score_sum := score_sum + NEW.score_concretezza;
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

-- =====================================================
-- 4. Vista per analisi Comprensione
-- =====================================================

CREATE OR REPLACE VIEW v_comprensione_analysis AS
SELECT
  id,
  user_id,
  created_at,
  parole_score,
  concretezza_score,
  graduality_score,
  -- Score medio comprensione (automatico)
  CASE
    WHEN parole_score IS NOT NULL AND concretezza_score IS NOT NULL AND graduality_score IS NOT NULL
    THEN ROUND((parole_score + concretezza_score + graduality_score) / 3.0)
    ELSE NULL
  END AS comprensione_avg,
  -- Categoria qualità
  CASE
    WHEN COALESCE(parole_score, 0) >= 80 AND COALESCE(concretezza_score, 0) >= 80 AND COALESCE(graduality_score, 0) >= 80 THEN 'excellent'
    WHEN COALESCE(parole_score, 0) >= 70 AND COALESCE(concretezza_score, 0) >= 70 AND COALESCE(graduality_score, 0) >= 70 THEN 'good'
    WHEN COALESCE(parole_score, 0) >= 50 AND COALESCE(concretezza_score, 0) >= 50 AND COALESCE(graduality_score, 0) >= 50 THEN 'needs_improvement'
    ELSE 'poor'
  END AS quality_category
FROM ai_coach_conversations
WHERE parole_score IS NOT NULL
   OR concretezza_score IS NOT NULL
   OR graduality_score IS NOT NULL;

-- =====================================================
-- Note: Struttura score Comprensione
-- =====================================================
--
-- AUTOMATICI (0-100, salvati in ai_coach_conversations):
--   - parole_score: Termini tecnici spiegati
--   - concretezza_score: Esempi concreti presenti
--   - graduality_score: Sequenza logica rispettata
--
-- MANUALI (1-5, salvati in ai_coach_quality_audits):
--   - score_parole: Valutazione manuale PAROLE
--   - score_concretezza: Valutazione manuale CONCRETEZZA
--   - score_gradualita: Valutazione manuale GRADUALITÀ
-- =====================================================
