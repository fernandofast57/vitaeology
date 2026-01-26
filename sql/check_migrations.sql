-- Verifica stato migrations beta_testers

-- 1. Controlla colonne beta_testers
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'beta_testers'
ORDER BY ordinal_position;

-- 2. Controlla constraints
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'beta_testers'::regclass;

-- 3. Controlla colonne profiles (is_founding_tester, beta_premium_until)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('is_founding_tester', 'beta_premium_until');
