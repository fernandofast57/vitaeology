// Cron job per sistema email ibrido Challenge
// Eseguito ogni giorno alle 8:00 UTC da Vercel Cron
// Logica: Reminder 48h → Force Advance 72h → Recovery 3 giorni

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  getChallengeEmail,
  getReminderEmail,
  getForceAdvanceEmail,
  getRecoveryEmail,
  CHALLENGE_CONFIG
} from '@/lib/email/challenge-day-templates';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Helper: calcola ore fa
function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

// Helper: calcola giorni fa
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

interface CronResults {
  dailyEmails: number;
  reminders: number;
  forceAdvance: number;
  recovery: number;
  errors: string[];
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verifica CRON_SECRET per sicurezza
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // SECURITY: Richiedi sempre CRON_SECRET - fallisce se non configurato
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    const resend = getResendClient();

    const results: CronResults = {
      dailyEmails: 0,
      reminders: 0,
      forceAdvance: 0,
      recovery: 0,
      errors: []
    };

    // ============================================================
    // 2. DAY 1 EMAILS - Invia Giorno 1 a chi ha ricevuto solo welcome
    // SEMANTICA: current_day = 0 significa "iscritto, nessun giorno completato"
    // ============================================================
    try {
      // Trova utenti che hanno ricevuto welcome ma non ancora Day 1 content
      // current_day = 0 = iscritto ma nessun giorno completato
      const { data: day1Candidates } = await supabase
        .from('challenge_subscribers')
        .select('*')
        .eq('status', 'active')
        .eq('current_day', 0)  // Nessun giorno completato ancora
        .eq('last_email_type', 'welcome');

      if (day1Candidates && day1Candidates.length > 0) {
        for (const subscriber of day1Candidates) {
          try {
            // Verifica che non abbiamo già inviato Day 1
            const { data: day1Record } = await supabase
              .from('challenge_day_completions')
              .select('email_sent_at')
              .eq('subscriber_id', subscriber.id)
              .eq('challenge', subscriber.challenge)
              .eq('day_number', 1)
              .single();

            if (day1Record?.email_sent_at) {
              continue; // Già inviato
            }

            // Invia email Day 1
            const emailContent = getChallengeEmail(
              subscriber.challenge,
              1,
              subscriber.nome || 'Amico/a'
            );

            const config = CHALLENGE_CONFIG[subscriber.challenge as keyof typeof CHALLENGE_CONFIG];

            await resend.emails.send({
              from: 'Fernando <fernando@vitaeology.com>',
              replyTo: 'fernando@vitaeology.com',
              to: subscriber.email,
              subject: emailContent.subject,
              html: emailContent.html,
              tags: [
                { name: 'challenge', value: config?.tag || 'challenge' },
                { name: 'email_type', value: 'day_content' },
                { name: 'day', value: '1' }
              ]
            });

            // Registra invio
            await supabase
              .from('challenge_day_completions')
              .upsert({
                subscriber_id: subscriber.id,
                challenge: subscriber.challenge,
                day_number: 1,
                email_sent_at: new Date().toISOString()
              }, {
                onConflict: 'subscriber_id,challenge,day_number'
              });

            await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'day_content'
              })
              .eq('id', subscriber.id);

            results.dailyEmails++;
            console.log(`✅ Day 1 email sent: ${subscriber.email}`);

          } catch (emailError) {
            const errorMsg = `Day1Email ${subscriber.email}: ${emailError instanceof Error ? emailError.message : 'Unknown'}`;
            results.errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
      }
    } catch (queryError) {
      console.error('Query Day 1 emails error:', queryError);
    }

