-- ============================================================
-- CONSULTANT_CERTIFICATIONS: Certificazione consulenti Vitaeology
-- ============================================================
-- Separa il ruolo "Consulente" dalla subscription tier
-- Un utente Mentor può diventare Consulente Certificato
-- Traccia: formazione, esame, certificazione, licenza
-- ============================================================

CREATE TABLE IF NOT EXISTS consultant_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificativo certificazione
  certification_number TEXT UNIQUE, -- 'VIT-2026-001'

  -- Stato certificazione
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- In attesa (ha iniziato formazione)
    'in_training',  -- In formazione
    'exam_pending', -- Formazione completata, attesa esame
    'active',       -- Certificato attivo
    'suspended',    -- Sospeso temporaneamente
    'revoked',      -- Revocato
    'expired'       -- Scaduto
  )),

  -- Formazione
  training_started_at TIMESTAMPTZ,
  training_completed_at TIMESTAMPTZ,
  training_modules_completed INTEGER DEFAULT 0,
  training_modules_total INTEGER DEFAULT 10, -- Es: 10 moduli formazione

  -- Esame
  exam_scheduled_at TIMESTAMPTZ,
  exam_passed_at TIMESTAMPTZ,
  exam_score INTEGER CHECK (exam_score IS NULL OR (exam_score >= 0 AND exam_score <= 100)),
  exam_attempts INTEGER DEFAULT 0,
  exam_max_attempts INTEGER DEFAULT 3,

  -- Certificazione
  certified_at TIMESTAMPTZ,
  certified_by UUID REFERENCES auth.users(id), -- Fernando o admin
  certification_level TEXT DEFAULT 'base' CHECK (certification_level IN (
    'base',       -- Consulente Base
    'advanced',   -- Consulente Avanzato
    'master'      -- Master Consulente
  )),

  -- Licenza
  license_agreement_signed BOOLEAN DEFAULT false,
  license_agreement_signed_at TIMESTAMPTZ,
  license_agreement_version TEXT, -- 'v1.0', 'v2.0'
  territory TEXT, -- Territorio licenza (es: 'Italia Nord', 'Lombardia')

  -- Scadenza e rinnovo
  expires_at TIMESTAMPTZ, -- NULL se permanente
  renewal_reminder_sent_at TIMESTAMPTZ,
  last_renewal_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT, -- Note admin
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Vincoli
  UNIQUE(user_id) -- 1 utente = 1 certificazione
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_consultant_cert_user ON consultant_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_consultant_cert_status ON consultant_certifications(status);
CREATE INDEX IF NOT EXISTS idx_consultant_cert_active ON consultant_certifications(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_consultant_cert_number ON consultant_certifications(certification_number);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_consultant_certifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_consultant_cert_updated_at ON consultant_certifications;
CREATE TRIGGER trigger_consultant_cert_updated_at
  BEFORE UPDATE ON consultant_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_consultant_certifications_updated_at();

-- ============================================================
-- Generazione automatica certification_number
-- ============================================================

CREATE OR REPLACE FUNCTION generate_certification_number()
RETURNS TRIGGER AS $$
DECLARE
  v_year TEXT;
  v_sequence INTEGER;
  v_cert_number TEXT;
BEGIN
  -- Solo se status diventa 'active' e certification_number è NULL
  IF NEW.status = 'active' AND NEW.certification_number IS NULL THEN
    v_year := EXTRACT(YEAR FROM NOW())::TEXT;

    -- Trova prossimo numero sequenziale per quest'anno
    SELECT COALESCE(MAX(
      NULLIF(REGEXP_REPLACE(certification_number, '^VIT-' || v_year || '-', ''), certification_number)::INTEGER
    ), 0) + 1
    INTO v_sequence
    FROM consultant_certifications
    WHERE certification_number LIKE 'VIT-' || v_year || '-%';

    -- Formato: VIT-2026-001
    v_cert_number := 'VIT-' || v_year || '-' || LPAD(v_sequence::TEXT, 3, '0');

    NEW.certification_number := v_cert_number;
    NEW.certified_at := COALESCE(NEW.certified_at, NOW());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_cert_number ON consultant_certifications;
CREATE TRIGGER trigger_generate_cert_number
  BEFORE INSERT OR UPDATE ON consultant_certifications
  FOR EACH ROW
  EXECUTE FUNCTION generate_certification_number();

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE consultant_certifications ENABLE ROW LEVEL SECURITY;

-- Utenti vedono solo la propria certificazione
CREATE POLICY "consultant_cert_select_own" ON consultant_certifications
  FOR SELECT USING (user_id = auth.uid());

-- Admin può vedere tutto
CREATE POLICY "consultant_cert_admin_select" ON consultant_certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Solo admin può inserire/modificare
CREATE POLICY "consultant_cert_admin_insert" ON consultant_certifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "consultant_cert_admin_update" ON consultant_certifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================
-- FUNZIONI HELPER
-- ============================================================

-- Verifica se utente è consulente certificato attivo
CREATE OR REPLACE FUNCTION is_certified_consultant(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_certified BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM consultant_certifications
    WHERE user_id = p_user_id
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_is_certified;

  RETURN v_is_certified;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ottieni dettagli certificazione utente
CREATE OR REPLACE FUNCTION get_consultant_certification(p_user_id UUID)
RETURNS TABLE (
  certification_id UUID,
  certification_number TEXT,
  status TEXT,
  certification_level TEXT,
  certified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  training_progress INTEGER, -- percentuale
  exam_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.certification_number,
    cc.status,
    cc.certification_level,
    cc.certified_at,
    cc.expires_at,
    CASE
      WHEN cc.training_modules_total > 0
      THEN (cc.training_modules_completed * 100 / cc.training_modules_total)
      ELSE 0
    END,
    cc.exam_score
  FROM consultant_certifications cc
  WHERE cc.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inizia processo certificazione
CREATE OR REPLACE FUNCTION start_consultant_certification(
  p_user_id UUID,
  p_admin_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_cert_id UUID;
BEGIN
  INSERT INTO consultant_certifications (
    user_id,
    status,
    training_started_at
  )
  VALUES (
    p_user_id,
    'in_training',
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'in_training',
    training_started_at = COALESCE(consultant_certifications.training_started_at, NOW()),
    updated_at = NOW()
  RETURNING id INTO v_cert_id;

  RETURN v_cert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Completa formazione
CREATE OR REPLACE FUNCTION complete_consultant_training(
  p_user_id UUID,
  p_modules_completed INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE consultant_certifications
  SET
    status = 'exam_pending',
    training_completed_at = NOW(),
    training_modules_completed = COALESCE(p_modules_completed, training_modules_total),
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'in_training';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Registra risultato esame
CREATE OR REPLACE FUNCTION record_consultant_exam(
  p_user_id UUID,
  p_score INTEGER,
  p_passing_score INTEGER DEFAULT 70
)
RETURNS BOOLEAN AS $$
DECLARE
  v_passed BOOLEAN;
BEGIN
  v_passed := p_score >= p_passing_score;

  UPDATE consultant_certifications
  SET
    exam_score = p_score,
    exam_attempts = exam_attempts + 1,
    exam_passed_at = CASE WHEN v_passed THEN NOW() ELSE NULL END,
    status = CASE
      WHEN v_passed THEN 'active'
      WHEN exam_attempts + 1 >= exam_max_attempts THEN 'suspended'
      ELSE 'exam_pending'
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'exam_pending';

  RETURN v_passed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Certifica manualmente (admin)
CREATE OR REPLACE FUNCTION certify_consultant(
  p_user_id UUID,
  p_admin_id UUID,
  p_level TEXT DEFAULT 'base',
  p_territory TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_cert_number TEXT;
BEGIN
  -- Inserisci o aggiorna a status 'active'
  INSERT INTO consultant_certifications (
    user_id,
    status,
    certification_level,
    certified_by,
    certified_at,
    territory,
    expires_at,
    license_agreement_signed,
    license_agreement_signed_at,
    license_agreement_version
  )
  VALUES (
    p_user_id,
    'active',
    p_level,
    p_admin_id,
    NOW(),
    p_territory,
    p_expires_at,
    true,
    NOW(),
    'v1.0'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    certification_level = p_level,
    certified_by = p_admin_id,
    certified_at = COALESCE(consultant_certifications.certified_at, NOW()),
    territory = COALESCE(p_territory, consultant_certifications.territory),
    expires_at = p_expires_at,
    updated_at = NOW()
  RETURNING certification_number INTO v_cert_number;

  RETURN v_cert_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sospendi/Revoca certificazione
CREATE OR REPLACE FUNCTION update_consultant_status(
  p_user_id UUID,
  p_new_status TEXT,
  p_admin_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE consultant_certifications
  SET
    status = p_new_status,
    notes = COALESCE(p_notes, notes),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VIEW: Consulenti attivi con dettagli
-- ============================================================

CREATE OR REPLACE VIEW active_consultants AS
SELECT
  cc.id AS certification_id,
  cc.user_id,
  p.full_name,
  p.email,
  cc.certification_number,
  cc.certification_level,
  cc.territory,
  cc.certified_at,
  cc.expires_at,
  cc.exam_score,
  a.id AS affiliate_id,
  a.ref_code AS codice_affiliato,
  a.totale_clienti_attivi,
  a.totale_commissioni_euro AS totale_commissioni_pagate
FROM consultant_certifications cc
JOIN profiles p ON p.id = cc.user_id
LEFT JOIN affiliates a ON a.user_id = cc.user_id
WHERE cc.status = 'active'
  AND (cc.expires_at IS NULL OR cc.expires_at > NOW())
ORDER BY cc.certified_at DESC;

-- ============================================================
-- COMMENTI
-- ============================================================

COMMENT ON TABLE consultant_certifications IS 'Certificazione consulenti Vitaeology - separata da subscription tier';
COMMENT ON COLUMN consultant_certifications.certification_number IS 'Numero certificazione univoco formato VIT-ANNO-SEQUENZA';
COMMENT ON COLUMN consultant_certifications.status IS 'Stato: pending, in_training, exam_pending, active, suspended, revoked, expired';
COMMENT ON COLUMN consultant_certifications.certification_level IS 'Livello: base, advanced, master';
COMMENT ON COLUMN consultant_certifications.territory IS 'Territorio licenza esclusiva (es: Lombardia, Italia Nord)';
