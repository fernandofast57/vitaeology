-- =====================================================
-- AI Coach Patterns Table
-- Pattern comportamentali con soglie auto-correzione
-- NOTA: Diversa da ai_coach_feedback_patterns
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_coach_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
    'unanswered_question',
    'negative_feedback_cluster',
    'reformulation_trigger',
    'abandonment_trigger',
    'success_pattern'
  )),

  pattern_description TEXT NOT NULL,
  pattern_keywords TEXT[],

  occurrence_count INTEGER DEFAULT 1,
  first_occurrence TIMESTAMPTZ DEFAULT NOW(),
  last_occurrence TIMESTAMPTZ DEFAULT NOW(),

  example_conversation_ids UUID[],

  status VARCHAR(20) DEFAULT 'identified' CHECK (status IN (
    'identified',
    'auto_corrected',
    'pending_review',
    'approved',
    'rejected',
    'resolved'
  )),

  suggested_correction TEXT,
  auto_correction_applied BOOLEAN DEFAULT FALSE,
  auto_correction_at TIMESTAMPTZ,

  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  threshold_reached BOOLEAN DEFAULT FALSE,
  threshold_count INTEGER DEFAULT 3,

  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes per performance
CREATE INDEX IF NOT EXISTS idx_patterns_type ON ai_coach_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_status ON ai_coach_patterns(status);
CREATE INDEX IF NOT EXISTS idx_patterns_occurrence ON ai_coach_patterns(occurrence_count DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_threshold ON ai_coach_patterns(threshold_reached) WHERE threshold_reached = TRUE;
CREATE INDEX IF NOT EXISTS idx_patterns_created ON ai_coach_patterns(created_at DESC);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_patterns_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_patterns_updated ON ai_coach_patterns;
CREATE TRIGGER trigger_patterns_updated
  BEFORE UPDATE ON ai_coach_patterns
  FOR EACH ROW EXECUTE FUNCTION update_patterns_timestamp();

-- RLS
ALTER TABLE ai_coach_patterns ENABLE ROW LEVEL SECURITY;

-- Policy: solo admin può vedere i pattern
CREATE POLICY "Admin can view patterns" ON ai_coach_patterns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = true OR role_id IN (SELECT id FROM roles WHERE level >= 40))
    )
  );

-- Policy: sistema può inserire/aggiornare
CREATE POLICY "Service can manage patterns" ON ai_coach_patterns
  FOR ALL USING (true) WITH CHECK (true);

-- Funzione per incrementare occorrenze pattern
CREATE OR REPLACE FUNCTION increment_pattern_occurrence(
  p_pattern_type VARCHAR(50),
  p_description TEXT,
  p_keywords TEXT[],
  p_conversation_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_pattern_id UUID;
  v_threshold INTEGER;
BEGIN
  -- Cerca pattern esistente simile
  SELECT id, threshold_count INTO v_pattern_id, v_threshold
  FROM ai_coach_patterns
  WHERE pattern_type = p_pattern_type
    AND pattern_description ILIKE '%' || LEFT(p_description, 50) || '%'
  LIMIT 1;

  IF v_pattern_id IS NOT NULL THEN
    -- Incrementa occorrenze
    UPDATE ai_coach_patterns
    SET
      occurrence_count = occurrence_count + 1,
      last_occurrence = NOW(),
      example_conversation_ids = array_append(
        COALESCE(example_conversation_ids, ARRAY[]::UUID[]),
        p_conversation_id
      ),
      threshold_reached = (occurrence_count + 1 >= threshold_count)
    WHERE id = v_pattern_id;

    RETURN v_pattern_id;
  ELSE
    -- Crea nuovo pattern
    INSERT INTO ai_coach_patterns (
      pattern_type,
      pattern_description,
      pattern_keywords,
      example_conversation_ids
    ) VALUES (
      p_pattern_type,
      p_description,
      p_keywords,
      ARRAY[p_conversation_id]
    )
    RETURNING id INTO v_pattern_id;

    RETURN v_pattern_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere pattern che necessitano auto-correzione
CREATE OR REPLACE FUNCTION get_patterns_for_autocorrection()
RETURNS TABLE (
  id UUID,
  pattern_type VARCHAR(50),
  pattern_description TEXT,
  occurrence_count INTEGER,
  suggested_correction TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.pattern_type,
    p.pattern_description,
    p.occurrence_count,
    p.suggested_correction
  FROM ai_coach_patterns p
  WHERE p.threshold_reached = TRUE
    AND p.status = 'identified'
    AND p.auto_correction_applied = FALSE
  ORDER BY p.occurrence_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commenti
COMMENT ON TABLE ai_coach_patterns IS 'Pattern comportamentali AI Coach con soglie per auto-correzione. Diversa da feedback_patterns che aggrega solo feedback negativi.';
COMMENT ON COLUMN ai_coach_patterns.pattern_type IS 'Tipo: unanswered_question (domanda senza risposta utile), negative_feedback_cluster (cluster feedback negativi), reformulation_trigger (causa riformulazioni), abandonment_trigger (causa abbandoni), success_pattern (pattern di successo)';
COMMENT ON COLUMN ai_coach_patterns.threshold_count IS 'Numero occorrenze per attivare auto-correzione (default 3)';
COMMENT ON COLUMN ai_coach_patterns.confidence_score IS 'Score confidenza 0-1 per auto-correzione';
