-- Verifica valori attuali source_type
SELECT DISTINCT source_type, COUNT(*) as cnt
FROM exercises
GROUP BY source_type;

-- Mostra definizione constraint
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
WHERE conrelid = 'public.exercises'::regclass;
