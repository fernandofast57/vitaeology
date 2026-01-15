SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ai_coach_user_memory'
AND column_name LIKE 'awareness%'
ORDER BY ordinal_position;
