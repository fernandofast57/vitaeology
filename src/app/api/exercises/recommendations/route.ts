// API Raccomandazioni Esercizi
// Prioritizza esercizi basandosi su: assessment scores, pillar deboli, percorso utente

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // 1. Verifica utente e ottieni profilo
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_path, subscription_tier, subscription_start_date')
    .eq('id', user.id)
    .single();

  // 2. Ottieni ultimo assessment completato
  const { data: assessment } = await supabase
    .from('user_assessments_v2')
    .select(`
      id,
      assessment_type,
      total_score,
      completed_at
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  // 3. Ottieni punteggi caratteristiche se assessment esiste
  let pillarScores: Record<string, number> = { ESSERE: 0, SENTIRE: 0, PENSARE: 0, AGIRE: 0 };
  let pillarCounts: Record<string, number> = { ESSERE: 0, SENTIRE: 0, PENSARE: 0, AGIRE: 0 };

  if (assessment?.id) {
    const { data: charScores } = await supabase
      .from('user_answers_v2')
      .select(`
        score,
        assessment_questions_v2!inner(
          characteristics!inner(pillar)
        )
      `)
      .eq('session_id', assessment.id);

    if (charScores) {
      charScores.forEach((cs: any) => {
        const pillar = cs.assessment_questions_v2?.characteristics?.pillar;
        if (pillar && pillarScores.hasOwnProperty(pillar)) {
          pillarScores[pillar] += cs.score || 0;
          pillarCounts[pillar]++;
        }
      });

      // Media per pillar
      Object.keys(pillarScores).forEach(p => {
        if (pillarCounts[p] > 0) {
          pillarScores[p] = pillarScores[p] / pillarCounts[p];
        }
      });
    }
  }

  // 4. Trova pillar più basso e più alto
  const sortedPillars = Object.entries(pillarScores)
    .sort(([,a], [,b]) => a - b);
  const lowestPillar = sortedPillars[0][0];
  const highestPillar = sortedPillars[3][0];

  // 5. Determina quale libro/percorso
  const assessmentToBook: Record<string, string> = {
    'lite': 'leadership',
    'risolutore': 'risolutore',
    'microfelicita': 'microfelicita'
  };
  const bookSlug = profile?.current_path ||
                   assessmentToBook[assessment?.assessment_type || 'lite'] ||
                   'leadership';

  // 6. Calcola settimana corrente utente
  const subscriptionStart = profile?.subscription_start_date
    ? new Date(profile.subscription_start_date)
    : new Date();
  const now = new Date();
  const diffMs = now.getTime() - subscriptionStart.getTime();
  const currentWeek = Math.min(
    Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1,
    52
  );

  // 7. Query esercizi raccomandati (sbloccati per settimana)
  const { data: recommended } = await supabase
    .from('exercises')
    .select('*')
    .eq('book_slug', bookSlug)
    .eq('is_active', true)
    .lte('week_number', currentWeek) // Solo esercizi sbloccati
    .order('week_number', { ascending: true });

  // 8. Ottieni esercizi già completati
  const { data: completed } = await supabase
    .from('user_exercise_progress')
    .select('exercise_id')
    .eq('user_id', user.id)
    .eq('status', 'completed');

  const completedIds = new Set((completed || []).map(c => c.exercise_id));

  // 9. Ordina per priorità
  const prioritized = (recommended || []).map(ex => ({
    ...ex,
    priority: calculatePriority(ex, lowestPillar, highestPillar, currentWeek),
    reason: getReason(ex, lowestPillar, bookSlug),
    isCompleted: completedIds.has(ex.id)
  })).sort((a, b) => b.priority - a.priority);

  // 10. Filtra completati e limita
  const notCompleted = prioritized.filter(ex => !ex.isCompleted);
  const top7 = notCompleted.slice(0, 7);

  return NextResponse.json({
    recommended: top7,
    stats: {
      total_available: prioritized.length,
      completed: completedIds.size,
      remaining: notCompleted.length,
      current_week: currentWeek
    },
    pillar_focus: lowestPillar,
    pillar_scores: pillarScores,
    book: bookSlug
  });
}

function calculatePriority(
  exercise: any,
  lowestPillar: string,
  highestPillar: string,
  currentWeek: number
): number {
  let score = 0;

  // Core esercizi hanno priorità base alta
  if (exercise.source_type === 'original') score += 10;
  if (exercise.source_type === 'core') score += 10;
  if (exercise.source_type === 'challenge_followup') score += 8;

  // Esercizi del pillar più basso hanno priorità maggiore
  if (exercise.pillar_primary === lowestPillar) {
    score += 15;
  }

  // Esercizi del pillar più alto hanno priorità minore
  if (exercise.pillar_primary === highestPillar) {
    score -= 5;
  }

  // Esercizi della settimana corrente hanno boost
  if (exercise.week_number === currentWeek) {
    score += 20;
  }

  // Esercizi recenti (ultima settimana) hanno leggero boost
  if (exercise.week_number >= currentWeek - 1) {
    score += 5;
  }

  // Difficoltà base più accessibile all'inizio
  if (exercise.difficulty_level === 'base') {
    score += 3;
  } else if (exercise.difficulty_level === 'avanzato') {
    score -= 2;
  }

  return score;
}

function getReason(exercise: any, lowestPillar: string, bookSlug: string): string {
  const reasons: string[] = [];

  if (exercise.pillar_primary === lowestPillar) {
    const pillarNames: Record<string, string> = {
      'ESSERE': 'Visione',
      'SENTIRE': 'Relazioni',
      'PENSARE': 'Adattamento',
      'AGIRE': 'Azione'
    };
    reasons.push(`Rafforza il pilastro ${pillarNames[lowestPillar] || lowestPillar}`);
  }

  if (exercise.source_type === 'core' || exercise.source_type === 'original') {
    reasons.push('Esercizio fondamentale del percorso');
  }

  if (exercise.source_type === 'challenge_followup') {
    reasons.push('Consolida i concetti della Challenge');
  }

  const bookNames: Record<string, string> = {
    'leadership': 'Leadership Autentica',
    'risolutore': 'Oltre gli Ostacoli',
    'microfelicita': 'Microfelicità'
  };

  if (reasons.length === 0) {
    reasons.push(`Parte del percorso ${bookNames[bookSlug] || bookSlug}`);
  }

  return reasons.join(' • ');
}
