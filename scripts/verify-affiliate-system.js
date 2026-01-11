#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('=== VERIFICA SISTEMA AFFILIATI ===\n');

  // 1. Verifica tabelle
  console.log('📦 1. TABELLE AFFILIATE:');
  const expectedTables = [
    'affiliates',
    'affiliate_links',
    'affiliate_clicks',
    'affiliate_commissions',
    'affiliate_payouts'
  ];

  for (const tableName of expectedTables) {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log(`  ❌ ${tableName} - NON ESISTE`);
    } else if (error) {
      console.log(`  ⚠️ ${tableName} - Errore: ${error.message}`);
    } else {
      console.log(`  ✅ ${tableName} - OK`);
    }
  }

  // 2. Verifica funzioni (chiamandole con parametri dummy)
  console.log('\n⚙️ 2. FUNZIONI:');

  // Test get_affiliate_stats
  const { data: statsResult, error: statsError } = await supabase
    .rpc('get_affiliate_stats', { p_affiliate_id: '00000000-0000-0000-0000-000000000000' });

  if (statsError && statsError.message.includes('does not exist')) {
    console.log('  ❌ get_affiliate_stats - NON ESISTE');
  } else {
    console.log('  ✅ get_affiliate_stats - OK');
  }

  // Test get_affiliate_leaderboard
  const { data: leaderResult, error: leaderError } = await supabase
    .rpc('get_affiliate_leaderboard', { p_limit: 1 });

  if (leaderError && leaderError.message.includes('does not exist')) {
    console.log('  ❌ get_affiliate_leaderboard - NON ESISTE');
  } else {
    console.log('  ✅ get_affiliate_leaderboard - OK');
  }

  // Test altre funzioni
  const otherFunctions = [
    { name: 'get_valid_affiliate_cookie', params: { p_cookie_id: 'test' } },
    { name: 'get_affiliate_from_visitor', params: { p_visitor_id: 'test' } },
    { name: 'expire_old_affiliate_cookies', params: {} },
    { name: 'calculate_affiliate_commission', params: { p_affiliate_id: '00000000-0000-0000-0000-000000000000', p_prezzo_prodotto: 100 } },
    { name: 'check_affiliate_category_upgrade', params: { p_affiliate_id: '00000000-0000-0000-0000-000000000000' } },
  ];

  for (const fn of otherFunctions) {
    const { error } = await supabase.rpc(fn.name, fn.params);
    if (error && error.message.includes('does not exist')) {
      console.log(`  ❌ ${fn.name} - NON ESISTE`);
    } else {
      console.log(`  ✅ ${fn.name} - OK`);
    }
  }

  // 3. Verifica RLS via query
  console.log('\n🔒 3. RLS POLICIES (via pg_policies):');
  const { data: policies, error: policyError } = await supabase
    .from('pg_policies')
    .select('tablename, policyname')
    .like('tablename', 'affiliate%');

  // RLS check via raw query non funziona con Supabase client,
  // facciamo check alternativo

  // Verifica se RLS blocca accesso non autenticato
  // (service_role bypassa RLS, quindi testiamo con anon)
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log('  Testing RLS con client anonimo...');

  for (const tableName of expectedTables) {
    const { data, error } = await anonClient
      .from(tableName)
      .select('id')
      .limit(1);

    // Se RLS è attivo, dovrebbe bloccare o restituire vuoto
    if (error) {
      console.log(`  ✅ ${tableName} - RLS attivo (access denied)`);
    } else if (data && data.length === 0) {
      console.log(`  ✅ ${tableName} - RLS attivo (empty result)`);
    } else {
      console.log(`  ⚠️ ${tableName} - RLS potrebbe non essere configurato correttamente`);
    }
  }

  // 4. Struttura tabelle
  console.log('\n📊 4. STRUTTURA TABELLE:');

  const tableColumns = {
    'affiliates': ['id', 'user_id', 'nome', 'email', 'ref_code', 'categoria', 'stato', 'commissione_percentuale'],
    'affiliate_links': ['id', 'affiliate_id', 'nome', 'url_destinazione', 'challenge_type'],
    'affiliate_clicks': ['id', 'affiliate_id', 'ref_code', 'visitor_id', 'cookie_id', 'stato_conversione'],
    'affiliate_commissions': ['id', 'affiliate_id', 'customer_user_id', 'prodotto', 'importo_commissione_euro', 'stato'],
    'affiliate_payouts': ['id', 'affiliate_id', 'importo_euro', 'metodo_pagamento', 'stato']
  };

  for (const [tableName, expectedCols] of Object.entries(tableColumns)) {
    const { data, error } = await supabase
      .from(tableName)
      .select(expectedCols.join(','))
      .limit(0);

    if (error) {
      console.log(`  ⚠️ ${tableName}: Errore - ${error.message}`);
    } else {
      console.log(`  ✅ ${tableName}: ${expectedCols.length} colonne chiave presenti`);
    }
  }

  console.log('\n=== VERIFICA COMPLETATA ===');
}

main().catch(console.error);
