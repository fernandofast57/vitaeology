-- Verifica dati funnel
SELECT 'challenge_subscribers' as table_name, COUNT(*) as count FROM challenge_subscribers
UNION ALL
SELECT 'user_assessments', COUNT(*) FROM user_assessments
UNION ALL
SELECT 'challenge_feedback', COUNT(*) FROM challenge_feedback
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;
