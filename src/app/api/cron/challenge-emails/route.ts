/**
 * Cron Job: Email Automatiche Challenge
 *
 * Esegue 5 processi:
 * 0. Day Content (Welcome -> Day 1)
 * 0.5. Daily Content (Day 2-7) dopo completamento
 * 1. Reminder 48h
 * 2. Force Reminder 72h (senza auto-advance)
 * 3. Sequenza post-challenge (24h, 72h, 7 giorni)
 *
 * Vercel Cron: GET /api/cron/challenge-emails (8:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendChallengeEmail, fetchMiniProfileForEmail } from '@/lib/email/challenge-emails';
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

interface Subscriber {
  id: string;
  email: string;
  nome?: string;
  challenge: string;
  current_day: number;
  last_email_type?: string;
  last_email_sent_at?: string;
  status?: string;
  completed_at?: string;
  [key: string]: unknown;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

// ========================================
// HELPER: Invia email e aggiorna subscriber
// ========================================

interface SendAndUpdateOptions {
  user: Subscriber;
  emailType: 'day_content' | 'reminder_48h' | 'day_unlock' | 'post_challenge_1' | 'post_challenge_2' | 'post_challenge_3';
  dayNumber?: number;
  updateFields: Record<string, string>;
  logDayEvent?: number;
  withMiniProfile?: boolean;
}

async function sendAndUpdate(
  supabase: ReturnType<typeof getSupabase>,
  opts: SendAndUpdateOptions
): Promise<boolean> {
  const { user, emailType, dayNumber, updateFields, logDayEvent, withMiniProfile } = opts;

  let miniProfile = undefined;
  if (withMiniProfile) {
    miniProfile = await fetchMiniProfileForEmail(
      user.email,
      user.challenge as ChallengeType
    ) || undefined;
  }

  const result = await sendChallengeEmail(
    user.email,
    emailType,
    user.challenge as ChallengeType,
    dayNumber,
    user.nome || undefined,
    miniProfile
  );

  if (!result.success) return false;

  await supabase
    .from('challenge_subscribers')
    .update(updateFields)
    .eq('id', user.id);

  if (logDayEvent !== undefined) {
    await supabase.from('challenge_email_events').insert({
      subscriber_id: user.id,
      challenge: user.challenge,
      day_number: logDayEvent,
      event_type: 'sent',
      created_at: new Date().toISOString(),
    }).then(() => {}, () => {});
  }

  return true;
}

// ========================================
// HELPER: Processa batch post-challenge
// ========================================

interface PostChallengeStep {
  emailType: 'post_challenge_1' | 'post_challenge_2' | 'post_challenge_3';
  stepNumber: 1 | 2 | 3;
  minAge: string;
  requirePreviousSent?: string;
}

async function processPostChallengeStep(
  supabase: ReturnType<typeof getSupabase>,
  step: PostChallengeStep,
  results: CronResults
): Promise<void> {
  const sentField = `post_email_${step.stepNumber}_sent`;

  let query = supabase
    .from('challenge_subscribers')
    .select('*')
    .eq('status', 'completed')
    .is(sentField, null)
    .lt('completed_at', step.minAge);

  if (step.requirePreviousSent) {
    query = query.not(step.requirePreviousSent, 'is', null);
  }

  const { data: users } = await query;
  if (!users?.length) return;

  for (const user of users) {
    try {
      const ok = await sendAndUpdate(supabase, {
        user,
        emailType: step.emailType,
        updateFields: { [sentField]: new Date().toISOString() },
        withMiniProfile: true,
      });

      if (ok) results.post_challenge_sent++;
      else results.post_challenge_errors++;
    } catch {
      results.post_challenge_errors++;
    }
  }
}

// ========================================
// MAIN CRON JOB
// ========================================

async function runCronJob(): Promise<{ success: boolean; results: CronResults; duration_ms: number; error?: string }> {
  const startTime = Date.now();
  const supabase = getSupabase();
  const now = () => new Date().toISOString();

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
    // 0. DAY CONTENT - Nuovi iscritti (welcome -> day 1)
    const { data: newSubscribers } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .eq('last_email_type', 'welcome')
      .lt('last_email_sent_at', hoursAgo(2))
      .lte('current_day', 7);

    if (newSubscribers?.length) {
      for (const user of newSubscribers) {
        try {
          const dayToSend = user.current_day === 0 ? 1 : Math.min(user.current_day + 1, 7);
          const ok = await sendAndUpdate(supabase, {
            user,
            emailType: 'day_content',
            dayNumber: dayToSend,
            updateFields: { last_email_sent_at: now(), last_email_type: 'day_content' },
            logDayEvent: dayToSend,
          });

          if (ok) results.day_content_sent++;
          else results.day_content_errors++;
        } catch {
          results.day_content_errors++;
        }
      }
    }

    // 0.5 DAILY CONTENT DAY 2-7 - Dopo completamento giorno
    const { data: activeDailyUsers } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .gte('current_day', 1)
      .lt('current_day', 7);

    if (activeDailyUsers?.length) {
      for (const user of activeDailyUsers) {
        try {
          const nextDay = user.current_day + 1;

          // Verifica se email per nextDay è già stata inviata
          const { data: existing } = await supabase
            .from('challenge_email_events')
            .select('id')
            .eq('subscriber_id', user.id)
            .eq('challenge', user.challenge)
            .eq('day_number', nextDay)
            .eq('event_type', 'sent')
            .limit(1);

          if (existing?.length) continue;

          const ok = await sendAndUpdate(supabase, {
            user,
            emailType: 'day_content',
            dayNumber: nextDay,
            updateFields: { last_email_sent_at: now(), last_email_type: 'day_content' },
            logDayEvent: nextDay,
          });

          if (ok) results.day_content_sent++;
          else results.day_content_errors++;
        } catch {
          results.day_content_errors++;
        }
      }
    }

    // 1. REMINDER 48H
    const { data: inactiveUsers } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .eq('last_email_type', 'day_content')
      .lt('last_email_sent_at', hoursAgo(48))
      .lt('current_day', 7);

    if (inactiveUsers?.length) {
      for (const user of inactiveUsers) {
        try {
          const ok = await sendAndUpdate(supabase, {
            user,
            emailType: 'reminder_48h',
            dayNumber: user.current_day,
            updateFields: { last_email_sent_at: now(), last_email_type: 'reminder' },
          });

          if (ok) results.reminders_sent++;
          else results.reminders_errors++;
        } catch {
          results.reminders_errors++;
        }
      }
    }

    // 2. FORCE REMINDER 72H (rispetta user agency, NO auto-advance)
    const { data: stuckUsers } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .eq('last_email_type', 'reminder')
      .lt('last_email_sent_at', hoursAgo(72))
      .lt('current_day', 7);

    if (stuckUsers?.length) {
      for (const user of stuckUsers) {
        try {
          const nextDay = Math.min((user.current_day || 0) + 1, 7);
          const ok = await sendAndUpdate(supabase, {
            user,
            emailType: 'day_unlock',
            dayNumber: nextDay,
            updateFields: { last_email_sent_at: now(), last_email_type: 'force_reminder' },
          });

          if (ok) results.force_unlocks++;
          else results.force_unlock_errors++;
        } catch {
          results.force_unlock_errors++;
        }
      }
    }

    // 3. POST-CHALLENGE SEQUENCE
    await processPostChallengeStep(supabase, {
      emailType: 'post_challenge_1',
      stepNumber: 1,
      minAge: hoursAgo(24),
    }, results);

    await processPostChallengeStep(supabase, {
      emailType: 'post_challenge_2',
      stepNumber: 2,
      minAge: hoursAgo(72),
      requirePreviousSent: 'post_email_1_sent',
    }, results);

    await processPostChallengeStep(supabase, {
      emailType: 'post_challenge_3',
      stepNumber: 3,
      minAge: hoursAgo(7 * 24),
      requirePreviousSent: 'post_email_2_sent',
    }, results);

    // RISULTATI
    const totalErrors = results.day_content_errors + results.reminders_errors +
                        results.force_unlock_errors + results.post_challenge_errors;
    if (totalErrors > 0) {
      console.warn(`[Cron] ${totalErrors} errori durante l'esecuzione`);
    }

    return { success: true, results, duration_ms: Date.now() - startTime };
  } catch (error) {
    await alertAPIError(
      '/api/cron/challenge-emails',
      error instanceof Error ? error : new Error('Challenge emails cron failed')
    ).catch(() => {});

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
      duration_ms: Date.now() - startTime,
    };
  }
}

// ========================================
// ROUTE HANDLERS
// ========================================

function verifyCronAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  const result = await runCronJob();
  return NextResponse.json({ ...result, timestamp: new Date().toISOString() }, { status: result.success ? 200 : 500 });
}

export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  const result = await runCronJob();
  return NextResponse.json({ ...result, timestamp: new Date().toISOString() }, { status: result.success ? 200 : 500 });
}
