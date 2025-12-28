-- ============================================================
-- FIX SECURITY DEFINER VIEWS
-- Risolve warning Supabase Linter
-- Data: 2024-12-25
-- ============================================================

-- ============================================================
-- SEZIONE 1: VIEWS USER → SECURITY INVOKER
-- Queste views rispettano le RLS delle tabelle sottostanti
-- ============================================================

-- user_progress_detailed
ALTER VIEW IF EXISTS public.user_progress_detailed SET (security_invoker = true);

-- challenge_user_progress
ALTER VIEW IF EXISTS public.challenge_user_progress SET (security_invoker = true);

-- characteristics_with_exercise_count
ALTER VIEW IF EXISTS public.characteristics_with_exercise_count SET (security_invoker = true);

-- ============================================================
-- SEZIONE 2: VIEWS ADMIN → SECURITY DEFINER + CHECK ADMIN
-- Ricreiamo le views con controllo esplicito ruolo admin
-- ============================================================

-- Helper function per check admin (se non esiste)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role_id IN (SELECT id FROM roles WHERE level >= 80))
  );
$$;

-- 1. ab_test_performance
DROP VIEW IF EXISTS public.ab_test_performance CASCADE;
CREATE OR REPLACE VIEW public.ab_test_performance
WITH (security_invoker = false)
AS
SELECT
  challenge,
  variant,
  COUNT(*) FILTER (WHERE event_type = 'signup') as signups,
  COUNT(*) FILTER (WHERE event_type = 'day_completed') as completions,
  COUNT(*) FILTER (WHERE event_type = 'converted') as conversions,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'converted')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'signup'), 0) * 100,
    2
  ) as conversion_rate
FROM ab_test_events
WHERE public.is_admin()
GROUP BY challenge, variant;

-- 2. admin_dashboard_summary
DROP VIEW IF EXISTS public.admin_dashboard_summary CASCADE;
CREATE OR REPLACE VIEW public.admin_dashboard_summary
WITH (security_invoker = false)
AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_7d,
  (SELECT COUNT(*) FROM challenge_subscribers WHERE status = 'active') as active_challenges,
  (SELECT COUNT(*) FROM ai_coach_conversations WHERE created_at > NOW() - INTERVAL '24 hours') as ai_conversations_24h,
  (SELECT COUNT(*) FROM user_assessments WHERE status = 'completed') as completed_assessments
WHERE public.is_admin();

-- 3. challenge_completion_funnel
DROP VIEW IF EXISTS public.challenge_completion_funnel CASCADE;
CREATE OR REPLACE VIEW public.challenge_completion_funnel
WITH (security_invoker = false)
AS
SELECT
  challenge,
  COUNT(*) as total_subscribers,
  COUNT(*) FILTER (WHERE current_day >= 1) as started,
  COUNT(*) FILTER (WHERE current_day >= 3) as day_3_reached,
  COUNT(*) FILTER (WHERE current_day >= 5) as day_5_reached,
  COUNT(*) FILTER (WHERE current_day = 7 OR status = 'completed') as completed,
  ROUND(
    COUNT(*) FILTER (WHERE current_day = 7 OR status = 'completed')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as completion_rate
FROM challenge_subscribers
WHERE public.is_admin()
GROUP BY challenge;

-- 4. best_variant_per_challenge
DROP VIEW IF EXISTS public.best_variant_per_challenge CASCADE;
CREATE OR REPLACE VIEW public.best_variant_per_challenge
WITH (security_invoker = false)
AS
SELECT DISTINCT ON (challenge)
  challenge,
  variant,
  COUNT(*) FILTER (WHERE event_type = 'converted') as conversions,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'converted')::numeric /
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'signup'), 0) * 100,
    2
  ) as conversion_rate
FROM ab_test_events
WHERE public.is_admin()
GROUP BY challenge, variant
ORDER BY challenge, conversion_rate DESC NULLS LAST;