    // ============================================================
    // 3. DAILY EMAILS (Day 2-7) - Invia email giornaliere
    // SEMANTICA: current_day = ultimo giorno COMPLETATO
    // Se current_day = N, l'utente deve ricevere email per Day N+1
    // ============================================================
    try {
      // Trova utenti attivi che hanno completato almeno Day 1 ma non tutti i 7 giorni
      // current_day >= 1 = ha completato almeno Day 1
      // current_day < 7 = non ha ancora completato tutto
      const { data: dailyCandidates } = await supabase
        .from('challenge_subscribers')
        .select('*')
        .eq('status', 'active')
        .gte('current_day', 1)  // Ha completato almeno Day 1
        .lt('current_day', 7);   // Non ha ancora completato tutto

      if (dailyCandidates && dailyCandidates.length > 0) {
        for (const subscriber of dailyCandidates) {
          try {
            // SEMANTICA: current_day = ultimo completato
            // nextDayToSend = giorno per cui inviare email = current_day + 1
            const lastCompletedDay = subscriber.current_day;
            const nextDayToSend = lastCompletedDay + 1;

            // Safety check: nextDayToSend deve essere tra 2 e 7
            if (nextDayToSend < 2 || nextDayToSend > 7) {
              continue;
            }

            // Verifica se abbiamo già inviato l'email per nextDayToSend
            const { data: nextDayRecord } = await supabase
              .from('challenge_day_completions')
              .select('email_sent_at')
              .eq('subscriber_id', subscriber.id)
              .eq('challenge', subscriber.challenge)
              .eq('day_number', nextDayToSend)
              .single();

            if (nextDayRecord?.email_sent_at) {
              // Email già inviata per questo giorno, skip
              continue;
            }

            // La pagina per nextDayToSend è sbloccata perché:
            // - current_day = lastCompletedDay
            // - Day N sbloccato se N <= current_day + 1
            // - nextDayToSend = current_day + 1, quindi è sbloccato ✓

            // Invia email per nextDayToSend
            const emailContent = getChallengeEmail(
              subscriber.challenge,
              nextDayToSend as 1 | 2 | 3 | 4 | 5 | 6 | 7,
              subscriber.nome || 'Amico/a'
            );

            const config = CHALLENGE_CONFIG[subscriber.challenge as keyof typeof CHALLENGE_CONFIG];

            await resend.emails.send({
              from: 'Fernando <fernando@vitaeology.com>',
              replyTo: 'fernando@vitaeology.com',
              to: subscriber.email,
              subject: emailContent.subject,
              html: emailContent.html,
              tags: [
                { name: 'challenge', value: config?.tag || 'challenge' },
                { name: 'email_type', value: 'day_content' },
                { name: 'day', value: String(nextDayToSend) }
              ]
            });

            // Registra invio email per nextDayToSend
            await supabase
              .from('challenge_day_completions')
              .upsert({
                subscriber_id: subscriber.id,
                challenge: subscriber.challenge,
                day_number: nextDayToSend,
                email_sent_at: new Date().toISOString()
              }, {
                onConflict: 'subscriber_id,challenge,day_number'
              });

            // Aggiorna subscriber (NON modifichiamo current_day - quello è controllato dall'utente!)
            await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'day_content'
              })
              .eq('id', subscriber.id);

            results.dailyEmails++;
            console.log(`✅ Daily email sent: ${subscriber.email} - Day ${nextDayToSend}`);

          } catch (emailError) {
            const errorMsg = `DailyEmail ${subscriber.email}: ${emailError instanceof Error ? emailError.message : 'Unknown'}`;
            results.errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
      }
    } catch (queryError) {
      console.error('Query daily emails error:', queryError);
    }

    // ============================================================
    // 4. REMINDER 48h - Utenti inattivi dopo email day_content
    // ============================================================
    try {
      const { data: reminderCandidates } = await supabase
        .from('challenge_subscribers')
        .select('*')
        .eq('status', 'active')
        .lt('current_day', 7)
        .eq('last_email_type', 'day_content')
        .lt('last_email_sent_at', hoursAgo(48));

      if (reminderCandidates && reminderCandidates.length > 0) {
        for (const subscriber of reminderCandidates) {
          try {
            const emailContent = getReminderEmail(
              subscriber.challenge,
              subscriber.current_day,
              subscriber.nome || 'Amico/a'
            );

            const config = CHALLENGE_CONFIG[subscriber.challenge as keyof typeof CHALLENGE_CONFIG];

            await resend.emails.send({
              from: 'Fernando <fernando@vitaeology.com>',
              replyTo: 'fernando@vitaeology.com',
              to: subscriber.email,
              subject: emailContent.subject,
              html: emailContent.html,
              tags: [
                { name: 'challenge', value: config?.tag || 'challenge' },
                { name: 'email_type', value: 'reminder' }
              ]
            });

            // Aggiorna subscriber
            await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'reminder'
              })
              .eq('id', subscriber.id);

            // Log evento email
            await supabase.from('challenge_email_events').insert({
              subscriber_id: subscriber.id,
              challenge: subscriber.challenge,
              day_number: subscriber.current_day,
              event_type: 'sent',
              created_at: new Date().toISOString()
            });

            results.reminders++;

          } catch (emailError) {
            const errorMsg = `Reminder ${subscriber.email}: ${emailError instanceof Error ? emailError.message : 'Unknown'}`;
            results.errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
      }
    } catch (queryError) {
      console.error('Query reminder error:', queryError);
    }

