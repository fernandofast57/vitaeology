/**
 * Cron Job: Email Automatiche Challenge
 *
 * Esegue 3 processi:
 * 1. Reminder 48h per utenti inattivi
 * 2. Force unlock 72h con email notifica
 * 3. Sequenza post-challenge (24h, 72h, 7 giorni)
 *
 * Chiamare via Vercel Cron o external scheduler
 * Endpoint: POST /api/cron/challenge-emails
 * Header: Authorization: Bearer ${CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendChallengeEmail } from '@/lib/email/challenge-emails';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 secondi max per Vercel

type ChallengeType = 'leadership-autentica' | 'oltre-ostacoli' | 'microfelicita';

interface CronResults {
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

export async function POST(request: NextRequest) {
  // Verifica autorizzazione
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    console.error('Cron challenge-emails: Unauthorized');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const startTime = Date.now();
  const supabase = getSupabase();

  const results: CronResults = {
    reminders_sent: 0,
    reminders_errors: 0,
    force_unlocks: 0,
    force_unlock_errors: 0,
    post_challenge_sent: 0,
    post_challenge_errors: 0,
  };

  try {
    // ========================================
    // 1. REMINDER 48H - Utenti inattivi
    // ========================================
    console.log('📧 [Cron] Inizio processo reminder 48h...');

    const { data: inactiveUsers } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .is('completed_at', null)
      .lt('last_activity_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .or('last_reminder_sent_at.is.null,last_reminder_sent_at.lt.' + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (inactiveUsers && inactiveUsers.length > 0) {
      console.log(`📧 [Cron] Trovati ${inactiveUsers.length} utenti inattivi per reminder`);

      for (const user of inactiveUsers) {
        try {
          const result = await sendChallengeEmail(
            user.email,
            'reminder_48h',
            user.challenge_type as ChallengeType,
            user.current_day,
            user.nome || undefined
          );

          if (result.success) {
            await supabase
              .from('challenge_subscribers')
              .update({ last_reminder_sent_at: new Date().toISOString() })
              .eq('id', user.id);

            results.reminders_sent++;
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
    // 2. FORCE UNLOCK 72H
    // ========================================
    console.log('🔓 [Cron] Inizio processo force unlock 72h...');

    const { data: stuckUsers } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .is('completed_at', null)
      .lt('current_day', 7)
      .lt('last_activity_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString());

    if (stuckUsers && stuckUsers.length > 0) {
      console.log(`🔓 [Cron] Trovati ${stuckUsers.length} utenti bloccati per force unlock`);

      for (const user of stuckUsers) {
        try {
          const nextDay = Math.min(user.current_day + 1, 7);

          // Registra unlock forzato
          await supabase.from('challenge_day_completions').upsert({
            subscriber_id: user.id,
            challenge: user.challenge_type,
            day_number: nextDay,
            unlocked_at: new Date().toISOString(),
            unlock_type: 'force_72h'
          }, {
            onConflict: 'subscriber_id,challenge,day_number'
          });

          // Invia email notifica sblocco
          const result = await sendChallengeEmail(
            user.email,
            'day_unlock',
            user.challenge_type as ChallengeType,
            nextDay,
            user.nome || undefined
          );

          if (result.success) {
            // Aggiorna current_day e activity
            await supabase
              .from('challenge_subscribers')
              .update({
                current_day: nextDay,
                last_activity_at: new Date().toISOString(),
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'day_unlock'
              })
              .eq('id', user.id);

            results.force_unlocks++;
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
    const { data: postChallenge1 } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .not('completed_at', 'is', null)
      .is('post_email_1_sent', null)
      .lt('completed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (postChallenge1 && postChallenge1.length > 0) {
      console.log(`📬 [Cron] Post-challenge 1: ${postChallenge1.length} utenti`);

      for (const user of postChallenge1) {
        try {
          const result = await sendChallengeEmail(
            user.email,
            'post_challenge_1',
            user.challenge_type as ChallengeType,
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
        } catch (err) {
          results.post_challenge_errors++;
        }
      }
    }

    // 3b. Post-challenge 2 (72h dopo completamento)
    const { data: postChallenge2 } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .not('completed_at', 'is', null)
      .not('post_email_1_sent', 'is', null)
      .is('post_email_2_sent', null)
      .lt('completed_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString());

    if (postChallenge2 && postChallenge2.length > 0) {
      console.log(`📬 [Cron] Post-challenge 2: ${postChallenge2.length} utenti`);

      for (const user of postChallenge2) {
        try {
          const result = await sendChallengeEmail(
            user.email,
            'post_challenge_2',
            user.challenge_type as ChallengeType,
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
        } catch (err) {
          results.post_challenge_errors++;
        }
      }
    }

    // 3c. Post-challenge 3 (7 giorni dopo completamento)
    const { data: postChallenge3 } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .not('completed_at', 'is', null)
      .not('post_email_2_sent', 'is', null)
      .is('post_email_3_sent', null)
      .lt('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (postChallenge3 && postChallenge3.length > 0) {
      console.log(`📬 [Cron] Post-challenge 3: ${postChallenge3.length} utenti`);

      for (const user of postChallenge3) {
        try {
          const result = await sendChallengeEmail(
            user.email,
            'post_challenge_3',
            user.challenge_type as ChallengeType,
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
        } catch (err) {
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

    return NextResponse.json({
      success: true,
      duration_ms: duration,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Cron] Errore challenge-emails:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        results,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET per health check (senza auth)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/cron/challenge-emails',
    method: 'POST',
    auth: 'Bearer CRON_SECRET required'
  });
}