-- 5. challenge_discovery_analytics
DROP VIEW IF EXISTS public.challenge_discovery_analytics CASCADE;
CREATE OR REPLACE VIEW public.challenge_discovery_analytics
WITH (security_invoker = false)
AS
SELECT
  challenge_type,
  day_number,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_responses,
  AVG(LENGTH(response)) as avg_response_length
FROM challenge_discovery_responses
WHERE public.is_admin()
GROUP BY challenge_type, day_number
ORDER BY challenge_type, day_number;

-- 6. campaign_performance
DROP VIEW IF EXISTS public.campaign_performance CASCADE;
CREATE OR REPLACE VIEW public.campaign_performance
WITH (security_invoker = false)
AS
SELECT
  COALESCE(utm_campaign, 'direct') as campaign,
  COALESCE(utm_source, 'unknown') as source,
  COALESCE(utm_medium, 'unknown') as medium,
  COUNT(*) as subscribers,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE converted_to_assessment = true) as converted
FROM challenge_subscribers
WHERE public.is_admin()
GROUP BY utm_campaign, utm_source, utm_medium
ORDER BY subscribers DESC;

-- 7. ai_coach_weekly_metrics
DROP VIEW IF EXISTS public.ai_coach_weekly_metrics CASCADE;
CREATE OR REPLACE VIEW public.ai_coach_weekly_metrics
WITH (security_invoker = false)
AS
SELECT
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as total_conversations,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(COALESCE(user_message_tokens, 0) + COALESCE(ai_response_tokens, 0)) as avg_tokens,
  SUM(COALESCE(user_message_tokens, 0) + COALESCE(ai_response_tokens, 0)) as total_tokens
FROM ai_coach_conversations
WHERE public.is_admin()
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

-- 8. v_audit_weekly_summary
DROP VIEW IF EXISTS public.v_audit_weekly_summary CASCADE;
CREATE OR REPLACE VIEW public.v_audit_weekly_summary
WITH (security_invoker = false)
AS
SELECT
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as total_audits,
  AVG(COALESCE(score_medio, 0)) as avg_quality_score
FROM ai_coach_quality_audits
WHERE public.is_admin()
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

-- 9. v_top_patterns
DROP VIEW IF EXISTS public.v_top_patterns CASCADE;
CREATE OR REPLACE VIEW public.v_top_patterns
WITH (security_invoker = false)
AS
SELECT
  p.pattern_type,
  p.pattern_name,
  COUNT(m.id) as match_count
FROM ai_coach_patterns p
LEFT JOIN ai_coach_pattern_matches m ON p.id = m.pattern_id
WHERE public.is_admin()
GROUP BY p.id, p.pattern_type, p.pattern_name
ORDER BY match_count DESC
LIMIT 20;

-- 10. challenge_day_stats
DROP VIEW IF EXISTS public.challenge_day_stats CASCADE;
CREATE OR REPLACE VIEW public.challenge_day_stats
WITH (security_invoker = false)
AS
SELECT
  challenge,
  day_number,
  COUNT(*) as completions,
  COUNT(*) FILTER (WHERE action_completed_at IS NOT NULL) as actions_completed,
  AVG(EXTRACT(EPOCH FROM (action_completed_at - email_sent_at))/3600) as avg_hours_to_complete
FROM challenge_day_completions
WHERE public.is_admin()
GROUP BY challenge, day_number
ORDER BY challenge, day_number;

-- ============================================================
-- VERIFICA
-- ============================================================

SELECT
  schemaname,
  viewname,
  definition LIKE '%is_admin()%' as has_admin_check
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
  'ab_test_performance',
  'admin_dashboard_summary',
  'challenge_completion_funnel',
  'best_variant_per_challenge',
  'challenge_discovery_analytics',
  'campaign_performance',
  'ai_coach_weekly_metrics',
  'v_audit_weekly_summary',
  'v_top_patterns',
  'challenge_day_stats'
);
