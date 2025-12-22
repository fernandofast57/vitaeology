-- =====================================================
-- SCHEMA DATABASE: Challenge Day Completions
-- Per tracciare completamento giornaliero email challenge
-- =====================================================

-- Tabella per tracciare completamenti giornalieri
CREATE TABLE IF NOT EXISTS challenge_day_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES challenge_subscribers(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),

  -- Email tracking
  email_sent_at TIMESTAMPTZ,
  email_opened_at TIMESTAMPTZ,
  email_clicked_at TIMESTAMPTZ,

  -- Azione completata (ha risposto alle domande del giorno)
  action_completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: un solo record per subscriber/challenge/day
  UNIQUE(subscriber_id, challenge, day_number)
);

-- =====================================================
-- COLONNE AGGIUNTIVE SU challenge_subscribers
-- =====================================================

-- Aggiungi colonne per tracking email se non esistono
DO $$
BEGIN
  -- last_email_sent_at: quando è stata inviata l'ultima email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenge_subscribers'
    AND column_name = 'last_email_sent_at'
  ) THEN
    ALTER TABLE challenge_subscribers ADD COLUMN last_email_sent_at TIMESTAMPTZ;
  END IF;

  -- last_email_type: tipo dell'ultima email inviata (es. 'day_2', 'day_7')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenge_subscribers'
    AND column_name = 'last_email_type'
  ) THEN
    ALTER TABLE challenge_subscribers ADD COLUMN last_email_type TEXT;
  END IF;

  -- email_errors_count: contatore errori invio
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenge_subscribers'
    AND column_name = 'email_errors_count'
  ) THEN
    ALTER TABLE challenge_subscribers ADD COLUMN email_errors_count INTEGER DEFAULT 0;
  END IF;

  -- last_email_error: ultimo errore email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'challenge_subscribers'
    AND column_name = 'last_email_error'
  ) THEN
    ALTER TABLE challenge_subscribers ADD COLUMN last_email_error TEXT;
  END IF;
END $$;

-- =====================================================
-- INDICI PER PERFORMANCE
-- =====================================================

-- Index per lookup subscriber+challenge
CREATE INDEX IF NOT EXISTS idx_day_completions_subscriber
ON challenge_day_completions(subscriber_id, challenge);

-- Index per query giornaliere
CREATE INDEX IF NOT EXISTS idx_day_completions_day
ON challenge_day_completions(challenge, day_number);

-- Index per email tracking
CREATE INDEX IF NOT EXISTS idx_day_completions_email_sent
ON challenge_day_completions(email_sent_at)
WHERE email_sent_at IS NOT NULL;

-- Index per azioni completate
CREATE INDEX IF NOT EXISTS idx_day_completions_action
ON challenge_day_completions(action_completed_at)
WHERE action_completed_at IS NOT NULL;

-- Index su challenge_subscribers per cron job
CREATE INDEX IF NOT EXISTS idx_subscribers_status_current_day
ON challenge_subscribers(status, current_day)
WHERE status = 'active';

-- Index per tracking email
CREATE INDEX IF NOT EXISTS idx_subscribers_last_email
ON challenge_subscribers(last_email_sent_at);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE challenge_day_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Service role può tutto
CREATE POLICY "Service role full access day_completions"
ON challenge_day_completions
FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- FUNZIONE: Aggiorna timestamp updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_day_completion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per auto-update timestamp
DROP TRIGGER IF EXISTS trigger_day_completion_updated ON challenge_day_completions;
CREATE TRIGGER trigger_day_completion_updated
BEFORE UPDATE ON challenge_day_completions
FOR EACH ROW EXECUTE FUNCTION update_day_completion_timestamp();

-- =====================================================
-- FUNZIONE: Registra invio email giornaliera
-- =====================================================

CREATE OR REPLACE FUNCTION record_challenge_email_sent(
  p_subscriber_id UUID,
  p_challenge TEXT,
  p_day_number INTEGER
)
RETURNS void AS $$
BEGIN
  -- Inserisci o aggiorna completamento giorno
  INSERT INTO challenge_day_completions (
    subscriber_id, challenge, day_number, email_sent_at
  ) VALUES (
    p_subscriber_id, p_challenge, p_day_number, NOW()
  )
  ON CONFLICT (subscriber_id, challenge, day_number)
  DO UPDATE SET email_sent_at = NOW();

  -- Aggiorna subscriber
  UPDATE challenge_subscribers
  SET
    last_email_sent_at = NOW(),
    last_email_type = 'day_' || p_day_number,
    current_day = p_day_number
  WHERE id = p_subscriber_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNZIONE: Registra apertura email
