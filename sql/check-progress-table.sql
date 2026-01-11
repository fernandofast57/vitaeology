-- Tabella progress esercizi
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'user_exercise_progress' ORDER BY ordinal_position;
