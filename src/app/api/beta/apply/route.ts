// POST /api/beta/apply - Candidatura pubblica beta tester
// Auto-approva se ci sono posti disponibili, altrimenti waitlist

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { sendBetaWelcomeEmail, sendBetaWaitlistEmail } from '@/lib/email/beta-tester-emails';
import { checkRateLimit, getClientIP, RATE_LIMITS, rateLimitExceededResponse, validateEmail } from '@/lib/rate-limiter';
import { verifyTurnstileToken, turnstileFailedResponse } from '@/lib/turnstile';
import { validateName, isDefinitelySpam, shouldFlagForReview } from '@/lib/validation/name-validator';
import { isIPBlocked, blockIP, blockedIPResponse } from '@/lib/validation/ip-blocklist';
import { logSignupAttempt, shouldAutoBlockIP } from '@/lib/validation/signup-logger';

// Configurazione posti disponibili
const MAX_BETA_TESTERS = 20;

export async function POST(request: Request) {
  // Rate limiting: max 5 richieste per minuto per IP
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || undefined;

  // 0. Verifica IP blocklist
  const ipBlockCheck = await isIPBlocked(clientIP);
  if (ipBlockCheck.isBlocked) {
    return blockedIPResponse();
  }

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
      preferred_challenge, // Challenge da ADS: leadership-autentica|oltre-ostacoli|microfelicita
      utm_content, // Creatività ADS: leadership_emotivo|leadership_pratico|etc.
    } = body;

    // Verifica Turnstile (anti-bot)
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!turnstileResult.success) {
      await logSignupAttempt({
        email: email || 'missing',
        name: full_name,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: false,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: 'turnstile_failed',
        success: false,
        source: 'beta',
        metadata: { job_title, company },
      });
      return turnstileFailedResponse(turnstileResult.error);
    }

    // Validazione campi obbligatori
    if (!email || !full_name || !job_title || !years_experience || !device || !motivation || !hours_available) {
      return NextResponse.json(
        { error: 'Compila tutti i campi obbligatori' },
        { status: 400 }
      );
    }

    // Validazione email completa (formato + spam + domini disposable)
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      await logSignupAttempt({
        email,
        name: full_name,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: false,
        nameSuspicionScore: 0,
        blocked: true,
        blockReason: `email_invalid: ${emailValidation.reason}`,
        success: false,
        source: 'beta',
        metadata: { job_title, company },
      });
      return NextResponse.json(
        { error: emailValidation.reason || 'Email non valida' },
        { status: 400 }
      );
    }

    // Validazione nome (anti-spam)
    const nameValidation = validateName(full_name);
    const nameSuspicionScore = nameValidation.suspicionScore;

    if (isDefinitelySpam(nameValidation)) {
      await logSignupAttempt({
        email,
        name: full_name,
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: true,
        nameSuspicionScore,
        blocked: true,
        blockReason: `spam_name: ${nameValidation.flags.join(', ')}`,
        success: false,
        source: 'beta',
        metadata: { job_title, company },
      });

      // Auto-block IP se troppi tentativi spam
      const autoBlockCheck = await shouldAutoBlockIP(clientIP);
      if (autoBlockCheck.shouldBlock) {
        await blockIP(clientIP, autoBlockCheck.reason || 'Too many spam attempts', 24);
      }

      return NextResponse.json(
        { error: nameValidation.reason || 'Il nome inserito non è valido' },
        { status: 400 }
      );
    }

    // Flag per review se sospetto ma non definitivamente spam
    const flagForReview = shouldFlagForReview(nameValidation);

    // Verifica se email già registrata
    const { data: existing } = await getServiceClient()
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
    const { count: currentTesters } = await getServiceClient()
      .from('beta_testers')
      .select('*', { count: 'exact', head: true })
      .in('status', ['approved', 'active', 'pending_approval']);

    const spotsAvailable = (currentTesters || 0) < MAX_BETA_TESTERS;

    // Determina status:
    // - pending_approval: sarà approvato domani dal cron (posti disponibili)
    // - pending: waitlist (posti esauriti)
    const status = spotsAvailable ? 'pending_approval' : 'pending';

    // Inserisci candidatura
    const { data, error } = await getServiceClient()
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
        preferred_challenge: preferred_challenge || null, // Challenge da ADS
        utm_content: utm_content || null, // Creatività ADS per A/B testing
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

    // Log tentativo riuscito
    await logSignupAttempt({
      email: email.toLowerCase(),
      name: full_name,
      ipAddress: clientIP,
      userAgent,
      turnstilePassed: true,
      emailValid: true,
      nameSuspicionScore,
      blocked: false,
      success: true,
      source: 'beta',
      metadata: {
        job_title,
        company,
        status,
        flaggedForReview: flagForReview,
        betaTesterId: data.id,
      },
    });

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
      const { count: waitlistPosition } = await getServiceClient()
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

    // Log errore
    try {
      await logSignupAttempt({
        email: 'error',
        ipAddress: clientIP,
        userAgent,
        turnstilePassed: true,
        emailValid: true,
        nameSuspicionScore: 0,
        blocked: false,
        blockReason: 'server_error',
        success: false,
        source: 'beta',
      });
    } catch {
      // Ignora errori di logging
    }

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
