-- =====================================================
-- AI Coach Prompt Versions Table
-- Versioning del system prompt per tracciare modifiche
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_coach_prompt_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  version_number INTEGER NOT NULL,
  version_label VARCHAR(50),

  system_prompt TEXT NOT NULL,

  changes_description TEXT,
  changes_reason TEXT,
  related_pattern_id UUID REFERENCES ai_coach_patterns(id),

  is_active BOOLEAN DEFAULT FALSE,

  metrics_before JSONB,
  metrics_after JSONB,

  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solo una versione attiva alla volta
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_prompt
  ON ai_coach_prompt_versions(is_active)
  WHERE is_active = TRUE;

-- Index per version number
CREATE INDEX IF NOT EXISTS idx_prompt_version ON ai_coach_prompt_versions(version_number DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_created ON ai_coach_prompt_versions(created_at DESC);

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

-- RLS
ALTER TABLE ai_coach_prompt_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Admin può gestire versioni prompt
CREATE POLICY "Admins can manage prompt versions"
  ON ai_coach_prompt_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = true OR role_id IN (SELECT id FROM roles WHERE level >= 40))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND (is_admin = true OR role_id IN (SELECT id FROM roles WHERE level >= 40))
    )
  );

-- Policy: Service può leggere versione attiva
CREATE POLICY "Service can read active prompt"
  ON ai_coach_prompt_versions FOR SELECT
  USING (is_active = TRUE);

-- Funzione per attivare una versione (disattiva le altre)
CREATE OR REPLACE FUNCTION activate_prompt_version(p_version_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Disattiva tutte le versioni
  UPDATE ai_coach_prompt_versions
  SET is_active = FALSE
  WHERE is_active = TRUE;

  -- Attiva la versione specificata
  UPDATE ai_coach_prompt_versions
  SET is_active = TRUE
  WHERE id = p_version_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per ottenere la versione attiva
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
  SELECT
    pv.id,
    pv.version_number,
    pv.version_label,
    pv.system_prompt,
    pv.created_at
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
  -- Calcola prossimo numero versione
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next_version
  FROM ai_coach_prompt_versions;

  -- Inserisci nuova versione
  INSERT INTO ai_coach_prompt_versions (
    version_number,
    version_label,
    system_prompt,
    changes_description,
    changes_reason,
    related_pattern_id,
    created_by
  ) VALUES (
    v_next_version,
    COALESCE(p_version_label, 'v' || v_next_version),
    p_system_prompt,
    p_changes_description,
    p_changes_reason,
    p_related_pattern_id,
    auth.uid()
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commenti
COMMENT ON TABLE ai_coach_prompt_versions IS 'Versioning del system prompt Fernando AI Coach. Traccia modifiche, ragioni e metriche prima/dopo.';
COMMENT ON COLUMN ai_coach_prompt_versions.is_active IS 'Solo una versione può essere attiva alla volta (unique partial index)';
COMMENT ON COLUMN ai_coach_prompt_versions.related_pattern_id IS 'Pattern che ha generato questa modifica (se auto-correzione)';
