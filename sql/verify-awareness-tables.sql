-- Verifica colonne aggiunte a ai_coach_user_memory
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ai_coach_user_memory'
AND column_name LIKE 'awareness%'
ORDER BY ordinal_position;

-- Verifica tabella user_awareness_history
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_awareness_history'
ORDER BY ordinal_position;

-- Verifica viste create
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE '%awareness%';

-- Verifica funzioni create
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%awareness%';
