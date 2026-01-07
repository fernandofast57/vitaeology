import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface PillarScores {
  ESSERE: number;
  SENTIRE: number;
  PENSARE: number;
  AGIRE: number;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // 1. Ottieni profilo utente
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_path, subscription_tier, subscription_start_date')
      .eq('id', user.id)
      .single();

    // 2. Ottieni ultimo assessment completato
    const { data: assessment } = await supabase
      .from('user_assessments')
      .select(`
        id,
        book_id,
        books(slug),
        status
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    // 3. Ottieni i punteggi delle caratteristiche se assessment esiste
    let pillarScores: PillarScores = { ESSERE: 50, SENTIRE: 50, PENSARE: 50, AGIRE: 50 };

    if (assessment?.id) {
      const { data: charScores } = await supabase
        .from('characteristic_scores')
        .select(`
          score_percentage,
          characteristic_id,
          characteristics(pillar)
        `)
        .eq('assessment_id', assessment.id);

      if (charScores && charScores.length > 0) {
        const pillarCounts: PillarScores = { ESSERE: 0, SENTIRE: 0, PENSARE: 0, AGIRE: 0 };
        const pillarTotals: PillarScores = { ESSERE: 0, SENTIRE: 0, PENSARE: 0, AGIRE: 0 };

        charScores.forEach((cs: { score_percentage: number | null; characteristics: { pillar: string } | null }) => {
          const pillar = cs.characteristics?.pillar as keyof PillarScores;
          if (pillar && pillar in pillarTotals) {
            pillarTotals[pillar] += cs.score_percentage || 0;
            pillarCounts[pillar]++;
          }
        });

        // Calcola medie
        (Object.keys(pillarTotals) as Array<keyof PillarScores>).forEach(p => {
          if (pillarCounts[p] > 0) {
            pillarScores[p] = Math.round(pillarTotals[p] / pillarCounts[p]);
          }
        });
      }
    }

    // 4. Trova il pilastro più debole e più forte
    const sortedPillars = Object.entries(pillarScores)
      .sort(([,a], [,b]) => a - b);
    const lowestPillar = sortedPillars[0][0];
    const highestPillar = sortedPillars[3][0];

    // 5. Determina quale libro/percorso usare
    type BookWithSlug = { slug: string };
    const bookSlug = profile?.current_path ||
                     (assessment?.books as BookWithSlug | null)?.slug ||
                     'leadership';

    // 6. Ottieni esercizi già completati
    const { data: completed } = await supabase
      .from('user_exercise_progress')
      .select('exercise_id')
      .eq('user_id', user.id)
      .eq('status', 'completed');

    const completedIds = new Set((completed || []).map(c => c.exercise_id));

    // 7. Query esercizi disponibili per il percorso
    const { data: exercises } = await supabase
      .from('exercises')
      .select('*')
      .eq('book_slug', bookSlug)
      .eq('is_active', true)
      .order('week_number', { ascending: true });

    if (!exercises || exercises.length === 0) {
      return NextResponse.json({
        recommended: [],
        stats: { total_available: 0, completed: 0, remaining: 0 },
        pillar_focus: lowestPillar,
        book: bookSlug
      });
    }

    // 8. Calcola priorità e filtra
    const prioritized = exercises
      .filter(ex => !completedIds.has(ex.id))
      .map(ex => ({
        ...ex,
        priority: calculatePriority(ex, lowestPillar, highestPillar),
        reason: getReason(ex, lowestPillar)
      }))
      .sort((a, b) => b.priority - a.priority);

    // 9. Prendi i top 7
    const top7 = prioritized.slice(0, 7);

    return NextResponse.json({
      recommended: top7,
      stats: {
        total_available: exercises.length,
        completed: completedIds.size,
        remaining: prioritized.length
      },
      pillar_scores: pillarScores,
      pillar_focus: lowestPillar,
      pillar_strength: highestPillar,
      book: bookSlug
    });

  } catch (error) {
    console.error('Errore API recommended exercises:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli esercizi consigliati' },
      { status: 500 }
    );
  }
}

interface Exercise {
  source_type: string;
  pillar_primary: string;
  difficulty_level: string;
  week_number: number | null;
}

function calculatePriority(
  exercise: Exercise,
  lowestPillar: string,
  highestPillar: string
): number {
  let score = 0;

  // Esercizi core hanno priorità base alta
  if (exercise.source_type === 'core') score += 15;
  if (exercise.source_type === 'challenge_followup') score += 12;
  if (exercise.source_type === 'standard') score += 5;
  if (exercise.source_type === 'advanced') score += 3;

  // Esercizi del pilastro più debole hanno priorità massima
  if (exercise.pillar_primary === lowestPillar) score += 20;

  // Un esercizio del pilastro più forte per mantenimento
  if (exercise.pillar_primary === highestPillar) score += 5;

  // Difficoltà base prima (per chi inizia)
  const difficultyBonus: Record<string, number> = {
    'base': 8,
    'intermedio': 4,
    'avanzato': 1
  };
  score += difficultyBonus[exercise.difficulty_level] || 0;

  // Week number basso = prima nel percorso
  if (exercise.week_number) {
    score += Math.max(0, 10 - Math.floor(exercise.week_number / 5));
  }

  return score;
}

function getReason(
  exercise: Exercise,
  lowestPillar: string
): string {
  if (exercise.source_type === 'challenge_followup') {
    return 'Consolida la tua Challenge';
  }
  if (exercise.pillar_primary === lowestPillar) {
    const pillarNames: Record<string, string> = {
      'ESSERE': 'la tua Identità',
      'SENTIRE': 'le tue Relazioni',
      'PENSARE': 'il tuo Pensiero Strategico',
      'AGIRE': 'la tua Capacità di Azione'
    };
    return `Rafforza ${pillarNames[lowestPillar] || lowestPillar}`;
  }
  if (exercise.source_type === 'core') {
    return 'Esercizio fondamentale del percorso';
  }
  return 'Parte del tuo percorso settimanale';
}
