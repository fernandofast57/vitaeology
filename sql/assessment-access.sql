-- =============================================
-- TABELLA ASSESSMENT_ACCESS
-- Traccia quali assessment ogni utente può accedere
-- =============================================

-- Crea tabella
CREATE TABLE IF NOT EXISTS assessment_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo assessment: 'lite' (Leadership), 'risolutore', 'microfelicita'
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('lite', 'risolutore', 'microfelicita')),

  -- Come è stato ottenuto l'accesso
  access_source TEXT NOT NULL CHECK (access_source IN ('book_purchase', 'challenge_complete', 'subscription', 'admin_grant', 'trial')),

  -- Riferimento alla fonte (stripe session, challenge subscriber id, etc.)
  source_reference TEXT,

  -- Validità (NULL = permanente)
  expires_at TIMESTAMPTZ,

  -- Stato
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique per utente + tipo assessment
  UNIQUE(user_id, assessment_type)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_assessment_access_user ON assessment_access(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_access_type ON assessment_access(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessment_access_active ON assessment_access(user_id, assessment_type) WHERE is_active = true;

-- RLS
ALTER TABLE assessment_access ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri accessi
CREATE POLICY "Users can view own access"
  ON assessment_access FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: service role può inserire/aggiornare
CREATE POLICY "Service role can manage access"
  ON assessment_access FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- MAPPING LIBRO → ASSESSMENT
-- =============================================
-- leadership → lite
-- risolutore → risolutore
-- microfelicita → microfelicita

-- =============================================
-- MAPPING CHALLENGE → ASSESSMENT
-- =============================================
-- leadership-autentica → lite
-- oltre-ostacoli → risolutore
-- microfelicita → microfelicita

-- =============================================
-- FUNZIONE HELPER: check_assessment_access
-- =============================================
CREATE OR REPLACE FUNCTION check_assessment_access(
  p_user_id UUID,
  p_assessment_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM assessment_access
    WHERE user_id = p_user_id
      AND assessment_type = p_assessment_type
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

-- =============================================
-- FUNZIONE HELPER: grant_assessment_access
-- =============================================
CREATE OR REPLACE FUNCTION grant_assessment_access(
  p_user_id UUID,
  p_assessment_type TEXT,
  p_access_source TEXT,
  p_source_reference TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access_id UUID;
BEGIN
  INSERT INTO assessment_access (
    user_id, assessment_type, access_source, source_reference, expires_at
  ) VALUES (
    p_user_id, p_assessment_type, p_access_source, p_source_reference, p_expires_at
  )
  ON CONFLICT (user_id, assessment_type)
  DO UPDATE SET
    is_active = true,
    access_source = EXCLUDED.access_source,
    source_reference = EXCLUDED.source_reference,
    expires_at = CASE
      WHEN EXCLUDED.expires_at IS NULL THEN NULL  -- permanente sovrascrive temporaneo
      WHEN assessment_access.expires_at IS NULL THEN assessment_access.expires_at
      ELSE GREATEST(assessment_access.expires_at, EXCLUDED.expires_at)
    END,
    granted_at = NOW()
  RETURNING id INTO v_access_id;

  RETURN v_access_id;
END;
$$;

-- =============================================
-- FUNZIONE: get_user_accessible_assessments
-- =============================================
CREATE OR REPLACE FUNCTION get_user_accessible_assessments(p_user_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN ARRAY(
    SELECT assessment_type FROM assessment_access
    WHERE user_id = p_user_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;
