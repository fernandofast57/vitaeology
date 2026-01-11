SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('characteristic_scores', 'books', 'challenge_subscribers', 'profiles')
ORDER BY table_name;
