-- Verifica Sistema Affiliati

-- 1. VERIFICA TABELLE
SELECT
  '1. TABELLE AFFILIATE' as sezione,
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ Esiste' ELSE '❌ Mancante' END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'affiliate%'
ORDER BY table_name;

-- 2. VERIFICA FUNZIONI
SELECT
  '2. FUNZIONI AFFILIATE' as sezione,
  routine_name as function_name,
  '✅ Esiste' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%affiliate%'
ORDER BY routine_name;

-- 3. VERIFICA RLS POLICIES
SELECT
  '3. RLS POLICIES' as sezione,
  tablename,
  policyname,
  cmd as operation,
  '✅ Attiva' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'affiliate%'
ORDER BY tablename, policyname;

-- 4. VERIFICA RLS ABILITATO
SELECT
  '4. RLS ENABLED' as sezione,
  relname as table_name,
  CASE WHEN relrowsecurity THEN '✅ RLS Abilitato' ELSE '❌ RLS Disabilitato' END as rls_status
FROM pg_class
WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND relname LIKE 'affiliate%'
  AND relkind = 'r'
ORDER BY relname;

-- 5. CONTEGGIO COLONNE PER TABELLA
SELECT
  '5. STRUTTURA TABELLE' as sezione,
  table_name,
  COUNT(*) as num_colonne
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name LIKE 'affiliate%'
GROUP BY table_name
ORDER BY table_name;
