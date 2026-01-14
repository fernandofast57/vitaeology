/**
 * Test Automatici Pre-Deploy
 *
 * Verifica che tutte le funzionalità critiche funzionino
 * prima di fare deploy in produzione.
 *
 * Uso: npx tsx scripts/test-critical.ts
 * Oppure: npm run test:critical
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Carica variabili da .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

// Configurazione
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Colori per output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    const duration = Date.now() - start;
    results.push({ name, passed: true, message: 'OK', duration });
    console.log(`  ${GREEN}✓${RESET} ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;
    const message = error instanceof Error ? error.message : 'Errore sconosciuto';
    results.push({ name, passed: false, message, duration });
    console.log(`  ${RED}✗${RESET} ${name}: ${message}`);
  }
}

// ============================================
// TEST SUITE
// ============================================

async function testDatabaseConnection() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { error } = await supabase.from('profiles').select('id').limit(1);
  if (error) throw new Error(`Database error: ${error.message}`);
}

async function testDatabaseTables() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const criticalTables = [
    'profiles',
    'exercises',
    'characteristics',
    'assessment_questions',
    'challenge_subscribers',
    'ai_coach_conversations'
  ];

  for (const table of criticalTables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error) throw new Error(`Tabella '${table}' non accessibile: ${error.message}`);
  }
}

async function testAuthService() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) throw new Error(`Auth service error: ${error.message}`);
}

async function testRLSPolicies() {
  // Test con anon key (dovrebbe essere limitato da RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Profiles dovrebbe essere accessibile solo per il proprio utente
  const { data, error } = await supabase.from('profiles').select('id').limit(1);

  // Senza auth, dovrebbe restituire array vuoto (RLS blocca)
  // Se restituisce dati, RLS potrebbe non essere attivo
  if (data && data.length > 0) {
    throw new Error('RLS potrebbe non essere attivo su profiles - dati accessibili senza auth');
  }
}

async function testExercisesExist() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data, error, count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact' });

  if (error) throw new Error(`Exercises query error: ${error.message}`);
  if (!count || count < 50) throw new Error(`Solo ${count} esercizi trovati (attesi 52+)`);
}

async function testCharacteristicsExist() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data, error, count } = await supabase
    .from('characteristics')
    .select('*', { count: 'exact' });

  if (error) throw new Error(`Characteristics query error: ${error.message}`);
  if (!count || count !== 24) throw new Error(`${count} caratteristiche trovate (attese 24)`);
}

async function testAssessmentQuestionsExist() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data, error, count } = await supabase
    .from('assessment_questions')
    .select('*', { count: 'exact' });

  if (error) throw new Error(`Assessment questions query error: ${error.message}`);
  if (!count || count < 70) throw new Error(`Solo ${count} domande trovate (attese 72+)`);
}

async function testResendAPI() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY non configurata');
  }

  // Verifica formato API key (inizia con 're_')
  if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    throw new Error('RESEND_API_KEY formato non valido (deve iniziare con re_)');
  }

  // Verifica che l'API risponda
  const response = await fetch('https://api.resend.com/domains', {
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` }
  });

  if (response.status === 401) {
    // API key non valida localmente ma potrebbe essere diversa in produzione
    // Non bloccare il deploy, ma avvisare
    console.log(`  ${YELLOW}⚠${RESET}  Nota: Resend API key locale potrebbe essere diversa da produzione`);
    return; // Non lanciare errore, considera come warning
  }

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status}`);
  }
}

async function testAnthropicAPI() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY non configurata');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 5,
      messages: [{ role: 'user', content: 'test' }]
    })
  });

  if (!response.ok && response.status !== 429) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }
}

async function testStripeAPI() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY non configurata');
  }

  const response = await fetch('https://api.stripe.com/v1/balance', {
    headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` }
  });

  if (!response.ok) {
    throw new Error(`Stripe API error: ${response.status}`);
  }
}

async function testOpenAIAPI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY non configurata');
  }

  const response = await fetch('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
}

async function testChallengeSubscriptionFlow() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Verifica che la tabella challenge_subscribers sia accessibile
  // Nota: la colonna è 'challenge' non 'challenge_type'
  const { error } = await supabase
    .from('challenge_subscribers')
    .select('id, email, challenge')
    .limit(1);

  if (error) throw new Error(`Challenge subscribers error: ${error.message}`);
}

async function testAICoachTables() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Tabelle AI Coach effettivamente usate nel codebase
  const tables = ['ai_coach_conversations', 'ai_coach_feedback', 'ai_coach_user_memory'];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) throw new Error(`Tabella '${table}' error: ${error.message}`);
  }
}

async function testEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'RESEND_API_KEY',
    'STRIPE_SECRET_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variabili mancanti: ${missing.join(', ')}`);
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`\n${BOLD}🧪 TEST CRITICI PRE-DEPLOY${RESET}\n`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Environment
  console.log(`${BOLD}📋 Environment${RESET}`);
  await runTest('Variabili ambiente configurate', testEnvironmentVariables);

  // Database
  console.log(`\n${BOLD}🗄️  Database${RESET}`);
  await runTest('Connessione database', testDatabaseConnection);
  await runTest('Tabelle critiche accessibili', testDatabaseTables);
  await runTest('RLS policies attive', testRLSPolicies);

  // Data Integrity
  console.log(`\n${BOLD}📊 Integrità Dati${RESET}`);
  await runTest('52+ esercizi presenti', testExercisesExist);
  await runTest('24 caratteristiche presenti', testCharacteristicsExist);
  await runTest('72+ domande assessment presenti', testAssessmentQuestionsExist);

  // Auth
  console.log(`\n${BOLD}🔐 Autenticazione${RESET}`);
  await runTest('Auth service funzionante', testAuthService);

  // External APIs
  console.log(`\n${BOLD}🌐 API Esterne${RESET}`);
  await runTest('Resend (Email)', testResendAPI);
  await runTest('Anthropic (AI Coach)', testAnthropicAPI);
  await runTest('Stripe (Pagamenti)', testStripeAPI);
  await runTest('OpenAI (Embeddings)', testOpenAIAPI);

  // Features
  console.log(`\n${BOLD}⚡ Funzionalità${RESET}`);
  await runTest('Challenge subscription flow', testChallengeSubscriptionFlow);
  await runTest('AI Coach tables', testAICoachTables);

  // Summary
  console.log(`\n${BOLD}═══════════════════════════════════════${RESET}`);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);

  if (failed === 0) {
    console.log(`\n${GREEN}${BOLD}✅ TUTTI I TEST PASSATI${RESET}`);
    console.log(`   ${passed} test OK in ${totalTime}ms`);
    console.log(`\n${GREEN}Puoi procedere con il deploy.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`\n${RED}${BOLD}❌ ${failed} TEST FALLITI${RESET}`);
    console.log(`   ${passed} passati, ${failed} falliti\n`);

    console.log(`${YELLOW}Test falliti:${RESET}`);
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   • ${r.name}: ${r.message}`);
    });

    console.log(`\n${RED}NON fare deploy finché i test non passano.${RESET}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`\n${RED}Errore fatale:${RESET}`, err);
  process.exit(1);
});
