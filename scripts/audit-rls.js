// Script di audit RLS per Supabase
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:ekZp4mH5mbMK3X%26@db.sayquehhyyxwtrphysqe.supabase.co:5432/postgres';

async function auditRLS() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('='.repeat(70));
    console.log('AUDIT RLS SUPABASE - Vitaeology');
    console.log('='.repeat(70));
    console.log('');

    // 1. Lista tutte le tabelle con stato RLS
    const tablesQuery = `
      SELECT
        schemaname,
        tablename,
        rowsecurity as rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const { rows: tables } = await client.query(tablesQuery);

    // 2. Lista tutte le policy
    const policiesQuery = `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;

    const { rows: policies } = await client.query(policiesQuery);

    // Organizza policy per tabella
    const policyMap = {};
    policies.forEach(p => {
      if (!policyMap[p.tablename]) {
        policyMap[p.tablename] = [];
      }
      policyMap[p.tablename].push(p);
    });

    // Report
    console.log('FASE 1: STATO RLS PER TABELLA');
    console.log('-'.repeat(70));
    console.log('');

    const criticalTables = ['profiles', 'ai_coach_conversations', 'user_assessments',
                           'user_answers', 'challenge_subscribers', 'user_exercise_progress',
                           'ai_coach_daily_metrics', 'challenge_day_completions'];
    const referenceTables = ['characteristics', 'assessment_questions', 'pillars',
                            'exercises', 'book_chunks'];

    let noRLS = [];
    let noPolicy = [];
    let criticalIssues = [];

    tables.forEach(t => {
      const tablePolicies = policyMap[t.tablename] || [];
      const isCritical = criticalTables.includes(t.tablename);
      const isReference = referenceTables.includes(t.tablename);

      let status = '';
      let icon = '';

      if (!t.rls_enabled) {
        icon = '❌';
        status = 'RLS DISABILITATO';
        noRLS.push(t.tablename);
        if (isCritical) criticalIssues.push(t.tablename);
      } else if (tablePolicies.length === 0) {
        icon = '⚠️';
        status = 'RLS ON ma NESSUNA POLICY';
        noPolicy.push(t.tablename);
        if (isCritical) criticalIssues.push(t.tablename);
      } else {
        icon = '✅';
        status = `RLS ON, ${tablePolicies.length} policy`;
      }

      const typeTag = isCritical ? '[CRITICA]' : (isReference ? '[REF]' : '');
      console.log(`${icon} ${t.tablename.padEnd(35)} ${status} ${typeTag}`);
    });

    console.log('');
    console.log('='.repeat(70));
    console.log('RIEPILOGO PROBLEMI');
    console.log('='.repeat(70));
    console.log('');

    if (noRLS.length > 0) {
      console.log(`❌ Tabelle senza RLS (${noRLS.length}):`);
      noRLS.forEach(t => console.log(`   - ${t}`));
      console.log('');
    }

    if (noPolicy.length > 0) {
      console.log(`⚠️ Tabelle con RLS ma senza policy (${noPolicy.length}):`);
      noPolicy.forEach(t => console.log(`   - ${t}`));
      console.log('');
    }

    if (criticalIssues.length > 0) {
      console.log(`🚨 TABELLE CRITICHE DA SISTEMARE IMMEDIATAMENTE:`);
      criticalIssues.forEach(t => console.log(`   - ${t}`));
      console.log('');
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('DETTAGLIO POLICY ESISTENTI');
    console.log('='.repeat(70));
    console.log('');

    Object.keys(policyMap).sort().forEach(tableName => {
      console.log(`📋 ${tableName}:`);
      policyMap[tableName].forEach(p => {
        console.log(`   - ${p.policyname}`);
        console.log(`     Comando: ${p.cmd}, Ruoli: ${p.roles}`);
        if (p.qual) console.log(`     USING: ${p.qual.substring(0, 80)}...`);
      });
      console.log('');
    });

    return { noRLS, noPolicy, criticalIssues, tables, policies };

  } catch (error) {
    console.error('Errore:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

auditRLS().then(result => {
  console.log('');
  console.log('='.repeat(70));
  console.log('Audit completato.');
  process.exit(result.criticalIssues.length > 0 ? 1 : 0);
}).catch(() => process.exit(1));
