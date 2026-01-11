-- Verifica se exercise_feedback esiste
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'exercise_feedback';
