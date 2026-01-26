-- Fix views che espongono auth.users
-- Riscrivere usando profiles invece di auth.users

-- 1. DROP e RICREA awareness_level_distribution
DROP VIEW IF EXISTS public.awareness_level_distribution;
CREATE VIEW public.awareness_level_distribution
WITH (security_invoker = on) AS
SELECT
    COALESCE(m.awareness_level, -5) AS level,
    count(*) AS user_count,
    round(avg(COALESCE(m.awareness_score, 0)), 2) AS avg_score
FROM profiles p
LEFT JOIN ai_coach_user_memory m ON p.id = m.user_id
GROUP BY COALESCE(m.awareness_level, -5)
ORDER BY COALESCE(m.awareness_level, -5) DESC;

-- 2. DROP e RICREA user_awareness_summary
DROP VIEW IF EXISTS public.user_awareness_summary;
CREATE VIEW public.user_awareness_summary
WITH (security_invoker = on) AS
SELECT
    p.id,
    p.email,
    COALESCE(m.awareness_level, -7) AS current_level,
    COALESCE(m.awareness_score, 0) AS current_score,
    m.awareness_calculated_at,
    cs.status AS challenge_status,
    cs.challenge AS challenge_type,
    cs.current_day AS challenge_day,
    ua.status AS assessment_status,
    count(DISTINCT acc.id) AS ai_conversations,
    count(DISTINCT uep.id) FILTER (WHERE uep.status = 'completed') AS exercises_completed,
    p.subscription_tier
FROM profiles p
LEFT JOIN ai_coach_user_memory m ON p.id = m.user_id
LEFT JOIN challenge_subscribers cs ON p.email = cs.email
LEFT JOIN user_assessments_v2 ua ON p.id = ua.user_id
LEFT JOIN ai_coach_conversations acc ON p.id = acc.user_id
LEFT JOIN user_exercise_progress uep ON p.id = uep.user_id
GROUP BY p.id, p.email, m.awareness_level, m.awareness_score, m.awareness_calculated_at,
         cs.status, cs.challenge, cs.current_day, ua.status, p.subscription_tier;
