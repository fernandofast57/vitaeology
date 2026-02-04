/**
 * Cron Job: Email Automatiche Challenge
 *
 * Esegue 5 processi:
 * 0. Day Content (Welcome → Day 1) - Invia Day 1 ai nuovi iscritti
 * 0.5. Daily Content (Day 2-7) - Invia email giorno successivo dopo completamento
 * 1. Reminder 48h - Per utenti inattivi
 * 2. Force Reminder 72h - Incoraggiamento a riprendere (senza auto-advance)
 * 3. Sequenza post-challenge (24h, 72h, 7 giorni)
 *
 * Vercel Cron: GET /api/cron/challenge-emails (8:00 UTC)
 * Manual: POST con Authorization: Bearer ${CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendChallengeEmail } from '@/lib/email/challenge-emails';
import { alertAPIError } from '@/lib/error-alerts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type ChallengeType = 'leadership-autentica' | 'oltre-ostacoli' | 'microfelicita';

interface CronResults {
  day_content_sent: number;
  day_content_errors: number;
  reminders_sent: number;
  reminders_errors: number;
  force_unlocks: number;
  force_unlock_errors: number;
  post_challenge_sent: number;
  post_challenge_errors: number;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function runCronJob(): Promise<{ success: boolean; results: CronResults; duration_ms: number; error?: string; debug?: Record<string, unknown> }> {
  const startTime = Date.now();
  const supabase = getSupabase();

  // Debug info per troubleshooting
  const debug: Record<string, unknown> = {
    startedAt: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
    }
  };

  const results: CronResults = {
    day_content_sent: 0,
    day_content_errors: 0,
    reminders_sent: 0,
    reminders_errors: 0,
    force_unlocks: 0,
    force_unlock_errors: 0,
    post_challenge_sent: 0,
    post_challenge_errors: 0,
  };

  try {
    console.log('🚀 [Cron] Challenge emails cron job STARTED at', new Date().toISOString());

    // ========================================
    // DEBUG: Mostra tutti gli iscritti attivi per diagnostica
    // ========================================
    const { data: allActive, error: allActiveError } = await supabase
      .from('challenge_subscribers')
      .select('id, email, challenge, current_day, status, last_email_type, last_email_sent_at, subscribed_at')
      .eq('status', 'active')
      .order('subscribed_at', { ascending: false })
      .limit(20);

    debug.allActiveSubscribers = {
      count: allActive?.length || 0,
      error: allActiveError?.message || null,
      subscribers: allActive || []
    };

    console.log(`📊 [Cron] Totale iscritti attivi: ${allActive?.length || 0}`);
    if (allActive && allActive.length > 0) {
      console.log('📊 [Cron] Ultimi iscritti:', JSON.stringify(allActive.slice(0, 5), null, 2));
    }

    // ========================================
    // 0. DAY CONTENT - Nuovi iscritti (welcome -> day 1)
    // ========================================
    console.log('📧 [Cron] Inizio invio Day Content...');

    // Trova utenti che hanno ricevuto welcome email più di 2h fa
    // e sono pronti per ricevere il contenuto del giorno
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    console.log(`📧 [Cron] Query: status=active, last_email_type=welcome, last_email_sent_at < ${twoHoursAgo}`);

    const { data: newSubscribers, error: newSubError } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .eq('last_email_type', 'welcome')
      .lt('last_email_sent_at', twoHoursAgo)
      .lte('current_day', 7);

    debug.dayContentQuery = {
      twoHoursAgo,
      found: newSubscribers?.length || 0,
      error: newSubError?.message || null,
      subscribers: newSubscribers?.map(s => ({
        id: s.id,
        email: s.email,
        challenge: s.challenge,
        current_day: s.current_day,
        last_email_type: s.last_email_type,
        last_email_sent_at: s.last_email_sent_at
      })) || []
    };

    if (newSubError) {
      console.error('[Cron] Errore query newSubscribers:', newSubError.message);
    } else if (newSubscribers && newSubscribers.length > 0) {
      console.log(`📧 [Cron] Trovati ${newSubscribers.length} nuovi iscritti per Day Content`);

      for (const user of newSubscribers) {
        try {
          // Se current_day è 0, invia Day 1. Altrimenti invia current_day + 1
          const dayToSend = user.current_day === 0 ? 1 : Math.min(user.current_day + 1, 7);

          console.log(`📧 [Cron] Tentativo invio Day ${dayToSend} a ${user.email} (challenge: ${user.challenge}, current_day: ${user.current_day})`);

          const result = await sendChallengeEmail(
            user.email,
            'day_content',
            user.challenge as ChallengeType,
            dayToSend,
            user.nome || undefined
          );

          if (result.success) {
            console.log(`✅ [Cron] Email Day ${dayToSend} INVIATA a ${user.email}`);

            const { error: updateError } = await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'day_content'
              })
              .eq('id', user.id);

            if (updateError) {
              console.error(`❌ [Cron] Errore update subscriber ${user.email}:`, updateError.message);
            }

            // Log evento (non bloccare se fallisce)
            try {
              await supabase.from('challenge_email_events').insert({
                subscriber_id: user.id,
                challenge: user.challenge,
                day_number: dayToSend,
                event_type: 'sent',
                created_at: new Date().toISOString()
              });
            } catch {
              // Ignora errori di logging
            }

            results.day_content_sent++;
          } else {
            console.error(`❌ [Cron] Day content FALLITO per ${user.email}:`, result.error);
            results.day_content_errors++;
          }
        } catch (err) {
          console.error(`❌ [Cron] Day content EXCEPTION per ${user.email}:`, err);
          results.day_content_errors++;
        }
      }
    } else {
      console.log('📧 [Cron] Nessun nuovo iscritto trovato per Day Content');
    }

    // ========================================
    // 0.5 DAILY CONTENT DAY 2-7 - Utenti che hanno completato un giorno
    // Logica: current_day >= 1 significa che l'utente ha completato almeno Day 1
    // Invia email per current_day + 1 (il prossimo giorno sbloccato)
    // Usa challenge_email_events per evitare doppi invii
    // ========================================
    console.log('📧 [Cron] Inizio invio Daily Content Day 2-7...');

    const { data: activeDailyUsers, error: dailyError } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .gte('current_day', 1)
      .lt('current_day', 7);

    debug.dailyContentQuery = {
      found: activeDailyUsers?.length || 0,
      error: dailyError?.message || null,
      subscribers: activeDailyUsers?.map(s => ({
        id: s.id,
        email: s.email,
        challenge: s.challenge,
        current_day: s.current_day,
        last_email_type: s.last_email_type
      })) || []
    };

    if (dailyError) {
      console.error('[Cron] Errore query dailyUsers:', dailyError.message);
    } else if (activeDailyUsers && activeDailyUsers.length > 0) {
      console.log(`📧 [Cron] Trovati ${activeDailyUsers.length} utenti attivi per Daily Content Day 2-7`);

      for (const user of activeDailyUsers) {
        try {
          const nextDay = user.current_day + 1;

          // Verifica se email per nextDay è già stata inviata
          const { data: existingEmail } = await supabase
            .from('challenge_email_events')
            .select('id')
            .eq('subscriber_id', user.id)
            .eq('challenge', user.challenge)
            .eq('day_number', nextDay)
            .eq('event_type', 'sent')
            .limit(1);

          if (existingEmail && existingEmail.length > 0) {
            continue; // Email già inviata per questo giorno
          }

          console.log(`📧 [Cron] Invio Day ${nextDay} a ${user.email} (current_day: ${user.current_day})`);

          const result = await sendChallengeEmail(
            user.email,
            'day_content',
            user.challenge as ChallengeType,
            nextDay,
            user.nome || undefined
          );

          if (result.success) {
            console.log(`✅ [Cron] Email Day ${nextDay} INVIATA a ${user.email}`);

            await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'day_content'
              })
              .eq('id', user.id);

            // Log evento
            try {
              await supabase.from('challenge_email_events').insert({
                subscriber_id: user.id,
                challenge: user.challenge,
                day_number: nextDay,
                event_type: 'sent',
                created_at: new Date().toISOString()
              });
            } catch {
              // Ignora errori di logging
            }

            results.day_content_sent++;
          } else {
            console.error(`❌ [Cron] Daily Content Day ${nextDay} FALLITO per ${user.email}:`, result.error);
            results.day_content_errors++;
          }
        } catch (err) {
          console.error(`❌ [Cron] Daily Content EXCEPTION per ${user.email}:`, err);
          results.day_content_errors++;
        }
      }
    } else {
      console.log('📧 [Cron] Nessun utente trovato per Daily Content Day 2-7');
    }

    // ========================================
    // 1. REMINDER 48H - Utenti inattivi dopo day_content
    // ========================================
    console.log('📧 [Cron] Inizio processo reminder 48h...');

    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: inactiveUsers, error: inactiveError } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .eq('last_email_type', 'day_content')
      .lt('last_email_sent_at', fortyEightHoursAgo)
      .lt('current_day', 7);

    debug.reminderQuery = {
      fortyEightHoursAgo,
      found: inactiveUsers?.length || 0,
      error: inactiveError?.message || null
    };

    if (inactiveError) {
      console.error('[Cron] Errore query inactiveUsers:', inactiveError.message);
    } else if (inactiveUsers && inactiveUsers.length > 0) {
      console.log(`📧 [Cron] Trovati ${inactiveUsers.length} utenti inattivi per reminder`);

      for (const user of inactiveUsers) {
        try {
          const result = await sendChallengeEmail(
            user.email,
            'reminder_48h',
            user.challenge as ChallengeType,
            user.current_day,
            user.nome || undefined
          );

          if (result.success) {
            await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'reminder'
              })
              .eq('id', user.id);

            results.reminders_sent++;
            console.log(`✅ Reminder inviato a ${user.email}`);
          } else {
            console.error(`Reminder error for ${user.email}:`, result.error);
            results.reminders_errors++;
          }
        } catch (err) {
          console.error(`Reminder exception for ${user.email}:`, err);
          results.reminders_errors++;
        }
      }
    }

    // ========================================
    // 2. FORCE REMINDER 72H - Incoraggiamento dopo reminder
    // ⚠️ NON modifica current_day (rispetta user agency)
    // Dopo force_reminder, il sistema non invia altre email
    // fino a quando l'utente non completa il giorno corrente
    // ========================================
    console.log('🔓 [Cron] Inizio processo force reminder 72h...');

    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    const { data: stuckUsers, error: stuckError } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .eq('last_email_type', 'reminder')
      .lt('last_email_sent_at', seventyTwoHoursAgo)
      .lt('current_day', 7);

    if (stuckError) {
      console.error('[Cron] Errore query stuckUsers:', stuckError.message);
    } else if (stuckUsers && stuckUsers.length > 0) {
      console.log(`🔓 [Cron] Trovati ${stuckUsers.length} utenti bloccati per force reminder`);

      for (const user of stuckUsers) {
        try {
          const nextDay = Math.min((user.current_day || 0) + 1, 7);

          // Invia email di incoraggiamento a riprendere
          const result = await sendChallengeEmail(
            user.email,
            'day_unlock',
            user.challenge as ChallengeType,
            nextDay,
            user.nome || undefined
          );

          if (result.success) {
            // NON modificare current_day - rispetta user agency
            // Setta force_reminder per fermare il ciclo di email
            // L'utente deve completare il giorno per ricevere la prossima email
            await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'force_reminder'
              })
              .eq('id', user.id);

            results.force_unlocks++;
            console.log(`✅ Force reminder (Day ${nextDay}) per ${user.email} - NO auto-advance`);
          } else {
            console.error(`Force reminder error for ${user.email}:`, result.error);
            results.force_unlock_errors++;
          }
        } catch (err) {
          console.error(`Force reminder exception for ${user.email}:`, err);
          results.force_unlock_errors++;
        }
      }
    }

    // ========================================
    // 3. POST-CHALLENGE SEQUENCE
    // ========================================
    console.log('📬 [Cron] Inizio processo post-challenge...');

    // 3a. Post-challenge 1 (24h dopo completamento)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: postChallenge1 } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'completed')
      .is('post_email_1_sent', null)
      .lt('completed_at', twentyFourHoursAgo);

    if (postChallenge1 && postChallenge1.length > 0) {
      console.log(`📬 [Cron] Post-challenge 1: ${postChallenge1.length} utenti`);

      for (const user of postChallenge1) {
        try {
          const result = await sendChallengeEmail(
            user.email,
            'post_challenge_1',
            user.challenge as ChallengeType,
            undefined,
            user.nome || undefined
          );

          if (result.success) {
            await supabase
              .from('challenge_subscribers')
              .update({ post_email_1_sent: new Date().toISOString() })
              .eq('id', user.id);

            results.post_challenge_sent++;
          } else {
            results.post_challenge_errors++;
          }
        } catch {
          results.post_challenge_errors++;
        }
      }
    }

    // 3b. Post-challenge 2 (72h dopo completamento)
    const { data: postChallenge2 } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'completed')
      .not('post_email_1_sent', 'is', null)
      .is('post_email_2_sent', null)
      .lt('completed_at', seventyTwoHoursAgo);

    if (postChallenge2 && postChallenge2.length > 0) {
      console.log(`📬 [Cron] Post-challenge 2: ${postChallenge2.length} utenti`);

      for (const user of postChallenge2) {
        try {
          const result = await sendChallengeEmail(
            user.email,
            'post_challenge_2',
            user.challenge as ChallengeType,
            undefined,
            user.nome || undefined
          );

          if (result.success) {
            await supabase
              .from('challenge_subscribers')
              .update({ post_email_2_sent: new Date().toISOString() })
              .eq('id', user.id);

            results.post_challenge_sent++;
          } else {
            results.post_challenge_errors++;
          }
        } catch {
          results.post_challenge_errors++;
        }
      }
    }

    // 3c. Post-challenge 3 (7 giorni dopo completamento)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: postChallenge3 } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'completed')
      .not('post_email_2_sent', 'is', null)
      .is('post_email_3_sent', null)
      .lt('completed_at', sevenDaysAgo);

    if (postChallenge3 && postChallenge3.length > 0) {
      console.log(`📬 [Cron] Post-challenge 3: ${postChallenge3.length} utenti`);

      for (const user of postChallenge3) {
        try {
          const result = await sendChallengeEmail(
            user.email,
            'post_challenge_3',
            user.challenge as ChallengeType,
            undefined,
            user.nome || undefined
          );

          if (result.success) {
            await supabase
              .from('challenge_subscribers')
              .update({ post_email_3_sent: new Date().toISOString() })
              .eq('id', user.id);

            results.post_challenge_sent++;
          } else {
            results.post_challenge_errors++;
          }
        } catch {
          results.post_challenge_errors++;
        }
      }
    }

    // ========================================
    // RISULTATI
    // ========================================
    const duration = Date.now() - startTime;

    console.log('✅ [Cron] Challenge emails completato:', {
      duration: `${duration}ms`,
      ...results
    });

    // Alert se ci sono stati errori
    const totalErrors = results.day_content_errors + results.reminders_errors +
                        results.force_unlock_errors + results.post_challenge_errors;
    if (totalErrors > 0) {
      console.warn(`⚠️ [Cron] ${totalErrors} errori durante l'esecuzione`);
    }

    return {
      success: true,
      results,
      duration_ms: duration,
      debug
    };

  } catch (error) {
    console.error('❌ [Cron] Errore challenge-emails:', error);

    // Invia alert per errori critici
    await alertAPIError(
      '/api/cron/challenge-emails',
      error instanceof Error ? error : new Error('Challenge emails cron failed')
    ).catch(() => {}); // Non bloccare se l'alert fallisce

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
      duration_ms: Date.now() - startTime,
      debug
    };
  }
}

// POST per chiamate manuali con auth
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // SECURITY: Richiedi sempre CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runCronJob();

  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString()
  }, { status: result.success ? 200 : 500 });
}

// GET per Vercel Cron
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // DEBUG: Log auth info per troubleshooting
  console.log('[Cron challenge-emails] Auth debug:', {
    hasAuthHeader: !!authHeader,
    authHeaderPrefix: authHeader?.substring(0, 20) + '...',
    hasCronSecret: !!cronSecret,
    cronSecretLength: cronSecret?.length,
    match: authHeader === `Bearer ${cronSecret}`
  });

  // SECURITY: Richiedi sempre CRON_SECRET
  if (!cronSecret) {
    console.error('[Cron challenge-emails] CRON_SECRET not configured!');
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  // Vercel Cron invia l'auth header configurato in vercel.json
  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('[Cron challenge-emails] Auth mismatch!', {
      expected: `Bearer ${cronSecret.substring(0, 5)}...`,
      received: authHeader?.substring(0, 20) + '...'
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron challenge-emails] Auth OK, proceeding...');

  const result = await runCronJob();

  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString()
  }, { status: result.success ? 200 : 500 });
}
