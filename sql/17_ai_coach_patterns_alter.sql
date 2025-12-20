-- =====================================================
-- ALTER ai_coach_patterns per aggiungere colonne mancanti
-- =====================================================

-- Aggiungi colonne per auto-correzione se non esistono
ALTER TABLE ai_coach_patterns
ADD COLUMN IF NOT EXISTS pattern_description TEXT,
ADD COLUMN IF NOT EXISTS pattern_keywords TEXT[],
ADD COLUMN IF NOT EXISTS occurrence_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS first_occurrence TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_occurrence TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS example_conversation_ids UUID[],
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'identified',
ADD COLUMN IF NOT EXISTS suggested_correction TEXT,
ADD COLUMN IF NOT EXISTS auto_correction_applied BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_correction_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS threshold_reached BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS threshold_count INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS reviewed_by UUID,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Aggiungi constraint status se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_coach_patterns_status_check'
  ) THEN
    ALTER TABLE ai_coach_patterns
    ADD CONSTRAINT ai_coach_patterns_status_check
    CHECK (status IN ('identified', 'auto_corrected', 'pending_review', 'approved', 'rejected', 'resolved'));
  END IF;
END $$;

-- Indexes aggiuntivi
CREATE INDEX IF NOT EXISTS idx_patterns_status ON ai_coach_patterns(status);
CREATE INDEX IF NOT EXISTS idx_patterns_occurrence ON ai_coach_patterns(occurrence_count DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_threshold ON ai_coach_patterns(threshold_reached) WHERE threshold_reached = TRUE;

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
  SELECT id, threshold_count INTO v_pattern_id, v_threshold
  FROM ai_coach_patterns
  WHERE pattern_type = p_pattern_type
    AND (pattern_description ILIKE '%' || LEFT(p_description, 50) || '%'
         OR description ILIKE '%' || LEFT(p_description, 50) || '%')
  LIMIT 1;

  IF v_pattern_id IS NOT NULL THEN
    UPDATE ai_coach_patterns
    SET
      occurrence_count = COALESCE(occurrence_count, 0) + 1,
      last_occurrence = NOW(),
      example_conversation_ids = array_append(
        COALESCE(example_conversation_ids, ARRAY[]::UUID[]),
        p_conversation_id
      ),
      threshold_reached = (COALESCE(occurrence_count, 0) + 1 >= COALESCE(threshold_count, 3))
    WHERE id = v_pattern_id;

    RETURN v_pattern_id;
  ELSE
    INSERT INTO ai_coach_patterns (
      pattern_type,
      pattern_description,
      pattern_keywords,
      example_conversation_ids,
      pattern_name
    ) VALUES (
      p_pattern_type,
      p_description,
      p_keywords,
      ARRAY[p_conversation_id],
      LEFT(p_description, 100)
    )
    RETURNING id INTO v_pattern_id;

    RETURN v_pattern_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere pattern per auto-correzione
CREATE OR REPLACE FUNCTION get_patterns_for_autocorrection()
RETURNS TABLE (
  id UUID,
  pattern_type TEXT,
  pattern_description TEXT,
  occurrence_count INTEGER,
  suggested_correction TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.pattern_type,
    COALESCE(p.pattern_description, p.description) as pattern_description,
    COALESCE(p.occurrence_count, p.times_detected) as occurrence_count,
    COALESCE(p.suggested_correction, p.suggested_fix) as suggested_correction
  FROM ai_coach_patterns p
  WHERE COALESCE(p.threshold_reached, FALSE) = TRUE
    AND COALESCE(p.status, 'identified') = 'identified'
    AND COALESCE(p.auto_correction_applied, FALSE) = FALSE
  ORDER BY COALESCE(p.occurrence_count, p.times_detected) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
