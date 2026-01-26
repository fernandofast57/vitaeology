// POST /api/beta/apply - Candidatura pubblica beta tester
// Auto-approva se ci sono posti disponibili, altrimenti waitlist

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendBetaWelcomeEmail, sendBetaWaitlistEmail } from '@/lib/email/beta-tester-emails';
import { checkRateLimit, getClientIP, RATE_LIMITS, rateLimitExceededResponse, isSpamEmail, spamEmailResponse } from '@/lib/rate-limiter';
import { verifyTurnstileToken, turnstileFailedResponse } from '@/lib/turnstile';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configurazione posti disponibili
const MAX_BETA_TESTERS = 20;

export async function POST(request: Request) {
  // Rate limiting: max 5 richieste per minuto per IP
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.publicForm);

  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();

    const {
      email,
      full_name,
      job_title,
      company,
      years_experience,
      device,
      motivation,
      hours_available,
      source,
      turnstileToken,
    } = body;

    // Verifica Turnstile (anti-bot)
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!turnstileResult.success) {
      return turnstileFailedResponse(turnstileResult.error);
    }

    // Validazione
    if (!email || !full_name || !job_title || !years_experience || !device || !motivation || !hours_available) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori' },
        { status: 400 }
      );
    }

    // Verifica email valida
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Blocca email spam
    if (isSpamEmail(email)) {
      return spamEmailResponse();
    }

    // Verifica se email già registrata
    const { data: existing } = await supabase
      .from('beta_testers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Questa email è già registrata. Ti contatteremo presto!' },
        { status: 409 }
      );
    }

    // Conta tester attualmente approvati/attivi
    const { count: currentTesters } = await supabase
      .from('beta_testers')
      .select('*', { count: 'exact', head: true })
      .in('status', ['approved', 'active', 'pending_approval']);

    const spotsAvailable = (currentTesters || 0) < MAX_BETA_TESTERS;

    // Determina status:
    // - pending_approval: sarà approvato domani dal cron (posti disponibili)
    // - pending: waitlist (posti esauriti)
    const status = spotsAvailable ? 'pending_approval' : 'pending';

    // Inserisci candidatura
    const { data, error } = await supabase
      .from('beta_testers')
      .insert({
        email: email.toLowerCase(),
        full_name,
        job_title,
        company: company || null,
        years_experience,
        device,
        motivation,
        hours_available,
        source: source || null,
        status,
        cohort: null, // Assegnato al momento dell'approvazione
      })
      .select()
      .single();

    if (error) {
      console.error('Errore inserimento beta tester:', error);
      return NextResponse.json(
        { error: 'Errore durante la registrazione. Riprova più tardi.' },
        { status: 500 }
      );
    }

    // NON inviare email subito - il cron la invierà domani
    if (spotsAvailable) {
      // Sarà approvato domani
      return NextResponse.json({
        success: true,
        approved: false, // Non ancora approvato formalmente
        willBeApproved: true,
        message: 'Candidatura ricevuta! Riceverai conferma via email entro 24 ore.',
        id: data.id,
      });
    } else {
      // Posti esauriti: invia email waitlist
      const { count: waitlistPosition } = await supabase
        .from('beta_testers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const emailResult = await sendBetaWaitlistEmail({
        email: email.toLowerCase(),
        fullName: full_name,
        position: waitlistPosition || 1,
      });

      if (!emailResult.success) {
        console.error('Errore invio email waitlist:', emailResult.error);
      }

      return NextResponse.json({
        success: true,
        approved: false,
        message: 'Grazie! Sei in lista d\'attesa. Ti contatteremo appena si libera un posto.',
        id: data.id,
        waitlistPosition: waitlistPosition || 1,
      });
    }
  } catch (error) {
    console.error('Errore API beta/apply:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
