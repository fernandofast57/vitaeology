/**
 * Cron Job: Email Automatiche Challenge
 *
 * Esegue 4 processi:
 * 0. Day Content - Invia contenuto giornaliero ai nuovi iscritti
 * 1. Reminder 48h - Per utenti inattivi
 * 2. Force Unlock 72h - Auto-sblocco giorno successivo
 * 3. Sequenza post-challenge (24h, 72h, 7 giorni)
 *
 * Vercel Cron: GET /api/cron/challenge-emails (8:00 UTC)
 * Manual: POST con Authorization: Bearer ${CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendChallengeEmail } from '@/lib/email/challenge-emails';

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

async function runCronJob(): Promise<{ success: boolean; results: CronResults; duration_ms: number; error?: string }> {
  const startTime = Date.now();
  const supabase = getSupabase();

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
    // ========================================
    // 0. DAY CONTENT - Nuovi iscritti (welcome -> day 1)
    // ========================================
    console.log('📧 [Cron] Inizio invio Day Content...');

    // Trova utenti che hanno ricevuto welcome email più di 2h fa
    // e sono pronti per ricevere il contenuto del giorno
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: newSubscribers, error: newSubError } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .eq('last_email_type', 'welcome')
      .lt('last_email_sent_at', twoHoursAgo)
      .lte('current_day', 7);

    if (newSubError) {
      console.error('[Cron] Errore query newSubscribers:', newSubError.message);
    } else if (newSubscribers && newSubscribers.length > 0) {
      console.log(`📧 [Cron] Trovati ${newSubscribers.length} nuovi iscritti per Day Content`);

      for (const user of newSubscribers) {
        try {
          const dayToSend = user.current_day || 1;

          const result = await sendChallengeEmail(
            user.email,
            'day_content',
            user.challenge as ChallengeType,
            dayToSend,
            user.nome || undefined
          );

          if (result.success) {
            await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'day_content'
              })
              .eq('id', user.id);

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
            console.log(`✅ Day ${dayToSend} inviato a ${user.email}`);
          } else {
            console.error(`Day content error for ${user.email}:`, result.error);
            results.day_content_errors++;
          }
        } catch (err) {
          console.error(`Day content exception for ${user.email}:`, err);
          results.day_content_errors++;
        }
      }
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
    // 2. FORCE UNLOCK 72H - Dopo reminder
    // ========================================
    console.log('🔓 [Cron] Inizio processo force unlock 72h...');

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
      console.log(`🔓 [Cron] Trovati ${stuckUsers.length} utenti bloccati per force unlock`);

      for (const user of stuckUsers) {
        try {
          const nextDay = Math.min((user.current_day || 0) + 1, 7);

          // Invia email notifica sblocco
          const result = await sendChallengeEmail(
            user.email,
            'day_unlock',
            user.challenge as ChallengeType,
            nextDay,
            user.nome || undefined
          );

          if (result.success) {
            // Aggiorna current_day e prepara per il prossimo ciclo
            const updateData: Record<string, unknown> = {
              current_day: nextDay,
              last_email_sent_at: new Date().toISOString(),
              last_email_type: 'day_content' // Torna al ciclo normale
            };

            // Se giorno 7, marca come completato
            if (nextDay >= 7) {
              updateData.status = 'completed';
              updateData.completed_at = new Date().toISOString();
            }

            await supabase
              .from('challenge_subscribers')
              .update(updateData)
              .eq('id', user.id);

            results.force_unlocks++;
            console.log(`✅ Force unlock Day ${nextDay} per ${user.email}`);
          } else {
            console.error(`Force unlock error for ${user.email}:`, result.error);
            results.force_unlock_errors++;
          }
        } catch (err) {
          console.error(`Force unlock exception for ${user.email}:`, err);
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

    return {
      success: true,
      results,
      duration_ms: duration
    };

  } catch (error) {
    console.error('❌ [Cron] Errore challenge-emails:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
      duration_ms: Date.now() - startTime
    };
  }
}

// POST per chiamate manuali con auth
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
    console.error('Cron challenge-emails POST: Unauthorized');
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
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  // Vercel Cron non sempre invia auth header, ma limita l'accesso via configurazione
  if (process.env.CRON_SECRET && authHeader && authHeader !== expectedAuth) {
    console.error('Cron challenge-emails GET: Unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runCronJob();

  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString()
  }, { status: result.success ? 200 : 500 });
}
