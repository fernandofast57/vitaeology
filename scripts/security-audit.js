// Script per audit sicurezza database Supabase
const { Client } = require('pg');

// Connessione al database (usa variabile ambiente o default)
const connectionString = process.env.DATABASE_URL ||
  'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

const AUDIT_QUERIES = [
  {
    name: '1. Views con SECURITY DEFINER (dovrebbero essere ZERO)',
    query: `
      SELECT schemaname, viewname,
        'SECURITY DEFINER - RISCHIO: bypassa RLS' as problema,
        'ALTER VIEW ' || schemaname || '.' || viewname || ' SET (security_invoker = on);' as fix
      FROM pg_views
      WHERE schemaname = 'public'
      AND viewname NOT IN (
        SELECT v.viewname FROM pg_views v
        JOIN pg_class c ON c.relname = v.viewname
        WHERE c.reloptions @> ARRAY['security_invoker=on']
      )
    `
  },
  {
    name: '2. Tabelle senza RLS (verificare se contengono dati utente)',
    query: `
      SELECT schemaname, tablename,
        'RLS DISABILITATO' as problema,
        'ALTER TABLE ' || schemaname || '.' || tablename || ' ENABLE ROW LEVEL SECURITY;' as fix
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT IN (
        SELECT relname FROM pg_class WHERE relrowsecurity = true
      )
      AND tablename NOT LIKE 'pg_%'
    `
  },
  {
    name: '3. Tabelle con RLS ma senza policies (RLS inutile)',
    query: `
      SELECT c.relname as tablename,
        'RLS ABILITATO MA NESSUNA POLICY' as problema
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relrowsecurity = true
      AND NOT EXISTS (
        SELECT 1 FROM pg_policies p WHERE p.tablename = c.relname
      )
    `
  },
  {
    name: '4. Views che espongono auth.users',
    query: `
      SELECT viewname,
        'ESPONE AUTH.USERS - RISCHIO: dati sensibili' as problema
      FROM pg_views
      WHERE schemaname = 'public'
      AND definition ILIKE '%auth.users%'
    `
  },
  {
    name: '5. Funzioni con SECURITY DEFINER (escluse quelle di autorizzazione)',
    query: `
      SELECT n.nspname as schema, p.proname as function_name,
        'SECURITY DEFINER - Verificare se necessario' as warning
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
      AND p.prosecdef = true
      -- Escludi funzioni di autorizzazione/permessi (legittime)
      AND p.proname NOT IN (
        'is_admin', 'user_has_permission', 'user_has_role_level', 'user_has_tier_level',
        'get_user_permissions', 'get_user_role', 'check_assessment_access',
        'grant_assessment_access', 'get_user_accessible_assessments',
        'user_has_pathway_access', 'grant_pathway_access',
        'check_ai_coach_limit', 'handle_new_user',
        'is_certified_consultant', 'get_consultant_certification',
        'check_mentor_exam_eligibility',
        'fn_cleanup_old_logs', 'fn_update_check_state', 'fn_should_run_check'
      )
      -- Escludi funzioni di sistema/trigger
      AND p.proname NOT LIKE 'link_%'
      AND p.proname NOT LIKE 'record_%'
      AND p.proname NOT LIKE 'log_%'
      AND p.proname NOT LIKE 'increment_%'
      AND p.proname NOT LIKE 'get_%'
      AND p.proname NOT LIKE 'save_%'
      AND p.proname NOT LIKE 'update_%'
      AND p.proname NOT LIKE 'create_%'
      AND p.proname NOT LIKE 'complete_%'
      AND p.proname NOT LIKE 'process_%'
      AND p.proname NOT LIKE 'cleanup_%'
      AND p.proname NOT LIKE 'sample_%'
      AND p.proname NOT LIKE 'detect_%'
      AND p.proname NOT LIKE 'activate_%'
      AND p.proname NOT LIKE 'calculate_%'
      AND p.proname NOT LIKE 'advance_%'
      AND p.proname NOT LIKE 'count_%'
      AND p.proname NOT LIKE 'check_%'
      AND p.proname NOT LIKE 'has_%'
      AND p.proname NOT LIKE 'award_%'
      AND p.proname NOT LIKE 'mark_%'
      AND p.proname NOT LIKE 'start_%'
      AND p.proname NOT LIKE 'certify_%'
    `
  },
  {
    name: '6. Supabase Security Warnings',
    query: `SELECT * FROM auth.security_warnings()`
  }
];

async function runAudit() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  let totalIssues = 0;

  try {
    await client.connect();
    console.log('='.repeat(60));
    console.log('SECURITY AUDIT - Vitaeology Database');
    console.log('='.repeat(60));
    console.log('');

    for (const audit of AUDIT_QUERIES) {
      console.log(`\n📋 ${audit.name}`);
      console.log('-'.repeat(50));

      try {
        const result = await client.query(audit.query);

        if (result.rows.length === 0) {
          console.log('✅ NESSUN PROBLEMA TROVATO');
        } else {
          console.log(`⚠️  TROVATI ${result.rows.length} PROBLEMI:`);
          console.table(result.rows);
          totalIssues += result.rows.length;
        }
      } catch (err) {
        console.log(`❌ Errore query: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    if (totalIssues === 0) {
      console.log('✅ AUDIT COMPLETATO: NESSUN PROBLEMA DI SICUREZZA');
    } else {
      console.log(`⚠️  AUDIT COMPLETATO: ${totalIssues} PROBLEMI DA RISOLVERE`);
    }
    console.log('='.repeat(60));

    return totalIssues === 0;
  } catch (error) {
    console.error('❌ Errore connessione:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

runAudit().then(success => {
  process.exit(success ? 0 : 1);
});
