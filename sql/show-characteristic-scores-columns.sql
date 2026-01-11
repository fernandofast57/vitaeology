SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'characteristic_scores'
ORDER BY ordinal_position;
