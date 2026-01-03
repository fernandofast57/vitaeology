-- ============================================================================
-- BEHAVIORAL EVENTS - Tracking comportamentale landing pages challenge
-- ============================================================================
-- Tabella per tracciare eventi comportamentali anonimi per analytics
-- e ottimizzazione delle landing pages delle challenge.
--
-- Uso: node scripts/run-sql.js sql/behavioral_events.sql
-- ============================================================================

-- Tabella eventi comportamentali
CREATE TABLE IF NOT EXISTS behavioral_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Identificazione sessione (anonima)
  session_id TEXT NOT NULL,

  -- Contesto challenge
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('leadership', 'ostacoli', 'microfelicita')),
  variant TEXT CHECK (variant IN ('A', 'B', 'C')),

  -- Tipo evento
  event_type TEXT NOT NULL CHECK (event_type IN (
    'page_view',
    'scroll_25', 'scroll_50', 'scroll_75', 'scroll_100',
    'exit_intent_triggered', 'exit_intent_dismissed', 'exit_intent_converted',
    'engagement_high', 'engagement_very_high',
    'return_visitor_identified', 'return_visitor_banner_shown', 'return_visitor_banner_clicked',
    'form_focus', 'form_abandon',
    'badge_shown',
    'time_milestone_30s', 'time_milestone_60s', 'time_milestone_120s'
  )),

  -- Metriche al momento dell'evento
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  scroll_depth INTEGER CHECK (scroll_depth >= 0 AND scroll_depth <= 100),
  time_on_page INTEGER CHECK (time_on_page >= 0),

  -- Contesto visitatore
  is_return_visitor BOOLEAN DEFAULT FALSE,
  visit_count INTEGER DEFAULT 1,

  -- Device e referrer
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per query analytics frequenti
CREATE INDEX IF NOT EXISTS idx_behavioral_challenge_date
  ON behavioral_events(challenge_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_behavioral_event_type
  ON behavioral_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_behavioral_session
  ON behavioral_events(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_behavioral_variant
  ON behavioral_events(challenge_type, variant, created_at DESC);

-- Commento tabella
COMMENT ON TABLE behavioral_events IS 'Tracking comportamentale anonimo per ottimizzazione landing pages challenge';

-- RLS Policy (accesso solo da service role per scrittura)
ALTER TABLE behavioral_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert behavioral events" ON behavioral_events;
DROP POLICY IF EXISTS "Service role can read behavioral events" ON behavioral_events;

-- Create policies
CREATE POLICY "Service role can insert behavioral events"
ON behavioral_events FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can read behavioral events"
ON behavioral_events FOR SELECT
TO service_role
USING (true);

-- ============================================================================
-- QUERY UTILI PER ANALYTICS
-- ============================================================================

-- Ultimi 20 eventi
-- SELECT * FROM behavioral_events ORDER BY created_at DESC LIMIT 20;

-- Conteggio per tipo evento
-- SELECT event_type, COUNT(*) FROM behavioral_events GROUP BY event_type ORDER BY count DESC;

-- Engagement medio per challenge
-- SELECT challenge_type, AVG(engagement_score) as avg_engagement
-- FROM behavioral_events
-- WHERE engagement_score IS NOT NULL
-- GROUP BY challenge_type;

-- Funnel conversion per challenge
-- SELECT
--   challenge_type,
--   COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views,
--   COUNT(*) FILTER (WHERE event_type = 'scroll_50') as scrolled_50,
--   COUNT(*) FILTER (WHERE event_type = 'form_focus') as form_focused,
--   COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') as exit_converted
-- FROM behavioral_events
-- GROUP BY challenge_type;

-- Performance per variante A/B
-- SELECT
--   challenge_type,
--   variant,
--   COUNT(DISTINCT session_id) as sessions,
--   AVG(engagement_score) as avg_engagement,
--   COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') as conversions
-- FROM behavioral_events
-- WHERE variant IS NOT NULL
-- GROUP BY challenge_type, variant
-- ORDER BY challenge_type, variant;
