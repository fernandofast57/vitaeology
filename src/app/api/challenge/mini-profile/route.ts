import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { calculateDiscoveryProfile, ChallengeType } from '@/lib/challenge/discovery-data';

/**
 * GET /api/challenge/mini-profile?type=leadership|ostacoli|microfelicita
 *
 * Calcola il mini-profilo basato sulle risposte Discovery dell'utente.
 * Restituisce punteggi per dimensione e totale.
 */
export async function GET(request: NextRequest) {
  // 1. Autenticazione
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  // 2. Parametro type
  const searchParams = request.nextUrl.searchParams;
  const challengeType = searchParams.get('type') as ChallengeType;

  if (!challengeType || !['leadership', 'ostacoli', 'microfelicita'].includes(challengeType)) {
    return NextResponse.json({ error: 'Tipo challenge non valido' }, { status: 400 });
  }

  // 3. Recupera risposte da DB
  const { data: responses, error: dbError } = await supabase
    .from('challenge_discovery_responses')
    .select('day_number, question_number, response')
    .eq('user_id', user.id)
    .eq('challenge_type', challengeType)
    .order('day_number')
    .order('question_number');

  if (dbError) {
    console.error('Errore DB mini-profile:', dbError);
    return NextResponse.json({ error: 'Errore database' }, { status: 500 });
  }

  if (!responses || responses.length === 0) {
    return NextResponse.json({ error: 'Nessuna risposta trovata' }, { status: 404 });
  }

  // 4. Trasforma le risposte nel formato atteso da calculateDiscoveryProfile
  // DB: { day_number: 1-7, question_number: 1-3, response: A/B/C }
  // Funzione: Record<dayNumber, Record<questionIndex, response>>
  // Nota: question_number è 1-based, questionIndex è 0-based
  const formattedResponses: Record<number, Record<number, 'A' | 'B' | 'C'>> = {};

  for (const r of responses) {
    const dayNumber = r.day_number;
    const questionIndex = r.question_number - 1; // Converti da 1-based a 0-based
    const response = r.response as 'A' | 'B' | 'C';

    if (!formattedResponses[dayNumber]) {
      formattedResponses[dayNumber] = {};
    }
    formattedResponses[dayNumber][questionIndex] = response;
  }

  // 5. Calcola il profilo usando la funzione esistente
  const profile = calculateDiscoveryProfile(challengeType, formattedResponses);

  // 6. Restituisci il profilo
  return NextResponse.json({
    success: true,
    profile
  });
}
