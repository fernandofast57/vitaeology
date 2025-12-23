// API per completamento giorno challenge
// Gestisce: salvataggio risposte, invio email successiva, tracking completamento

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Dynamic import to avoid build issues
let emailTemplates: typeof import('@/lib/email/challenge-day-templates') | null = null;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

// Mappa challenge type dal frontend al database
const CHALLENGE_TYPE_MAP: Record<string, string> = {
  'leadership': 'leadership-autentica',
  'leadership-autentica': 'leadership-autentica',
  'ostacoli': 'oltre-ostacoli',
  'oltre-ostacoli': 'oltre-ostacoli',
  'microfelicita': 'microfelicita'
};

interface CompleteRequestBody {
  email: string;
  challengeType: string;
  dayNumber: number;
  responses?: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Load email templates dynamically
    if (!emailTemplates) {
      emailTemplates = await import('@/lib/email/challenge-day-templates');
    }
    const { getChallengeEmail, CHALLENGE_CONFIG } = emailTemplates;

    const body: CompleteRequestBody = await request.json();
    const { email, challengeType, dayNumber, responses } = body;

    // Validazione input
    if (!email || !challengeType || !dayNumber) {
      return NextResponse.json(
        { error: 'Email, challengeType e dayNumber sono obbligatori' },
        { status: 400 }
      );
    }

    // Normalizza challenge type
    const normalizedChallenge = CHALLENGE_TYPE_MAP[challengeType];
    if (!normalizedChallenge) {
      return NextResponse.json(
        { error: 'Tipo challenge non valido' },
        { status: 400 }
      );
    }

