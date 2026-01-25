// API per completamento giorno challenge
// Gestisce: salvataggio risposte, invio email successiva, tracking completamento

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { CHALLENGE_TO_ASSESSMENT, grantAssessmentAccess } from '@/lib/assessment-access';
import { sendChallengeEmail } from '@/lib/email/challenge-emails';
import { onChallengeDayCompleted } from '@/lib/awareness';
import { alertAPIError } from '@/lib/error-alerts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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
  // responses ora salvate direttamente in challenge_discovery_responses dal frontend
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteRequestBody = await request.json();
    const { email, challengeType, dayNumber } = body;

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

    // 2. Verifica se giorno è sbloccato (user agency: deve aver completato i precedenti)
    // Regola: Day 1 sempre sbloccato, Day N sbloccato se current_day >= N-1
    const currentDay = subscriber.current_day || 0;
    const isDayUnlocked = dayNumber === 1 || dayNumber <= currentDay + 1;

    if (!isDayUnlocked) {
      return NextResponse.json(
        { error: `Devi completare prima il Giorno ${dayNumber - 1}` },
        { status: 403 }
      );
    }

    // 3. Verifica se giorno gia completato
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
      return NextResponse.json(
        { error: 'Errore nel salvataggio del completamento' },
        { status: 500 }
      );
    }

    // Aggiorna awareness level per giorno completato (non giorno 7 che ha hook separato)
    if (dayNumber < 7) {
      onChallengeDayCompleted(email, dayNumber).catch(() => {});
    }

    // 4. Traccia evento completamento giorno in ab_test_events (senza risposte - quelle vanno in challenge_discovery_responses)
    await supabase.from('ab_test_events').insert({
      challenge: normalizedChallenge,
      variant: subscriber.variant || 'A',
      event_type: 'day_completed',
      subscriber_id: subscriber.id,
      metadata: {
        day_number: dayNumber
      },
      created_at: new Date().toISOString()
    });

    let emailSent = false;
    let nextDay: number | undefined;

    // Cast challenge type per sendChallengeEmail
    type ChallengeType = 'leadership-autentica' | 'oltre-ostacoli' | 'microfelicita';
    const challengeTypeForEmail = normalizedChallenge as ChallengeType;

    // 5. Gestisci completamento in base al giorno
    if (dayNumber < 7) {
      // Giorno 1-6 completato
      // NON inviare email immediata - il cron job la invierà domani (user agency)
      nextDay = dayNumber + 1;

      // Aggiorna subscriber: current_day = giorno APPENA COMPLETATO
      // SEMANTICA: current_day = ultimo giorno completato dall'utente
      await supabase
        .from('challenge_subscribers')
        .update({
          current_day: dayNumber,  // Il giorno che l'utente ha APPENA completato
          last_activity_at: new Date().toISOString()
          // NON aggiornare last_email_sent_at e last_email_type
          // Il cron job verificherà current_day per decidere quale email inviare
        })
        .eq('id', subscriber.id);

    } else {
      // Giorno 7 completato - challenge finita!
      try {
        const result = await sendChallengeEmail(
          email,
          'challenge_complete',
          challengeTypeForEmail,
          undefined,
          subscriber.nome || undefined
        );

        emailSent = result.success;
      } catch {
        // Errore email silenzioso - non blocca il completamento
      }

      // Marca challenge come completata con last_activity_at
      await supabase
        .from('challenge_subscribers')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          current_day: 7,
          last_email_sent_at: emailSent ? new Date().toISOString() : subscriber.last_email_sent_at,
          last_email_type: 'challenge_complete'
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

      // Aggiorna awareness level (challenge completata)
      onChallengeDayCompleted(email, 7).catch(() => {});

      // Concedi accesso all'assessment corrispondente
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (profile) {
        const assessmentType = CHALLENGE_TO_ASSESSMENT[normalizedChallenge];
        if (assessmentType) {
          await grantAssessmentAccess(
            supabase,
            profile.id,
            assessmentType,
            'challenge_complete',
            subscriber.id
          );
        }
      }
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
        ? `Giorno ${dayNumber} completato! Riceverai l'email del Giorno ${nextDay} domani mattina.`
        : 'Complimenti! Hai completato la Sfida dei 7 Giorni!',
      emailSent,
      isCompleted: dayNumber === 7
    };

    if (nextDay) {
      response.nextDay = nextDay;
    }

    return NextResponse.json(response);

  } catch (error) {
    await alertAPIError(
      '/api/challenge/complete-day',
      error instanceof Error ? error : new Error('Challenge day completion failed')
    );
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Email gestite da sendChallengeEmail in @/lib/email/challenge-emails.ts
