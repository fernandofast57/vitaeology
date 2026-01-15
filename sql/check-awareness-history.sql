SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_awareness_history'
ORDER BY ordinal_position;