    // ============================================================
    // 5. FORCE ADVANCE 72h - Auto-sblocco giorno successivo
    // ⚠️ NOTA: Questa logica MODIFICA current_day, che normalmente dovrebbe
    // essere controllato solo dall'utente (user agency). Questo è un compromesso
    // per evitare che utenti rimangano bloccati indefinitamente.
    // Se si vuole user agency pura, rimuovere la modifica a current_day qui.
    // ============================================================
    try {
      const { data: forceAdvanceCandidates } = await supabase
        .from('challenge_subscribers')
        .select('*')
        .eq('status', 'active')
        .lt('current_day', 7)
        .eq('last_email_type', 'reminder')
        .lt('last_email_sent_at', hoursAgo(72));

      if (forceAdvanceCandidates && forceAdvanceCandidates.length > 0) {
        for (const subscriber of forceAdvanceCandidates) {
          try {
            const nextDay = subscriber.current_day + 1;

            // Se nextDay > 7, marca come completato
            if (nextDay > 7) {
              await supabase
                .from('challenge_subscribers')
                .update({
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  current_day: 7
                })
                .eq('id', subscriber.id);
              continue;
            }

            const emailContent = getForceAdvanceEmail(
              subscriber.challenge,
              nextDay,
              subscriber.nome || 'Amico/a'
            );

            const config = CHALLENGE_CONFIG[subscriber.challenge as keyof typeof CHALLENGE_CONFIG];

            await resend.emails.send({
              from: 'Fernando <fernando@vitaeology.com>',
              replyTo: 'fernando@vitaeology.com',
              to: subscriber.email,
              subject: emailContent.subject,
              html: emailContent.html,
              tags: [
                { name: 'challenge', value: config?.tag || 'challenge' },
                { name: 'email_type', value: 'force_advance' },
                { name: 'day', value: String(nextDay) }
              ]
            });

            // Aggiorna subscriber con nuovo giorno
            const updateData: {
              current_day: number;
              last_email_sent_at: string;
              last_email_type: string;
              status?: string;
              completed_at?: string;
            } = {
              current_day: nextDay,
              last_email_sent_at: new Date().toISOString(),
              last_email_type: 'day_content'
            };

            // Se giorno 7, marca completato
            if (nextDay === 7) {
              updateData.status = 'completed';
              updateData.completed_at = new Date().toISOString();
            }

            await supabase
              .from('challenge_subscribers')
              .update(updateData)
              .eq('id', subscriber.id);

            // Log evento email
            await supabase.from('challenge_email_events').insert({
              subscriber_id: subscriber.id,
              challenge: subscriber.challenge,
              day_number: nextDay,
              event_type: 'sent',
              created_at: new Date().toISOString()
            });

            // Registra in day_completions
            await supabase.from('challenge_day_completions').upsert({
              subscriber_id: subscriber.id,
              challenge: subscriber.challenge,
              day_number: nextDay,
              email_sent_at: new Date().toISOString()
            }, {
              onConflict: 'subscriber_id,challenge,day_number'
            });

            results.forceAdvance++;

          } catch (emailError) {
            const errorMsg = `ForceAdvance ${subscriber.email}: ${emailError instanceof Error ? emailError.message : 'Unknown'}`;
            results.errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
      }
    } catch (queryError) {
      console.error('Query force advance error:', queryError);
    }

    // ============================================================
    // 6. RECOVERY 3 giorni post-completamento
    // ============================================================
    try {
      const { data: recoveryCandidates } = await supabase
        .from('challenge_subscribers')
        .select('*')
        .eq('status', 'completed')
        .eq('converted_to_assessment', false)
        .lt('completed_at', daysAgo(3))
        .neq('last_email_type', 'recovery');

      if (recoveryCandidates && recoveryCandidates.length > 0) {
        for (const subscriber of recoveryCandidates) {
          try {
            const emailContent = getRecoveryEmail(
              subscriber.challenge,
              subscriber.nome || 'Amico/a'
            );

            const config = CHALLENGE_CONFIG[subscriber.challenge as keyof typeof CHALLENGE_CONFIG];

            await resend.emails.send({
              from: 'Fernando <fernando@vitaeology.com>',
              replyTo: 'fernando@vitaeology.com',
              to: subscriber.email,
              subject: emailContent.subject,
              html: emailContent.html,
              tags: [
                { name: 'challenge', value: config?.tag || 'challenge' },
                { name: 'email_type', value: 'recovery' }
              ]
            });

            // Aggiorna subscriber
            await supabase
              .from('challenge_subscribers')
              .update({
                last_email_sent_at: new Date().toISOString(),
                last_email_type: 'recovery'
              })
              .eq('id', subscriber.id);

            // Log evento A/B
            await supabase.from('ab_test_events').insert({
              challenge: subscriber.challenge,
              variant: subscriber.variant || 'A',
              event_type: 'recovery_email_sent',
              subscriber_id: subscriber.id,
              created_at: new Date().toISOString()
            });

            results.recovery++;

          } catch (emailError) {
            const errorMsg = `Recovery ${subscriber.email}: ${emailError instanceof Error ? emailError.message : 'Unknown'}`;
            results.errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
      }
    } catch (queryError) {
      console.error('Query recovery error:', queryError);
    }

    // ============================================================
    // 7. Return risultati
    // ============================================================
    const totalSent = results.dailyEmails + results.reminders + results.forceAdvance + results.recovery;

    console.log(`Challenge emails cron: dailyEmails=${results.dailyEmails}, reminders=${results.reminders}, forceAdvance=${results.forceAdvance}, recovery=${results.recovery}, errors=${results.errors.length}`);

    return NextResponse.json({
      success: true,
      sent: {
        dailyEmails: results.dailyEmails,
        reminders: results.reminders,
        forceAdvance: results.forceAdvance,
        recovery: results.recovery,
        total: totalSent
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
