SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'challenge_subscribers'
ORDER BY ordinal_position;
