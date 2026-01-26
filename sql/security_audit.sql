-- ============================================================
-- SECURITY AUDIT SCRIPT - Vitaeology
-- Eseguire PRIMA di ogni deploy e dopo ogni modifica al DB
-- ============================================================

-- 1. VIEWS CON SECURITY DEFINER (dovrebbero essere ZERO)
SELECT
    schemaname,
    viewname,
    'SECURITY DEFINER - RISCHIO: bypassa RLS' as problema,
    'ALTER VIEW ' || schemaname || '.' || viewname || ' SET (security_invoker = on);' as fix
FROM pg_views
WHERE schemaname = 'public'
AND viewname NOT IN (
    SELECT viewname FROM pg_views v
    JOIN pg_class c ON c.relname = v.viewname
    WHERE c.reloptions @> ARRAY['security_invoker=on']
);

-- 2. TABELLE SENZA RLS (dovrebbero essere ZERO per tabelle con dati utente)
SELECT
    schemaname,
    tablename,
    'RLS DISABILITATO - RISCHIO: accesso non autorizzato' as problema,
    'ALTER TABLE ' || schemaname || '.' || tablename || ' ENABLE ROW LEVEL SECURITY;' as fix
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
    SELECT relname FROM pg_class WHERE relrowsecurity = true
)
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE '_%;'

-- 3. TABELLE CON RLS MA SENZA POLICIES (RLS inutile)
SELECT
    c.relname as tablename,
    'RLS ABILITATO MA NESSUNA POLICY - RISCHIO: nessuno può accedere o tutti possono' as problema
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
AND c.relkind = 'r'
AND c.relrowsecurity = true
AND NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.tablename = c.relname
);

-- 4. FUNZIONI CON SECURITY DEFINER (verificare necessità)
SELECT
    n.nspname as schema,
    p.proname as function_name,
    'SECURITY DEFINER - Verificare se necessario' as warning
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
AND p.prosecdef = true;

-- 5. GRANTS TROPPO PERMISSIVI SU TABELLE
SELECT
    table_schema,
    table_name,
    privilege_type,
    grantee,
    'GRANT ' || privilege_type || ' troppo permissivo per ' || grantee as warning
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND grantee IN ('anon', 'authenticated')
AND privilege_type IN ('DELETE', 'UPDATE', 'INSERT')
AND table_name IN (
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
);

-- 6. COLONNE SENSIBILI ESPOSTE (password, token, secrets)
SELECT
    table_name,
    column_name,
    'COLONNA SENSIBILE - Verificare accesso' as warning
FROM information_schema.columns
WHERE table_schema = 'public'
AND (
    column_name ILIKE '%password%'
    OR column_name ILIKE '%secret%'
    OR column_name ILIKE '%token%'
    OR column_name ILIKE '%api_key%'
    OR column_name ILIKE '%private%'
);

-- 7. RIFERIMENTI A AUTH.USERS (non dovrebbero esistere in public)
SELECT
    viewname,
    'VIEW RIFERISCE AUTH.USERS - RISCHIO: espone dati auth' as problema
FROM pg_views
WHERE schemaname = 'public'
AND definition ILIKE '%auth.users%';

-- 8. CHECK SUPABASE BUILT-IN SECURITY WARNINGS
SELECT * FROM auth.security_warnings();

-- ============================================================
-- RIEPILOGO AUDIT
-- ============================================================
SELECT
    'SECURITY AUDIT COMPLETATO' as status,
    NOW() as timestamp,
    'Verificare tutti i risultati sopra. ZERO problemi = OK' as note;
