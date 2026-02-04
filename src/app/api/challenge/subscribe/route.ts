// API per gestire iscrizioni alle Challenge con tracking A/B

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { alertAPIError } from '@/lib/error-alerts';
import { checkRateLimit, getClientIP, RATE_LIMITS, rateLimitExceededResponse, validateEmail } from '@/lib/rate-limiter';
import { verifyTurnstileToken, turnstileFailedResponse } from '@/lib/turnstile';

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

// Email templates per ogni challenge
const CHALLENGE_CONFIG = {
  'leadership-autentica': {
    name: 'Leadership Autentica',
    color: '#D4AF37', // Gold Vitaeology
    emailSubject: 'Giorno 1: Il Fuoco Interno — La Sfida Inizia',
    tag: 'challenge-leadership'
  },
  'oltre-ostacoli': {
    name: 'Oltre gli Ostacoli',
    color: '#10B981', // Emerald
    emailSubject: 'Giorno 1: Il Filtro dei Pattern — La Sfida Inizia',
    tag: 'challenge-ostacoli'
  },
  'microfelicita': {
    name: 'Microfelicità',
    color: '#8B5CF6', // Violet
    emailSubject: 'Giorno 1: Il Segnale Debole — La Sfida Inizia',
    tag: 'challenge-microfelicita'
  }
};

export async function POST(request: NextRequest) {
  // Rate limiting: max 5 richieste per minuto per IP
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP, RATE_LIMITS.publicForm);

  if (!rateLimit.success) {
    return rateLimitExceededResponse(rateLimit.resetIn);
  }

  try {
    const body = await request.json();
    const { email, nome, challenge, variant, utmSource, utmMedium, utmCampaign, utmContent, turnstileToken } = body;

    // Verifica Turnstile (anti-bot)
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIP);
    if (!turnstileResult.success) {
      return turnstileFailedResponse(turnstileResult.error);
    }

    // Validazione base
    if (!email || !challenge) {
      return NextResponse.json(
        { error: 'Email e challenge sono obbligatori' },
        { status: 400 }
      );
    }

    // Validazione email completa (formato + spam + domini disposable)
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.reason || 'Email non valida' },
        { status: 400 }
      );
    }

    const config = CHALLENGE_CONFIG[challenge as keyof typeof CHALLENGE_CONFIG];
    if (!config) {
      return NextResponse.json(
        { error: 'Challenge non valida' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const resend = getResendClient();

    // Controlla se già iscritto a questa challenge
    const { data: existing } = await supabase
      .from('challenge_subscribers')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('challenge', challenge)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Sei già iscritto a questa sfida!' },
        { status: 409 }
      );
    }

    // Salva iscrizione con dati A/B
    const { data: subscriber, error: insertError } = await supabase
      .from('challenge_subscribers')
      .insert({
        email: email.toLowerCase(),
        nome: nome || null,
        challenge,
        variant: variant || 'A',
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        utm_content: utmContent || null,
        subscribed_at: new Date().toISOString(),
        current_day: 0,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Errore nel salvataggio' },
        { status: 500 }
      );
    }

    // Traccia conversione per A/B testing
    await supabase.from('ab_test_events').insert({
      challenge,
      variant: variant || 'A',
      event_type: 'signup',
      subscriber_id: subscriber.id,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      created_at: new Date().toISOString()
    });

    // Aggiungi a Resend audience con tag
    try {
      if (process.env.RESEND_AUDIENCE_ID) {
        await resend.contacts.create({
          email: email.toLowerCase(),
          firstName: nome || undefined,
          unsubscribed: false,
          audienceId: process.env.RESEND_AUDIENCE_ID
        });
      }
    } catch {
      // Errore Resend silenzioso - non blocca l'iscrizione
    }

    // Invia email di benvenuto
    let welcomeEmailSent = false;
    try {
      const { error: emailError } = await resend.emails.send({
        from: 'Fernando <fernando@vitaeology.com>',
        replyTo: 'fernando@vitaeology.com',
        to: email,
        subject: config.emailSubject,
        html: generateWelcomeEmail(nome || 'Amico/a', challenge, config),
        tags: [{ name: 'challenge', value: config.tag }]
      });

      if (!emailError) {
        welcomeEmailSent = true;
      }
    } catch {
      // Errore email silenzioso - non blocca l'iscrizione
    }

    // Aggiorna subscriber con info email inviata (CRITICO per il cron job)
    // NOTA: current_day rimane 0 - significa "iscritto, nessun giorno completato"
    // L'utente deve COMPLETARE Day 1 per passare a current_day: 1
    if (welcomeEmailSent) {
      await supabase
        .from('challenge_subscribers')
        .update({
          last_email_sent_at: new Date().toISOString(),
          last_email_type: 'welcome'
          // current_day rimane 0 - verrà incrementato quando l'utente completa il giorno
        })
        .eq('id', subscriber.id);

      // Log evento email per analytics (non bloccare se fallisce)
      try {
        await supabase.from('challenge_email_events').insert({
          subscriber_id: subscriber.id,
          challenge,
          day_number: 0,
          event_type: 'sent',
          created_at: new Date().toISOString()
        });
      } catch {
        // Ignora errori di logging
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Iscrizione completata!',
      subscriberId: subscriber.id
    });

  } catch (error) {
    await alertAPIError(
      '/api/challenge/subscribe',
      error instanceof Error ? error : new Error('Challenge subscription failed')
    );
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

function generateWelcomeEmail(nome: string, challenge: string, config: typeof CHALLENGE_CONFIG[keyof typeof CHALLENGE_CONFIG]) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: ${config.color}; margin-bottom: 5px;">La Sfida Inizia</h1>
    <p style="color: #666; font-size: 14px;">${config.name} - Giorno 1 di 7</p>
  </div>

  <p>Ciao ${nome},</p>

  <p>Benvenuto nella <strong>Sfida dei 7 Giorni</strong>.</p>

  <p>Ogni giorno riceverai un'email con:</p>
  <ul>
    <li>Una storia o situazione da esplorare (5 minuti)</li>
    <li>Domande per riflettere (10 minuti)</li>
    <li>Un'azione concreta da compiere (5 minuti)</li>
  </ul>

  <p>Il Giorno 1 completo arriverà tra qualche ora. Nel frattempo, una domanda per prepararti:</p>

  <div style="background: #f5f5f5; padding: 20px; border-left: 4px solid ${config.color}; margin: 20px 0;">
    <p style="margin: 0; font-style: italic;">
      "Qual è l'ultima volta che hai riconosciuto qualcosa di prezioso in te stesso/a,
      senza che qualcuno te lo dovesse dire?"
    </p>
  </div>

  <p>Non serve rispondere ora. Lascia che la domanda lavori.</p>

  <p>A presto,</p>
  <p><strong>Fernando Marongiu</strong><br>
  <span style="color: #666; font-size: 14px;">Fondatore Vitaeology</span></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Hai ricevuto questa email perché ti sei iscritto alla Sfida ${config.name}.<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999;">Cancella iscrizione</a>
  </p>

</body>
</html>
  `;
}
