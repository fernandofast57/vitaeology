-- Verifica tabelle usate dal funnel
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('challenge_subscribers', 'challenge_progress', 'user_assessments', 'user_assessments_v2', 'challenge_feedback', 'challenge_completion_feedback')
ORDER BY table_name;
