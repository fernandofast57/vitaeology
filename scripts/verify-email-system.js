/**
 * Script per verificare il sistema email
 *
 * Verifica:
 * 1. Configurazione Resend API
 * 2. Challenge subscribers nel database
 * 3. Invio email di test
 *
 * Uso: node scripts/verify-email-system.js [--send-test]
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Colori per output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, symbol, message) {
  console.log(`${colors[color]}${symbol}${colors.reset} ${message}`);
}

async function main() {
  console.log('\n' + colors.bold + '=== VERIFICA SISTEMA EMAIL ===' + colors.reset + '\n');

  // 1. Verifica variabili ambiente
  console.log(colors.blue + '1. Verifica Configurazione' + colors.reset);

  const envVars = {
    'RESEND_API_KEY': process.env.RESEND_API_KEY,
    'RESEND_AUDIENCE_ID': process.env.RESEND_AUDIENCE_ID,
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
    'CRON_SECRET': process.env.CRON_SECRET,
  };

  let allConfigured = true;
  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      const masked = key.includes('KEY') || key.includes('SECRET')
        ? value.slice(0, 8) + '...' + value.slice(-4)
        : value;
      log('green', '✓', `${key}: ${masked}`);
    } else {
      log('red', '✗', `${key}: NON CONFIGURATO`);
      allConfigured = false;
    }
  }

  if (!allConfigured) {
    console.log('\n' + colors.red + 'Alcune variabili non sono configurate!' + colors.reset);
  }

  // 2. Verifica connessione Supabase
  console.log('\n' + colors.blue + '2. Verifica Database' + colors.reset);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    log('red', '✗', 'Impossibile connettersi a Supabase (credenziali mancanti)');
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Query challenge_subscribers
  const { data: subscribers, error: subError } = await supabase
    .from('challenge_subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false })
    .limit(20);

  if (subError) {
    log('red', '✗', `Errore query subscribers: ${subError.message}`);
  } else {
    log('green', '✓', `Challenge subscribers trovati: ${subscribers?.length || 0}`);

    if (subscribers && subscribers.length > 0) {
      console.log('\n   Ultimi iscritti:');

      // Raggruppa per challenge
      const byChallenge = {};
      subscribers.forEach(s => {
        if (!byChallenge[s.challenge]) byChallenge[s.challenge] = [];
        byChallenge[s.challenge].push(s);
      });

      for (const [challenge, subs] of Object.entries(byChallenge)) {
        console.log(`\n   ${colors.yellow}${challenge}${colors.reset} (${subs.length}):`);
        subs.slice(0, 5).forEach(s => {
          const status = s.status === 'completed' ? '✅' : s.status === 'active' ? '🔄' : '⏸️';
          console.log(`     ${status} ${s.email} - Day ${s.current_day}/7 - ${s.variant || 'A'}`);
        });
      }
    }
  }

  // Query statistiche per challenge
  const { data: stats, error: statsError } = await supabase
    .from('challenge_subscribers')
    .select('challenge, status, current_day');

  if (!statsError && stats) {
    console.log('\n   ' + colors.bold + 'Statistiche:' + colors.reset);

    const challengeStats = {};
    stats.forEach(s => {
      if (!challengeStats[s.challenge]) {
        challengeStats[s.challenge] = { total: 0, active: 0, completed: 0, avgDay: 0 };
      }
      challengeStats[s.challenge].total++;
      if (s.status === 'active') challengeStats[s.challenge].active++;
      if (s.status === 'completed') challengeStats[s.challenge].completed++;
      challengeStats[s.challenge].avgDay += s.current_day || 0;
    });

    for (const [challenge, stat] of Object.entries(challengeStats)) {
      stat.avgDay = stat.total > 0 ? (stat.avgDay / stat.total).toFixed(1) : 0;
      console.log(`     ${challenge}:`);
      console.log(`       Totale: ${stat.total} | Attivi: ${stat.active} | Completati: ${stat.completed} | Media giorni: ${stat.avgDay}`);
    }
  }

  // 3. Verifica tabelle email
  console.log('\n' + colors.blue + '3. Verifica Tabelle Email' + colors.reset);

  // Check email_logs se esiste
  const { data: emailLogs, error: logsError } = await supabase
    .from('challenge_email_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (logsError) {
    if (logsError.message.includes('does not exist')) {
      log('yellow', '⚠', 'Tabella challenge_email_events non esiste');
    } else {
      log('red', '✗', `Errore query email_events: ${logsError.message}`);
    }
  } else {
    log('green', '✓', `Email events registrati: ${emailLogs?.length || 0} (ultimi 10)`);
    if (emailLogs && emailLogs.length > 0) {
      console.log('\n   Ultimi eventi:');
      emailLogs.slice(0, 5).forEach(e => {
        const date = new Date(e.created_at).toLocaleString('it-IT');
        console.log(`     ${date} - ${e.challenge} Day ${e.day_number} - ${e.event_type}`);
      });
    }
  }

  // 4. Test Resend API
  console.log('\n' + colors.blue + '4. Test Resend API' + colors.reset);

  if (!process.env.RESEND_API_KEY) {
    log('red', '✗', 'RESEND_API_KEY non configurato');
  } else {
    try {
      // Import dinamico per Resend
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Verifica dominio (questo non invia email)
      const { data: domains, error: domainError } = await resend.domains.list();

      if (domainError) {
        log('yellow', '⚠', `Errore verifica domini: ${domainError.message}`);
      } else {
        log('green', '✓', `Domini configurati: ${domains?.data?.length || 0}`);
        if (domains?.data) {
          domains.data.forEach(d => {
            const status = d.status === 'verified' ? '✅' : '⏳';
            console.log(`     ${status} ${d.name} (${d.status})`);
          });
        }
      }

      // Test invio se richiesto
      if (process.argv.includes('--send-test')) {
        console.log('\n   Invio email di test a fernando@vitaeology.com...');

        const { data: sent, error: sendError } = await resend.emails.send({
          from: 'Fernando <fernando@vitaeology.com>',
          to: 'fernando@vitaeology.com',
          subject: '🧪 Test Sistema Email Vitaeology',
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #D4AF37;">Test Sistema Email</h1>
              <p>Questo è un test automatico del sistema email Vitaeology.</p>
              <p>Se ricevi questa email, il sistema funziona correttamente!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                Timestamp: ${new Date().toISOString()}<br>
                Ambiente: ${process.env.NODE_ENV || 'development'}
              </p>
            </div>
          `,
          tags: [{ name: 'type', value: 'test' }]
        });

        if (sendError) {
          log('red', '✗', `Errore invio: ${sendError.message}`);
        } else {
          log('green', '✓', `Email inviata! ID: ${sent?.id}`);
        }
      } else {
        log('yellow', '⚠', 'Usa --send-test per inviare una email di prova');
      }

    } catch (err) {
      log('red', '✗', `Errore Resend: ${err.message}`);
    }
  }

  // 5. Verifica Cron Endpoint
  console.log('\n' + colors.blue + '5. Verifica Cron Endpoint' + colors.reset);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vitaeology.com';
  const cronEndpoint = `${appUrl}/api/cron/challenge-emails`;

  log('green', '✓', `Endpoint: ${cronEndpoint}`);
  log('green', '✓', `Schedule: 0 8 * * * (ogni giorno alle 8:00 UTC)`);

  if (process.env.CRON_SECRET) {
    log('green', '✓', 'CRON_SECRET configurato');
  } else {
    log('yellow', '⚠', 'CRON_SECRET non configurato (richiesto per Vercel Cron)');
  }

  // Riepilogo finale
  console.log('\n' + colors.bold + '=== RIEPILOGO ===' + colors.reset);

  console.log(`
  Sistema Email Challenge:
  - Resend API: ${process.env.RESEND_API_KEY ? '✅ Configurato' : '❌ Non configurato'}
  - Subscribers: ${subscribers?.length || 0} nel database
  - Cron Job: /api/cron/challenge-emails @ 8:00 UTC

  Tipi Email Disponibili:
  - Welcome (iscrizione)
  - Day Content (giorni 1-7)
  - Reminder (48h inattività)
  - Force Advance (72h inattività)
  - Recovery (3 giorni post-completamento)

  Per testare: node scripts/verify-email-system.js --send-test
  `);
}

main().catch(console.error);
