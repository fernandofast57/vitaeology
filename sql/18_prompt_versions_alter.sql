-- =====================================================
-- ALTER ai_coach_prompt_versions per completare struttura
-- =====================================================

-- Aggiungi colonne mancanti
ALTER TABLE ai_coach_prompt_versions
ADD COLUMN IF NOT EXISTS related_pattern_id UUID REFERENCES ai_coach_patterns(id),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Copia dati da source_pattern_id a related_pattern_id se esiste
UPDATE ai_coach_prompt_versions
SET related_pattern_id = source_pattern_id::UUID
WHERE source_pattern_id IS NOT NULL AND related_pattern_id IS NULL;

-- Index per version number
CREATE INDEX IF NOT EXISTS idx_prompt_version ON ai_coach_prompt_versions(version_number DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_created ON ai_coach_prompt_versions(created_at DESC);

-- Unique index per versione attiva
DROP INDEX IF EXISTS idx_active_prompt;
CREATE UNIQUE INDEX idx_active_prompt
  ON ai_coach_prompt_versions(is_active)
  WHERE is_active = TRUE;

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_prompt_versions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prompt_versions_updated ON ai_coach_prompt_versions;
CREATE TRIGGER trigger_prompt_versions_updated
  BEFORE UPDATE ON ai_coach_prompt_versions
  FOR EACH ROW EXECUTE FUNCTION update_prompt_versions_timestamp();

-- Funzione per attivare una versione
CREATE OR REPLACE FUNCTION activate_prompt_version(p_version_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE ai_coach_prompt_versions SET is_active = FALSE WHERE is_active = TRUE;
  UPDATE ai_coach_prompt_versions SET is_active = TRUE WHERE id = p_version_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere versione attiva
CREATE OR REPLACE FUNCTION get_active_prompt_version()
RETURNS TABLE (
  id UUID,
  version_number INTEGER,
  version_label VARCHAR(50),
  system_prompt TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT pv.id, pv.version_number, pv.version_label, pv.system_prompt, pv.created_at
  FROM ai_coach_prompt_versions pv
  WHERE pv.is_active = TRUE
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per creare nuova versione
CREATE OR REPLACE FUNCTION create_prompt_version(
  p_system_prompt TEXT,
  p_changes_description TEXT DEFAULT NULL,
  p_changes_reason TEXT DEFAULT NULL,
  p_related_pattern_id UUID DEFAULT NULL,
  p_version_label VARCHAR(50) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_next_version INTEGER;
  v_new_id UUID;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_next_version FROM ai_coach_prompt_versions;

  INSERT INTO ai_coach_prompt_versions (
    version_number, version_label, system_prompt, changes_description, changes_reason, related_pattern_id, created_by
  ) VALUES (
    v_next_version, COALESCE(p_version_label, 'v' || v_next_version), p_system_prompt, p_changes_description, p_changes_reason, p_related_pattern_id, auth.uid()
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
