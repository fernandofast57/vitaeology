-- =====================================================
-- SCHEMA DATABASE: Challenge Funnel + A/B Testing
-- Per Vitaeology - 3 Challenge, 100 Ads Test
-- =====================================================

-- Tabella iscritti alle challenge
CREATE TABLE IF NOT EXISTS challenge_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT,
  challenge TEXT NOT NULL, -- 'leadership-autentica', 'oltre-ostacoli', 'microfelicita'
  variant TEXT DEFAULT 'A', -- 'A', 'B', 'C' per A/B testing

  -- UTM Tracking per capire quale ad funziona
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Stato del percorso
  current_day INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'unsubscribed'

  -- Conversioni successive
  converted_to_assessment BOOLEAN DEFAULT FALSE,
  converted_to_subscription BOOLEAN DEFAULT FALSE,

  -- Timestamps
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Constraint
  UNIQUE(email, challenge)
);

-- Indici per query veloci
CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_challenge ON challenge_subscribers(challenge);
CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_variant ON challenge_subscribers(variant);
CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_utm ON challenge_subscribers(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_challenge_subscribers_status ON challenge_subscribers(status);

-- Tabella eventi A/B testing
CREATE TABLE IF NOT EXISTS ab_test_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge TEXT NOT NULL,
  variant TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'page_view', 'signup', 'day_opened', 'completed', 'converted'
  subscriber_id UUID REFERENCES challenge_subscribers(id),

  -- UTM per tracking ads
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ab_events_challenge ON ab_test_events(challenge);
CREATE INDEX IF NOT EXISTS idx_ab_events_variant ON ab_test_events(variant);
CREATE INDEX IF NOT EXISTS idx_ab_events_type ON ab_test_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ab_events_campaign ON ab_test_events(utm_campaign);

-- Tabella per tracking aperture email
CREATE TABLE IF NOT EXISTS challenge_email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES challenge_subscribers(id),
  challenge TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- 'sent', 'opened', 'clicked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VISTE PER DASHBOARD A/B TESTING
-- =====================================================

-- Vista: Performance per Variante
CREATE OR REPLACE VIEW ab_test_performance AS
SELECT
  challenge,
  variant,
  COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN id END) as page_views,
  COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN subscriber_id END) as signups,
  COUNT(DISTINCT CASE WHEN event_type = 'completed' THEN subscriber_id END) as completed,
  COUNT(DISTINCT CASE WHEN event_type = 'converted' THEN subscriber_id END) as converted,

  -- Conversion rates
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN subscriber_id END)::NUMERIC /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN id END), 0) * 100,
    2
  ) as signup_rate,

  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'converted' THEN subscriber_id END)::NUMERIC /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN subscriber_id END), 0) * 100,
    2
  ) as conversion_rate

FROM ab_test_events
GROUP BY challenge, variant
ORDER BY challenge, variant;

-- Vista: Performance per Campaign (per 100 ads test)
CREATE OR REPLACE VIEW campaign_performance AS
SELECT
  utm_campaign,
  challenge,
  variant,
  COUNT(*) as total_events,
  COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN subscriber_id END) as signups,
  COUNT(DISTINCT CASE WHEN event_type = 'converted' THEN subscriber_id END) as conversions,

  -- Costo per signup (assumendo budget uniforme per ad)
  ROUND(
    COUNT(DISTINCT CASE WHEN event_type = 'signup' THEN subscriber_id END)::NUMERIC /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'page_view' THEN id END), 0) * 100,
    2
  ) as signup_rate

FROM ab_test_events
WHERE utm_campaign IS NOT NULL
GROUP BY utm_campaign, challenge, variant
ORDER BY signups DESC;

-- Vista: Migliore variante per challenge
CREATE OR REPLACE VIEW best_variant_per_challenge AS
SELECT DISTINCT ON (challenge)
  challenge,
  variant as best_variant,
  signup_rate,
  conversion_rate,
  signups as total_signups
FROM ab_test_performance
ORDER BY challenge, signup_rate DESC;

-- =====================================================
-- FUNZIONE: Traccia Page View con variante random
-- =====================================================

CREATE OR REPLACE FUNCTION track_challenge_pageview(
  p_challenge TEXT,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_variant TEXT;
  v_variants TEXT[] := ARRAY['A', 'B', 'C'];
BEGIN
  -- Assegna variante random per A/B test
  v_variant := v_variants[1 + floor(random() * 3)::int];

  -- Registra page view
  INSERT INTO ab_test_events (
    challenge, variant, event_type,
    utm_source, utm_medium, utm_campaign
  ) VALUES (
    p_challenge, v_variant, 'page_view',
    p_utm_source, p_utm_medium, p_utm_campaign
  );

  RETURN v_variant;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE challenge_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_email_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role può tutto
CREATE POLICY "Service role full access subscribers" ON challenge_subscribers
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access events" ON ab_test_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access email_events" ON challenge_email_events
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Anon può inserire (per iscrizione pubblica)
CREATE POLICY "Anon can insert subscribers" ON challenge_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can insert events" ON ab_test_events
  FOR INSERT WITH CHECK (true);
