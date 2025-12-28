-- =============================================
-- SCHEMA EMAIL AUTOMATION CHALLENGE
-- Aggiornamenti per tracking email challenge
-- =============================================

-- =============================================
-- 1. AGGIORNA challenge_subscribers
-- =============================================

-- Ultima attività utente (per reminder inattività)
ALTER TABLE challenge_subscribers
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Ultimo reminder inviato (evita spam)
ALTER TABLE challenge_subscribers
ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;

-- Data completamento challenge
ALTER TABLE challenge_subscribers
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Tracking email post-challenge (recovery sequence)
ALTER TABLE challenge_subscribers
ADD COLUMN IF NOT EXISTS post_email_1_sent TIMESTAMPTZ;

ALTER TABLE challenge_subscribers
ADD COLUMN IF NOT EXISTS post_email_2_sent TIMESTAMPTZ;

ALTER TABLE challenge_subscribers
ADD COLUMN IF NOT EXISTS post_email_3_sent TIMESTAMPTZ;

-- Indice per query inattività
CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_activity
ON challenge_subscribers(last_activity_at);

-- Indice per query completamento
CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_completed
ON challenge_subscribers(completed_at);

-- =============================================
-- 2. TABELLA email_logs
-- Log di tutte le email inviate
-- =============================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN (
    'challenge_welcome',
    'challenge_day',
    'challenge_reminder',
    'challenge_force_advance',
    'challenge_complete',
    'post_challenge_1',
    'post_challenge_2',
    'post_challenge_3',
    'book_delivery',
    'subscription_welcome',
    'subscription_canceled'
  )),
  challenge_type TEXT CHECK (challenge_type IN (
    'leadership-autentica',
    'oltre-ostacoli',
    'microfelicita'
  )),
  day_number INTEGER CHECK (day_number >= 1 AND day_number <= 7),
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_email_logs_email ON email_logs(email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_challenge ON email_logs(challenge_type, day_number);

-- RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: solo service role può accedere
DROP POLICY IF EXISTS "Service role access email_logs" ON email_logs;
CREATE POLICY "Service role access email_logs" ON email_logs
  FOR ALL USING (true);

-- =============================================
-- 3. FUNZIONI HELPER
-- =============================================

-- Funzione: registra invio email
CREATE OR REPLACE FUNCTION log_email_sent(
  p_email TEXT,
  p_email_type TEXT,
  p_challenge_type TEXT DEFAULT NULL,
  p_day_number INTEGER DEFAULT NULL,
  p_subject TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO email_logs (email, email_type, challenge_type, day_number, subject, metadata)
  VALUES (p_email, p_email_type, p_challenge_type, p_day_number, p_subject, p_metadata)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Funzione: aggiorna last_activity su challenge_subscribers
CREATE OR REPLACE FUNCTION update_challenge_activity(p_subscriber_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE challenge_subscribers
  SET last_activity_at = NOW()
  WHERE id = p_subscriber_id;
END;
$$;

-- Funzione: trova subscribers inattivi (per reminder)
CREATE OR REPLACE FUNCTION get_inactive_subscribers(p_hours_inactive INTEGER DEFAULT 48)
RETURNS TABLE (
  id UUID,
  email TEXT,
  challenge_type TEXT,
  current_day INTEGER,
  last_activity_at TIMESTAMPTZ,
  hours_inactive NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.email,
    cs.challenge_type,
    cs.current_day,
    cs.last_activity_at,
    EXTRACT(EPOCH FROM (NOW() - cs.last_activity_at)) / 3600 AS hours_inactive
  FROM challenge_subscribers cs
  WHERE
    cs.status = 'active'
    AND cs.completed_at IS NULL
    AND cs.last_activity_at < NOW() - (p_hours_inactive || ' hours')::INTERVAL
    AND (
      cs.last_reminder_sent_at IS NULL
      OR cs.last_reminder_sent_at < NOW() - INTERVAL '24 hours'
    );
END;
$$;

-- Funzione: trova subscribers per post-challenge emails
CREATE OR REPLACE FUNCTION get_post_challenge_pending()
RETURNS TABLE (
  id UUID,
  email TEXT,
  challenge_type TEXT,
  completed_at TIMESTAMPTZ,
  days_since_complete INTEGER,
  next_email INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.email,
    cs.challenge_type,
    cs.completed_at,
    EXTRACT(DAY FROM (NOW() - cs.completed_at))::INTEGER AS days_since_complete,
    CASE
      WHEN cs.post_email_1_sent IS NULL THEN 1
      WHEN cs.post_email_2_sent IS NULL THEN 2
      WHEN cs.post_email_3_sent IS NULL THEN 3
      ELSE 0
    END AS next_email
  FROM challenge_subscribers cs
  WHERE
    cs.completed_at IS NOT NULL
    AND cs.post_email_3_sent IS NULL
    AND (
      -- Email 1: 3 giorni dopo completamento
      (cs.post_email_1_sent IS NULL AND cs.completed_at < NOW() - INTERVAL '3 days')
      OR
      -- Email 2: 7 giorni dopo completamento
      (cs.post_email_1_sent IS NOT NULL AND cs.post_email_2_sent IS NULL AND cs.completed_at < NOW() - INTERVAL '7 days')
      OR
      -- Email 3: 14 giorni dopo completamento
      (cs.post_email_2_sent IS NOT NULL AND cs.post_email_3_sent IS NULL AND cs.completed_at < NOW() - INTERVAL '14 days')
    );
END;
$$;