-- =====================================================

CREATE OR REPLACE FUNCTION record_challenge_email_opened(
  p_subscriber_id UUID,
  p_challenge TEXT,
  p_day_number INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE challenge_day_completions
  SET email_opened_at = COALESCE(email_opened_at, NOW())
  WHERE subscriber_id = p_subscriber_id
    AND challenge = p_challenge
    AND day_number = p_day_number;

  -- Registra anche in ab_test_events
  INSERT INTO ab_test_events (
    challenge,
    variant,
    event_type,
    subscriber_id,
    metadata
  )
  SELECT
    p_challenge,
    cs.variant,
    'email_opened',
    p_subscriber_id,
    jsonb_build_object('day_number', p_day_number)
  FROM challenge_subscribers cs
  WHERE cs.id = p_subscriber_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNZIONE: Registra click email
-- =====================================================

CREATE OR REPLACE FUNCTION record_challenge_email_clicked(
  p_subscriber_id UUID,
  p_challenge TEXT,
  p_day_number INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE challenge_day_completions
  SET email_clicked_at = COALESCE(email_clicked_at, NOW())
  WHERE subscriber_id = p_subscriber_id
    AND challenge = p_challenge
    AND day_number = p_day_number;

  -- Registra anche in ab_test_events
  INSERT INTO ab_test_events (
    challenge,
    variant,
    event_type,
    subscriber_id,
    metadata
  )
  SELECT
    p_challenge,
    cs.variant,
    'email_clicked',
    p_subscriber_id,
    jsonb_build_object('day_number', p_day_number)
  FROM challenge_subscribers cs
  WHERE cs.id = p_subscriber_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VISTA: Statistiche completamento per giorno
-- =====================================================

CREATE OR REPLACE VIEW challenge_day_stats AS
SELECT
  challenge,
  day_number,
  COUNT(*) as total_sent,
  COUNT(email_opened_at) as opened,
  COUNT(email_clicked_at) as clicked,
  COUNT(action_completed_at) as actions_completed,
  ROUND(COUNT(email_opened_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as open_rate,
  ROUND(COUNT(email_clicked_at)::NUMERIC / NULLIF(COUNT(email_opened_at), 0) * 100, 1) as click_rate,
  ROUND(COUNT(action_completed_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as completion_rate
FROM challenge_day_completions
WHERE email_sent_at IS NOT NULL
GROUP BY challenge, day_number
ORDER BY challenge, day_number;

-- =====================================================
-- VISTA: Funnel completamento challenge
-- =====================================================

CREATE OR REPLACE VIEW challenge_completion_funnel AS
SELECT
  cs.challenge,
  cs.variant,
  COUNT(*) as total_subscribers,
  COUNT(CASE WHEN cs.current_day >= 1 THEN 1 END) as day_1,
  COUNT(CASE WHEN cs.current_day >= 2 THEN 1 END) as day_2,
  COUNT(CASE WHEN cs.current_day >= 3 THEN 1 END) as day_3,
  COUNT(CASE WHEN cs.current_day >= 4 THEN 1 END) as day_4,
  COUNT(CASE WHEN cs.current_day >= 5 THEN 1 END) as day_5,
  COUNT(CASE WHEN cs.current_day >= 6 THEN 1 END) as day_6,
  COUNT(CASE WHEN cs.current_day >= 7 THEN 1 END) as day_7,
  COUNT(CASE WHEN cs.status = 'completed' THEN 1 END) as completed,
  ROUND(
    COUNT(CASE WHEN cs.status = 'completed' THEN 1 END)::NUMERIC /
    NULLIF(COUNT(*), 0) * 100,
    1
  ) as completion_rate
FROM challenge_subscribers cs
GROUP BY cs.challenge, cs.variant
ORDER BY cs.challenge, cs.variant;
