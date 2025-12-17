/**
 * Test completo AI Coach Learning System
 */

const BASE_URL = 'http://localhost:3000';

// Colori per output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, emoji, message) {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

async function testConversation() {
  log('blue', '📝', 'Test 1: Invio conversazione al AI Coach...');

  const response = await fetch(`${BASE_URL}/api/ai-coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'Come posso migliorare la comunicazione con il mio team?' }
      ],
      userContext: {
        userId: 'c7981336-ed0e-42da-9278-bbb8d852c87b', // fernando@vitaeology.com
        userName: 'Fernando',
        completedExercisesCount: 5,
        currentWeek: 2
      }
    })
  });

  const data = await response.json();

  if (response.ok && data.conversationId) {
    log('green', '✅', `Conversazione salvata! ID: ${data.conversationId}`);
    log('green', '✅', `Session ID: ${data.sessionId}`);
    log('yellow', '💬', `Risposta: ${data.message.substring(0, 100)}...`);
    return { conversationId: data.conversationId, sessionId: data.sessionId };
  } else {
    log('red', '❌', `Errore conversazione: ${data.message || JSON.stringify(data)}`);
    return null;
  }
}

async function testFeedback(conversationId, userId) {
  log('blue', '👍', 'Test 2: Invio feedback positivo...');

  const response = await fetch(`${BASE_URL}/api/ai-coach/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      user_id: userId,
      is_helpful: true,
      rating: 5,
      comment: 'Test feedback - risposta molto utile!'
    })
  });

  const data = await response.json();

  if (response.ok && data.success) {
    log('green', '✅', `Feedback salvato! ID: ${data.feedbackId}`);
    return true;
  } else {
    log('red', '❌', `Errore feedback: ${data.error || JSON.stringify(data)}`);
    return false;
  }
}

async function testSignal(conversationId, userId, sessionId) {
  log('blue', '📊', 'Test 3: Registrazione segnale implicito...');

  const response = await fetch(`${BASE_URL}/api/ai-coach/signals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      conversation_id: conversationId,
      user_id: userId,
      session_id: sessionId,
      signal_type: 'completed_exercise',
      metadata: { exercise_id: 1, completion_time_seconds: 300 }
    })
  });

  const data = await response.json();

  if (response.ok && data.success) {
    log('green', '✅', `Segnale registrato! ID: ${data.signalId}`);
    return true;
  } else {
    log('red', '❌', `Errore segnale: ${data.error || JSON.stringify(data)}`);
    return false;
  }
}

async function testDailyMetrics() {
  log('blue', '📈', 'Test 4: Calcolo metriche giornaliere...');

  const response = await fetch(`${BASE_URL}/api/ai-coach/cron/daily-metrics`);
  const data = await response.json();

  if (response.ok && data.success) {
    log('green', '✅', 'Metriche calcolate!');
    console.log('   Metriche:', JSON.stringify(data.metrics, null, 2));
    return true;
  } else {
    log('yellow', '⚠️', `Metriche: ${data.error || 'Nessun dato (normale se primo test)'}`);
    return false;
  }
}

async function testAdminDashboard() {
  log('blue', '🎛️', 'Test 5: Dashboard admin...');

  const response = await fetch(`${BASE_URL}/api/admin/ai-coach/dashboard`);
  const data = await response.json();

  if (response.ok && data.metrics) {
    log('green', '✅', 'Dashboard caricata!');
    console.log('   Metriche:', JSON.stringify(data.metrics, null, 2));
    console.log(`   Pattern trovati: ${data.patterns?.length || 0}`);
    console.log(`   Report: ${data.latestReport ? 'Presente' : 'Nessuno'}`);
    return true;
  } else {
    log('red', '❌', `Errore dashboard: ${data.error || JSON.stringify(data)}`);
    return false;
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(50));
  log('blue', '🧪', 'AI COACH LEARNING SYSTEM - TEST COMPLETO');
  console.log('='.repeat(50) + '\n');

  const testUserId = 'c7981336-ed0e-42da-9278-bbb8d852c87b'; // fernando@vitaeology.com
  let passed = 0;
  let failed = 0;

  // Test 1: Conversazione
  const convResult = await testConversation();
  if (convResult) passed++; else failed++;
  console.log('');

  // Test 2: Feedback (solo se conversazione OK)
  if (convResult) {
    const fbResult = await testFeedback(convResult.conversationId, testUserId);
    if (fbResult) passed++; else failed++;
    console.log('');

    // Test 3: Segnale
    const sigResult = await testSignal(convResult.conversationId, testUserId, convResult.sessionId);
    if (sigResult) passed++; else failed++;
    console.log('');
  }

  // Test 4: Metriche
  const metricsResult = await testDailyMetrics();
  if (metricsResult) passed++;
  console.log('');

  // Test 5: Dashboard
  const dashResult = await testAdminDashboard();
  if (dashResult) passed++; else failed++;
  console.log('');

  // Risultati
  console.log('='.repeat(50));
  log(failed === 0 ? 'green' : 'yellow', '📊', `RISULTATI: ${passed} passati, ${failed} falliti`);
  console.log('='.repeat(50) + '\n');

  if (failed === 0) {
    log('green', '🎉', 'Tutti i test superati! Il Learning System funziona correttamente.');
  } else {
    log('yellow', '⚠️', 'Alcuni test falliti. Verificare i log sopra.');
  }
}

runTests().catch(console.error);
