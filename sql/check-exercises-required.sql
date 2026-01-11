-- Verifica colonne richieste e valori esistenti
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;
