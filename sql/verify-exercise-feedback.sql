-- Verifica struttura tabella exercise_feedback
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'exercise_feedback'
ORDER BY ordinal_position;
