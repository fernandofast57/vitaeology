-- ============================================================================
-- BEHAVIORAL ANALYTICS QUERIES
-- File: sql/behavioral_analytics_queries.sql
-- Descrizione: Query per monitoraggio dati behavioral tracking
-- ============================================================================

-- 1. Conteggio eventi ultimi 7 giorni per challenge
-- Mostra la distribuzione degli eventi per tipo e challenge
SELECT
  challenge_type,
  event_type,
  COUNT(*) as count
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY challenge_type, event_type
ORDER BY challenge_type, count DESC;

-- 2. Funnel conversione per challenge
-- Visualizza il funnel: views -> scroll -> engagement -> conversion
SELECT
  challenge_type,
  COUNT(*) FILTER (WHERE event_type = 'page_view') as views,
  COUNT(*) FILTER (WHERE event_type = 'scroll_50') as scroll_50,
  COUNT(*) FILTER (WHERE event_type = 'engagement_high') as engaged,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') as converted
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY challenge_type;

-- 3. Engagement medio per variante A/B/C
-- Confronta performance delle varianti per ottimizzazione A/B testing
SELECT
  challenge_type,
  variant,
  ROUND(AVG(engagement_score)::numeric, 1) as avg_engagement,
  COUNT(DISTINCT session_id) as sessions
FROM behavioral_events
WHERE engagement_score IS NOT NULL
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY challenge_type, variant
ORDER BY challenge_type, avg_engagement DESC;

-- 4. Device breakdown
-- Analisi per tipo dispositivo (mobile, tablet, desktop)
SELECT
  device_type,
  COUNT(DISTINCT session_id) as sessions,
  ROUND(AVG(engagement_score)::numeric, 1) as avg_engagement
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY device_type;

-- 5. Return visitors performance
-- Confronta visitatori nuovi vs ritorno
SELECT
  challenge_type,
  is_return_visitor,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') as conversions
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY challenge_type, is_return_visitor;

-- 6. Top UTM campaigns
-- Performance per campagna marketing
SELECT
  utm_campaign,
  utm_source,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') as conversions,
  ROUND(AVG(engagement_score)::numeric, 1) as avg_engagement
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
  AND utm_campaign IS NOT NULL
GROUP BY utm_campaign, utm_source
ORDER BY sessions DESC
LIMIT 20;

-- 7. Hourly distribution
-- Distribuzione oraria delle visite (per ottimizzare timing ads)
SELECT
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') as conversions
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- 8. Scroll depth analysis
-- Analisi profondità scroll per challenge
SELECT
  challenge_type,
  COUNT(*) FILTER (WHERE event_type = 'scroll_25') as scroll_25,
  COUNT(*) FILTER (WHERE event_type = 'scroll_50') as scroll_50,
  COUNT(*) FILTER (WHERE event_type = 'scroll_75') as scroll_75,
  COUNT(*) FILTER (WHERE event_type = 'scroll_100') as scroll_100
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY challenge_type;

-- 9. Exit intent effectiveness
-- Efficacia del popup exit intent
SELECT
  challenge_type,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent_triggered') as triggered,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent_dismissed') as dismissed,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') as converted,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'exit_intent_triggered'), 0),
    1
  ) as conversion_rate
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY challenge_type;

-- 10. Daily trend
-- Trend giornaliero ultimi 7 giorni
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(*) as events,
  COUNT(*) FILTER (WHERE event_type = 'exit_intent_converted') as conversions,
  ROUND(AVG(engagement_score)::numeric, 1) as avg_engagement
FROM behavioral_events
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;
