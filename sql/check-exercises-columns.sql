-- Verifica colonne tabella exercises
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;
