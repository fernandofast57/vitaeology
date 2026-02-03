-- ============================================================================
-- Challenge Beta Feedback Table
-- Feedback dettagliato per beta tester (obiettivo: 30+ feedback, 10+ testimonials)
-- ============================================================================

-- Tabella per feedback beta tester
CREATE TABLE IF NOT EXISTS challenge_beta_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference (può essere null per feedback anonimi)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Challenge info
  challenge_type TEXT NOT NULL,  -- leadership, ostacoli, microfelicita

  -- Rating (1-5 stelle)
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),

  -- NPS Score (0-10)
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),

  -- Feedback strutturato
  what_worked TEXT,          -- Cosa ha funzionato meglio
  what_could_improve TEXT,   -- Cosa miglioreresti

  -- Testimonial
  testimonial TEXT,          -- Testo per testimonial pubblico
  testimonial_consent BOOLEAN DEFAULT false,  -- Consenso uso pubblico
  display_name TEXT,         -- Nome da mostrare con testimonial

  -- Beta-specific flags
  is_beta_tester BOOLEAN DEFAULT true,
  would_recommend BOOLEAN,   -- Raccomanderesti ad un amico?

  -- UTM tracking (per capire da dove arrivano i feedback)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,

  -- Metadata
  completed_days INTEGER DEFAULT 7,  -- Quanti giorni ha completato

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE challenge_beta_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: users possono vedere solo i propri feedback
CREATE POLICY "Users can view own feedback"
  ON challenge_beta_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users possono inserire feedback
CREATE POLICY "Users can insert feedback"
  ON challenge_beta_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: service role può leggere tutto (per admin dashboard)
CREATE POLICY "Service role full access"
  ON challenge_beta_feedback FOR ALL
  USING (auth.role() = 'service_role');

-- Indice per query admin
CREATE INDEX idx_beta_feedback_challenge ON challenge_beta_feedback(challenge_type);
CREATE INDEX idx_beta_feedback_rating ON challenge_beta_feedback(overall_rating);
CREATE INDEX idx_beta_feedback_nps ON challenge_beta_feedback(nps_score);
CREATE INDEX idx_beta_feedback_consent ON challenge_beta_feedback(testimonial_consent) WHERE testimonial_consent = true;

-- View per testimonials approvati (solo quelli con consenso)
CREATE VIEW challenge_approved_testimonials
WITH (security_invoker = on) AS
SELECT
  id,
  challenge_type,
  overall_rating,
  testimonial,
  display_name,
  created_at
FROM challenge_beta_feedback
WHERE testimonial_consent = true
  AND testimonial IS NOT NULL
  AND LENGTH(testimonial) > 20;

-- Commento
COMMENT ON TABLE challenge_beta_feedback IS 'Feedback dettagliato beta tester per obiettivo 30+ feedback, 10+ testimonials';
