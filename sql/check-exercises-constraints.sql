-- Verifica vincoli su exercises
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'exercises'::regclass
AND conname LIKE '%source%';

-- Verifica valori attuali
SELECT DISTINCT source_type FROM exercises;
