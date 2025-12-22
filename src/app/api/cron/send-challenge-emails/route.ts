// Cron job per inviare email giornaliere delle Challenge
// Eseguito ogni giorno alle 8:00 UTC da Vercel Cron

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getChallengeEmail } from '@/lib/email/challenge-day-templates';

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

// Calcola quale giorno di email inviare basandosi sulla data di iscrizione
function calculateDayToSend(subscribedAt: string): number {
  const subscriptionDate = new Date(subscribedAt);
  const today = new Date();

  // Reset time to midnight for accurate day calculation
  subscriptionDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - subscriptionDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Day 1 email is sent on subscription (handled by subscribe route)
  // Day 2 email after 1 day, Day 3 after 2 days, etc.
  return diffDays + 1;
}

export async function GET(request: NextRequest) {
  try {
    // Verifica CRON_SECRET per sicurezza
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    const resend = getResendClient();

    // Query subscribers attivi con current_day < 7
    const { data: subscribers, error: queryError } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('status', 'active')
      .lt('current_day', 7);

    if (queryError) {
      console.error('Query error:', queryError);
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      );
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscribers to email',
        sent: 0
      });
    }

    let emailsSent = 0;
    let emailsSkipped = 0;
    let emailsFailed = 0;
    const errors: string[] = [];

    for (const subscriber of subscribers) {
      try {
        const dayToSend = calculateDayToSend(subscriber.subscribed_at);

        // Skip if day to send equals current_day (already sent)
        // or if day to send is not the next day (not time yet)
        if (dayToSend <= subscriber.current_day) {
          emailsSkipped++;
          continue;
        }

        // Skip if trying to send day > 7
        if (dayToSend > 7) {
          // Mark as completed
          await supabase
            .from('challenge_subscribers')
            .update({
              status: 'completed',
              current_day: 7
            })
            .eq('id', subscriber.id);
          emailsSkipped++;
          continue;
        }

        // Get email content
        const emailContent = getChallengeEmail(
          subscriber.challenge,
          dayToSend as 1 | 2 | 3 | 4 | 5 | 6 | 7,
          subscriber.nome || 'Amico/a'
        );

        // Send email
        const emailResult = await resend.emails.send({
          from: 'Fernando <fernando@vitaeology.com>',
          to: subscriber.email,
          subject: emailContent.subject,
          html: emailContent.html,
          tags: [
            { name: 'challenge', value: subscriber.challenge },
            { name: 'day', value: String(dayToSend) }
          ]
        });

        // Log email event
        await supabase.from('challenge_email_events').insert({
          subscriber_id: subscriber.id,
          challenge: subscriber.challenge,
          day: dayToSend,
          email_type: 'daily',
          status: 'sent',
          resend_id: emailResult.data?.id || null,
          created_at: new Date().toISOString()
        });

        // Update subscriber current_day
        const updateData: { current_day: number; status?: string } = {
          current_day: dayToSend
        };

        // If day 7, mark as completed
        if (dayToSend === 7) {
          updateData.status = 'completed';
        }

        await supabase
          .from('challenge_subscribers')
          .update(updateData)
          .eq('id', subscriber.id);

        emailsSent++;

      } catch (emailError) {
        emailsFailed++;
        const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error';
        errors.push(`${subscriber.email}: ${errorMessage}`);

        // Log failed email
        await supabase.from('challenge_email_events').insert({
          subscriber_id: subscriber.id,
          challenge: subscriber.challenge,
          day: calculateDayToSend(subscriber.subscribed_at),
          email_type: 'daily',
          status: 'failed',
          error_message: errorMessage,
          created_at: new Date().toISOString()
        });
      }
    }

    console.log(`Challenge emails: sent=${emailsSent}, skipped=${emailsSkipped}, failed=${emailsFailed}`);

    return NextResponse.json({
      success: true,
      sent: emailsSent,
      skipped: emailsSkipped,
      failed: emailsFailed,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
