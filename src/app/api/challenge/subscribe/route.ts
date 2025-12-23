// API per gestire iscrizioni alle Challenge con tracking A/B

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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
  try {
    const body = await request.json();
    const { email, nome, challenge, variant, utmSource, utmMedium, utmCampaign } = body;

    // Validazione
    if (!email || !challenge) {
      return NextResponse.json(
        { error: 'Email e challenge sono obbligatori' },
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
        subscribed_at: new Date().toISOString(),
        current_day: 0,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
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
    } catch (resendError) {
      console.error('Resend contact error:', resendError);
      // Non bloccare se Resend fallisce
    }

    // Invia email di benvenuto
    try {
      await resend.emails.send({
        from: 'Fernando <fernando@vitaeology.com>',
        replyTo: 'fernando@vitaeology.com',
        to: email,
        subject: config.emailSubject,
        html: generateWelcomeEmail(nome || 'Amico/a', challenge, config),
        tags: [{ name: 'challenge', value: config.tag }]
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Non bloccare se email fallisce
    }

    return NextResponse.json({
      success: true,
      message: 'Iscrizione completata!',
      subscriberId: subscriber.id
    });

  } catch (error) {
    console.error('Challenge subscribe error:', error);
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
