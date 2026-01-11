-- Rimuovi vincolo vecchio che limita a original, ai_generated, user_suggested
ALTER TABLE exercises DROP CONSTRAINT IF EXISTS exercises_source_type_check;

-- Verifica che rimanga solo chk_source_type
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.exercises'::regclass
AND conname LIKE '%source%';