    // Valida day number
    if (dayNumber < 1 || dayNumber > 7) {
      return NextResponse.json(
        { error: 'Numero giorno deve essere tra 1 e 7' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Trova subscriber
    const { data: subscriber, error: subscriberError } = await supabase
      .from('challenge_subscribers')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('challenge', normalizedChallenge)
      .single();

    if (subscriberError || !subscriber) {
      return NextResponse.json(
        { error: 'Iscrizione non trovata per questa email e challenge' },
        { status: 404 }
      );
    }

    // 2. Verifica se giorno gia completato
    const { data: existingCompletion } = await supabase
      .from('challenge_day_completions')
      .select('id')
      .eq('subscriber_id', subscriber.id)
      .eq('challenge', normalizedChallenge)
      .eq('day_number', dayNumber)
      .not('action_completed_at', 'is', null)
      .single();

    if (existingCompletion) {
      return NextResponse.json(
        { error: 'Questo giorno è già stato completato' },
        { status: 409 }
      );
    }

    // 3. Inserisci/aggiorna record completamento giorno
    const { error: completionError } = await supabase
      .from('challenge_day_completions')
      .upsert({
        subscriber_id: subscriber.id,
        challenge: normalizedChallenge,
        day_number: dayNumber,
        action_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'subscriber_id,challenge,day_number'
      });

    if (completionError) {
      console.error('Errore salvataggio completamento:', completionError);
      return NextResponse.json(
        { error: 'Errore nel salvataggio del completamento' },
        { status: 500 }
      );
    }

    // 4. Salva risposte se fornite (in ab_test_events come metadata)
    if (responses && responses.length > 0) {
      await supabase.from('ab_test_events').insert({
        challenge: normalizedChallenge,
        variant: subscriber.variant || 'A',
        event_type: 'day_completed',
        subscriber_id: subscriber.id,
        metadata: {
          day_number: dayNumber,
          responses: responses
        },
        created_at: new Date().toISOString()
      });
    }

    const resend = getResendClient();
    let emailSent = false;
    let nextDay: number | undefined;

    // 5. Gestisci email in base al giorno
    if (dayNumber < 7) {
      // Invia email giorno successivo
      nextDay = dayNumber + 1;

      try {
        const emailContent = getChallengeEmail(
          normalizedChallenge,
          nextDay as 1 | 2 | 3 | 4 | 5 | 6 | 7,
          subscriber.nome || 'Amico/a'
        );

        const config = CHALLENGE_CONFIG[normalizedChallenge as keyof typeof CHALLENGE_CONFIG];

        await resend.emails.send({
          from: 'Fernando <fernando@vitaeology.com>',
          replyTo: 'fernando@vitaeology.com',
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          tags: [{ name: 'challenge', value: config?.tag || 'challenge' }]
        });

        emailSent = true;

        // Registra invio email nel day_completions del giorno successivo
        await supabase
          .from('challenge_day_completions')
          .upsert({
            subscriber_id: subscriber.id,
            challenge: normalizedChallenge,
            day_number: nextDay,
            email_sent_at: new Date().toISOString()
          }, {
            onConflict: 'subscriber_id,challenge,day_number'
          });

      } catch (emailError) {
        console.error('Errore invio email giorno successivo:', emailError);
        // Non bloccare - email fallita ma completamento registrato
      }

      // Aggiorna subscriber
      await supabase
        .from('challenge_subscribers')
        .update({
          current_day: nextDay,
          last_email_sent_at: emailSent ? new Date().toISOString() : subscriber.last_email_sent_at,
          last_email_type: emailSent ? `day_${nextDay}` : subscriber.last_email_type
        })
        .eq('id', subscriber.id);

    } else {
      // Giorno 7 completato - challenge finita!
      try {
        // Invia email di conversione/congratulazioni
        await resend.emails.send({
          from: 'Fernando <fernando@vitaeology.com>',
          replyTo: 'fernando@vitaeology.com',
          to: email,
          subject: 'Complimenti! Hai completato la Sfida dei 7 Giorni',
          html: generateCompletionEmail(
            subscriber.nome || 'Amico/a',
            normalizedChallenge,
            CHALLENGE_CONFIG
          ),
          tags: [{ name: 'challenge', value: 'challenge-completed' }]
        });

        emailSent = true;
      } catch (emailError) {
        console.error('Errore invio email completamento:', emailError);
      }

      // Marca challenge come completata
      await supabase
        .from('challenge_subscribers')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          current_day: 7,
          last_email_sent_at: emailSent ? new Date().toISOString() : subscriber.last_email_sent_at,
          last_email_type: 'completion'
        })
        .eq('id', subscriber.id);

      // Registra evento completamento challenge
      await supabase.from('ab_test_events').insert({
        challenge: normalizedChallenge,
        variant: subscriber.variant || 'A',
        event_type: 'completed',
        subscriber_id: subscriber.id,
        metadata: {
          completed_at: new Date().toISOString(),
          total_days: 7
        },
        created_at: new Date().toISOString()
      });
    }

    // Response
    const response: {
      success: boolean;
      message: string;
      nextDay?: number;
      emailSent: boolean;
      isCompleted: boolean;
    } = {
      success: true,
      message: dayNumber < 7
        ? `Giorno ${dayNumber} completato! Email giorno ${nextDay} inviata.`
        : 'Complimenti! Hai completato la Sfida dei 7 Giorni!',
      emailSent,
      isCompleted: dayNumber === 7
    };

    if (nextDay) {
      response.nextDay = nextDay;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Errore API complete-day:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Email di completamento challenge
function generateCompletionEmail(nome: string, challenge: string, challengeConfig: Record<string, { color: string; name: string }>): string {
  const CHALLENGE_CONFIG = challengeConfig;
  const config = CHALLENGE_CONFIG[challenge as keyof typeof CHALLENGE_CONFIG];
  const color = config?.color || '#D4AF37';
  const challengeName = config?.name || 'Sfida';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.7; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="text-align: center; margin-bottom: 30px;">
    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
    <h1 style="color: ${color}; margin: 0;">Complimenti, ${nome}!</h1>
    <p style="color: #666; font-size: 18px;">Hai completato la ${challengeName}</p>
  </div>

  <p>Ciao ${nome},</p>

  <p>Ce l'hai fatta. <strong>7 giorni di crescita personale</strong>, completati.</p>

  <p>In questi 7 giorni hai:</p>
  <ul>
    <li>Scoperto capacità che già possiedi</li>
    <li>Imparato strumenti pratici da usare ogni giorno</li>
    <li>Fatto esercizi concreti che ti hanno dato risultati immediati</li>
  </ul>

  <p>Ma questo e solo l'inizio.</p>

  <div style="background: linear-gradient(135deg, ${color}22, ${color}11); padding: 25px; border-radius: 12px; margin: 30px 0;">
    <h2 style="color: ${color}; margin-top: 0;">Il Prossimo Passo</h2>
    <p>Se hai trovato valore in questi 7 giorni, immagina cosa potresti ottenere con un <strong>percorso completo</strong> di sviluppo personale.</p>
    <p>Vitaeology offre programmi strutturati per costruire il tuo percorso di trasformazione profonda, con:</p>
    <ul>
      <li>Assessment completo delle tue capacità</li>
      <li>Esercizi personalizzati sulla tua situazione</li>
      <li>AI Coach disponibile 24/7</li>
      <li>Tracking dei progressi nel tempo</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://vitaeology.com/assessment" style="display: inline-block; background: ${color}; color: white; font-weight: bold; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 18px;">
      Scopri il tuo potenziale completo →
    </a>
  </div>

  <p>Grazie per aver fatto questo percorso con me.</p>

  <p>Un abbraccio,</p>
  <p><strong>Fernando Marongiu</strong><br>
  <span style="color: #666; font-size: 14px;">Fondatore Vitaeology</span></p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="font-size: 12px; color: #999; text-align: center;">
    Hai completato la Sfida ${challengeName}. Questa e l'ultima email della serie.<br>
    <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color: #999;">Cancella iscrizione</a>
  </p>

</body>
</html>
  `;
}
// forced redeploy lun 22 dic 2025 17:19:03
