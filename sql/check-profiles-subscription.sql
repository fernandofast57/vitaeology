-- Verifica colonne subscription in profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name LIKE '%subscription%'
ORDER BY column_name;
