-- ============================================================
-- MIGRAZIONE: Allineamento Architettura Dashboard Definitiva
-- Data: 18 Gennaio 2026
-- Riferimento: ARCHITETTURA_DASHBOARD_VITAEOLOGY_DEFINITIVA.md
-- ============================================================

-- ============================================================
-- 1. COLLEGAMENTO challenge_subscribers → user_id
-- ============================================================

-- Aggiungi colonna user_id a challenge_subscribers
ALTER TABLE challenge_subscribers
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Indice per lookup veloce per user_id
CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_user_id
ON challenge_subscribers(user_id) WHERE user_id IS NOT NULL;

-- Funzione: Collega automaticamente challenge_subscriber a user quando fa login/signup
CREATE OR REPLACE FUNCTION link_challenge_subscriber_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando un utente si registra o fa login, collega eventuali challenge con la stessa email
  UPDATE challenge_subscribers
  SET user_id = NEW.id
  WHERE email = NEW.email
    AND user_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger su auth.users per collegamento automatico
DROP TRIGGER IF EXISTS trigger_link_challenge_on_user_create ON auth.users;
-- Nota: Il trigger su auth.users richiede accesso superuser,
-- quindi usiamo un approccio diverso: funzione chiamata al login

-- Funzione chiamabile per collegare challenge a utente
CREATE OR REPLACE FUNCTION link_user_challenges(p_user_id UUID, p_email TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE challenge_subscribers
  SET user_id = p_user_id
  WHERE LOWER(email) = LOWER(p_email)
    AND user_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Collega challenge esistenti agli utenti (migrazione dati)
UPDATE challenge_subscribers cs
SET user_id = u.id
FROM auth.users u
WHERE LOWER(cs.email) = LOWER(u.email)
  AND cs.user_id IS NULL;

-- ============================================================
-- 2. VISTA: Challenge utente con dettagli
-- ============================================================

CREATE OR REPLACE VIEW user_challenges_view AS
SELECT
  cs.id,
  cs.user_id,
  cs.email,
  cs.nome,
  cs.challenge,
  cs.variant,
  cs.current_day,
  cs.status,
  cs.converted_to_assessment,
  cs.converted_to_subscription,
  cs.subscribed_at,
  cs.completed_at,
  -- Calcola progresso percentuale
  ROUND((cs.current_day::NUMERIC / 7) * 100) as progress_percentage,
  -- Giorni rimanenti
  CASE
    WHEN cs.status = 'completed' THEN 0
    ELSE 7 - cs.current_day
  END as days_remaining,
  -- Nome challenge leggibile
  CASE cs.challenge
    WHEN 'leadership-autentica' THEN 'Leadership Autentica'
    WHEN 'oltre-ostacoli' THEN 'Oltre gli Ostacoli'
    WHEN 'microfelicita' THEN 'Microfelicita Digitale'
    ELSE cs.challenge
  END as challenge_name,
  -- Colore challenge
  CASE cs.challenge
    WHEN 'leadership-autentica' THEN '#D4AF37'
    WHEN 'oltre-ostacoli' THEN '#10B981'
    WHEN 'microfelicita' THEN '#8B5CF6'
    ELSE '#6B7280'
  END as challenge_color
FROM challenge_subscribers cs
WHERE cs.status != 'unsubscribed';

-- ============================================================
-- 3. TABELLA: Esame Certificazione Mentor
-- ============================================================

CREATE TABLE IF NOT EXISTS mentor_certification_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'passed', 'needs_review', 'failed')),

  -- Punteggi per sezione Leadership
  leadership_dati_stabili DECIMAL(5,2),
  leadership_doingness DECIMAL(5,2),
  leadership_teoria DECIMAL(5,2),

  -- Punteggi per sezione Ostacoli
  ostacoli_dati_stabili DECIMAL(5,2),
  ostacoli_doingness DECIMAL(5,2),
  ostacoli_teoria DECIMAL(5,2),

  -- Punteggi per sezione Microfelicita
  microfelicita_dati_stabili DECIMAL(5,2),
  microfelicita_doingness DECIMAL(5,2),
  microfelicita_teoria DECIMAL(5,2),

  -- Barriere identificate
  barriers_found JSONB DEFAULT '[]',  -- [{type, section, details, resolved}]

  -- Contatori tentativi
  attempt_number INTEGER DEFAULT 1,
  questions_answered INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 240,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  certified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_mentor_exams_user ON mentor_certification_exams(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_exams_status ON mentor_certification_exams(status);

-- ============================================================
-- 4. TABELLA: Risposte Esame Certificazione
-- ============================================================

CREATE TABLE IF NOT EXISTS mentor_exam_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES mentor_certification_exams(id) ON DELETE CASCADE,
  question_id UUID,  -- riferimento a domanda esame (futuro)
  question_number INTEGER NOT NULL,

  -- Risposta
  answer_text TEXT NOT NULL,
  verification_level TEXT NOT NULL CHECK (verification_level IN ('dati_stabili', 'doingness', 'teoria')),
  path_type TEXT NOT NULL CHECK (path_type IN ('leadership', 'ostacoli', 'microfelicita')),

  -- Valutazione AI
  is_correct BOOLEAN,
  score DECIMAL(3,2),  -- 0.00 - 1.00
  barrier_type TEXT CHECK (barrier_type IN (NULL, 'parola_malcompresa', 'mancanza_concretezza', 'gradiente_saltato')),
  ai_feedback TEXT,

  answered_at TIMESTAMPTZ DEFAULT NOW(),
  evaluated_at TIMESTAMPTZ,

  UNIQUE(exam_id, question_number)
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_exam_answers_exam ON mentor_exam_answers(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_path ON mentor_exam_answers(path_type);

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

ALTER TABLE mentor_certification_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_exam_answers ENABLE ROW LEVEL SECURITY;

-- Policy: Utente vede solo i propri esami
CREATE POLICY "Users can view own exams" ON mentor_certification_exams
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exams" ON mentor_certification_exams
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams" ON mentor_certification_exams
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Utente vede solo le proprie risposte
CREATE POLICY "Users can view own answers" ON mentor_exam_answers
  FOR SELECT USING (
    exam_id IN (SELECT id FROM mentor_certification_exams WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own answers" ON mentor_exam_answers
  FOR INSERT WITH CHECK (
    exam_id IN (SELECT id FROM mentor_certification_exams WHERE user_id = auth.uid())
  );

-- Policy: Service role full access
CREATE POLICY "Service role full access exams" ON mentor_certification_exams
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access answers" ON mentor_exam_answers
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 6. FUNZIONE: Verifica prerequisiti esame Mentor
-- ============================================================

CREATE OR REPLACE FUNCTION check_mentor_exam_eligibility(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_tier TEXT;
  v_paths_completed INTEGER;
  v_leadership_complete BOOLEAN;
  v_ostacoli_complete BOOLEAN;
  v_microfelicita_complete BOOLEAN;
BEGIN
  -- Verifica tier
  SELECT subscription_tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;

  -- Verifica percorsi completati
  SELECT
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL),
    BOOL_OR(p.slug = 'leadership' AND up.completed_at IS NOT NULL),
    BOOL_OR(p.slug = 'risolutore' AND up.completed_at IS NOT NULL),
    BOOL_OR(p.slug = 'microfelicita' AND up.completed_at IS NOT NULL)
  INTO v_paths_completed, v_leadership_complete, v_ostacoli_complete, v_microfelicita_complete
  FROM user_pathways up
  JOIN pathways p ON p.id = up.pathway_id
  WHERE up.user_id = p_user_id AND up.is_active = true;

  v_result := jsonb_build_object(
    'eligible', (v_tier = 'mentor' AND v_paths_completed >= 3),
    'tier', COALESCE(v_tier, 'free'),
    'is_mentor', v_tier = 'mentor',
    'paths_completed', v_paths_completed,
    'leadership_complete', COALESCE(v_leadership_complete, false),
    'ostacoli_complete', COALESCE(v_ostacoli_complete, false),
    'microfelicita_complete', COALESCE(v_microfelicita_complete, false),
    'missing_requirements', CASE
      WHEN v_tier != 'mentor' THEN 'Richiesto abbonamento Mentor'
      WHEN v_paths_completed < 3 THEN 'Completa tutti e 3 i percorsi'
      ELSE NULL
    END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. TRIGGER: Aggiorna timestamp
-- ============================================================

CREATE OR REPLACE FUNCTION update_mentor_exam_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_activity_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mentor_exam_updated ON mentor_certification_exams;
CREATE TRIGGER trigger_mentor_exam_updated
BEFORE UPDATE ON mentor_certification_exams
FOR EACH ROW EXECUTE FUNCTION update_mentor_exam_timestamp();

-- ============================================================
-- VERIFICA
-- ============================================================

-- Conta challenge collegate a utenti
SELECT
  'challenge_subscribers' as table_name,
  COUNT(*) as total,
  COUNT(user_id) as linked_to_users,
  COUNT(*) - COUNT(user_id) as not_linked
FROM challenge_subscribers;
